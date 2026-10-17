"""Utak egy kör alakú régióra (Overture Maps transportation, OpenStreetMap alapú, ODbL).

Az útszakaszok (segment, subtype=road) vonalait gyűjti ki a régió köréből (+3 km), osztályukkal együtt
(autópálya, főút, mellékút, lakóutca, szervizút, földút, gyalogút…). A kimenet egy JSON-lista:
[[osztály, [[szélesség, hosszúság], ...]], ...] — ebből készül a fák és épületek nélküli útsáv
(tools/build_canopy.py), és ugyanez kerül a térképes változatba is.

Használat: python3 tools/build_roads.py <kimenet.json> <szélesség> <hosszúság> <sugár_km> [szálak=12]
"""
import json, math, os, sys, time
import concurrent.futures as cf
import shapely
sys.path.insert(0, os.path.dirname(__file__))
from overture_io import list_keys, open_parquet, rowgroup_bbox

out, LAT, LON, KM = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
threads = int(sys.argv[5]) if len(sys.argv) > 5 else 12
RELEASE = os.environ.get('OVERTURE_RELEASE', '2026-09-23.1')
dl, do = (KM + 3) / 111.2, (KM + 3) / (111.32 * math.cos(math.radians(LAT)))
W, S, E, N = LON - do, LAT - dl, LON + do, LAT + dl


def scan(item):
    k, sz = item
    for a in range(5):
        try:
            pf = open_parquet(k, sz); res = []
            for i in range(pf.num_row_groups):
                bb = rowgroup_bbox(pf, i)
                if bb and (bb[2] < W or bb[0] > E or bb[3] < S or bb[1] > N): continue
                t = pf.read_row_group(i, columns=['subtype', 'class', 'geometry', 'bbox'])
                bbx = t.column('bbox').combine_chunks()
                x0, x1 = bbx.field('xmin').to_numpy(), bbx.field('xmax').to_numpy()
                y0, y1 = bbx.field('ymin').to_numpy(), bbx.field('ymax').to_numpy()
                st, cl, g = t.column('subtype').to_pylist(), t.column('class').to_pylist(), t.column('geometry').to_pylist()
                for j in range(len(st)):
                    if st[j] != 'road' or x1[j] < W or x0[j] > E or y1[j] < S or y0[j] > N: continue
                    ln = shapely.from_wkb(g[j])
                    res.append([cl[j] or 'unknown', [[round(y, 6), round(x, 6)] for x, y in ln.coords]])
            return res
        except Exception:
            if a == 4: raise
            time.sleep(5 * (a + 1))


if __name__ == '__main__':
    keys = list_keys(f'release/{RELEASE}/theme=transportation/type=segment/')
    roads, t0 = [], time.time()
    with cf.ThreadPoolExecutor(threads) as ex:
        for n, r in enumerate(ex.map(scan, keys)):
            roads += r
            print(f'fájl {n + 1}/{len(keys)}  utak: {len(roads)}  {time.time() - t0:.0f} s', flush=True)
    json.dump(roads, open(out, 'w'), separators=(',', ':'))
    from collections import Counter
    print('kész:', len(roads), 'útszakasz', Counter(r[0] for r in roads).most_common(), flush=True)
