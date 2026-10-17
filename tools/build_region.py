"""Egy kör alakú régió (pl. Ják 30 km-es körzete) domborzata és településnevei a beépített adatos változathoz.

1. Domborzat: AWS Terrain Tiles (terrarium) z12 (kb. 26 m/px; Ausztriában 10 m-es forrásból),
   egész méterre kerekítve, 4×4 csempés PNG-blokkokban (z12_<cx>_<cy>.png), plusz z8-as áttekintő.
2. Településnevek: Overture Maps divisions (locality: város, község, falu, településrész; OSM alapú, ODbL),
   magyar és osztrák oldalon is → telepulesek.json ([név, szélesség, hosszúság, súly]).
3. index.json: {"demZ": 12, "z12": [...], "z8": [...], "region": {"lat", "lon", "km"}}

Használat: python3 tools/build_region.py <munkamappa> <szélesség> <hosszúság> <sugár_km>
"""
import json, math, os, sys, subprocess
import numpy as np
from PIL import Image

work, LAT, LON, KM = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
MARGIN = 6.0   # km a kör körül (a 3D látóhatárhoz és a peremen álló nézőponthoz)


def tile(lat, lon, z):
    n = 2 ** z; s = math.sin(math.radians(lat))
    return int((lon + 180) / 360 * n), int((0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n)


def bbox(km):
    dl, do = km / 111.2, km / (111.32 * math.cos(math.radians(LAT)))
    return LAT - dl, LON - do, LAT + dl, LON + do


def build(z, c, km):
    s, w, n, e = bbox(km)
    x0, y0 = tile(n, w, z); x1, y1 = tile(s, e, z)
    raw = os.path.join(work, f'raw{z}'); os.makedirs(raw, exist_ok=True)
    keys = []
    for cx in range(x0 // c, x1 // c + 1):
        for cy in range(y0 // c, y1 // c + 1):
            A = np.zeros((256 * c, 256 * c, 3), np.uint8)
            for i in range(c):
                for j in range(c):
                    f = os.path.join(raw, f'{cx * c + i}_{cy * c + j}.png')
                    if not os.path.exists(f):
                        subprocess.run(['curl', '-sS', '--retry', '3', '-o', f, URL.format(z=z, x=cx * c + i, y=cy * c + j)], check=True)
                    im = np.asarray(Image.open(f).convert('RGB')).astype(np.float64)
                    v = np.clip(np.round(im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256), 0, 65535).astype(np.uint32)
                    A[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256, 0] = v >> 8
                    A[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256, 1] = v & 255
            Image.fromarray(A, 'RGB').save(os.path.join(work, 'out', f'z{z}_{cx}_{cy}.png'), optimize=True)
            keys.append([cx, cy])
    return keys


def settlements():
    """Overture divisions: a régióba eső települések (locality) neve és súlya a feliratozáshoz."""
    sys.path.insert(0, os.path.dirname(__file__))
    from overture_io import list_keys, open_parquet, rowgroup_bbox
    import shapely
    s, w, n, e = bbox(KM + 3)
    keys = [(k, sz) for k, sz in list_keys(f'release/{RELEASE}/theme=divisions/type=division/')]
    out = []
    for k, sz in keys:
        pf = open_parquet(k, sz)
        for i in range(pf.num_row_groups):
            bb = rowgroup_bbox(pf, i)
            if bb and (bb[2] < w or bb[0] > e or bb[3] < s or bb[1] > n): continue
            t = pf.read_row_group(i, columns=['subtype', 'class', 'names', 'population', 'geometry', 'bbox'])
            for st, cl, nm, pop, g in zip(t.column('subtype').to_pylist(), t.column('class').to_pylist(), t.column('names').to_pylist(),
                                          t.column('population').to_pylist(), t.column('geometry').to_pylist()):
                if st not in ('locality', 'localadmin') or not nm or not nm.get('primary'): continue
                p = shapely.from_wkb(g)
                if p.geom_type != 'Point' or not (s <= p.y <= n and w <= p.x <= e): continue
                wgt = pop or {'city': 60000, 'town': 6000, 'village': 600, 'hamlet': 60}.get(cl, 300)
                out.append([nm['primary'], round(p.y, 5), round(p.x, 5), int(wgt)])
    seen, res = set(), []
    for r in sorted(out, key=lambda r: -r[3]):   # egy név egyszer (a legnagyobb súllyal)
        if r[0] in seen: continue
        seen.add(r[0]); res.append(r)
    return res


RELEASE = os.environ.get('OVERTURE_RELEASE', '2026-09-23.1')
if __name__ == '__main__':
    os.makedirs(os.path.join(work, 'out'), exist_ok=True)
    idx = {'demZ': 12, 'z12': build(12, 4, KM + MARGIN), 'z8': build(8, 8, KM + MARGIN), 'region': {'lat': LAT, 'lon': LON, 'km': KM}}
    json.dump(idx, open(os.path.join(work, 'out', 'index.json'), 'w'))
    print('z12:', len(idx['z12']), 'blokk, z8:', len(idx['z8']), 'blokk', flush=True)
    st = settlements()
    json.dump(st, open(os.path.join(work, 'out', 'telepulesek.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print('települések:', len(st), [r[0] for r in st[:12]], flush=True)
