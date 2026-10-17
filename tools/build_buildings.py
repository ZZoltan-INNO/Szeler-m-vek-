"""Valós épületek Magyarországra (Overture Maps: OpenStreetMap + Microsoft ML Buildings, ODbL).

Minden épületet a legkisebb befoglaló, elforgatott téglalapjával ír le (középpont, hossz, szélesség,
irány), és becsült magassággal: ha az adatban van magasság vagy szintszám, abból; különben az
alapterületből (melléképület ~3–4,5 m, családi ház nyeregtetővel ~7 m gerinc, csűr/üzem 8–10 m).
A kimenet a z12-es műholdkép-blokkokkal azonos kiosztású (4096 z13 px, kb. 54 km), veszteségmentes szürke PNG
(b12_<bx>_<by>.png), épületenként 9 bájt, mezőnként külön sávban (így tömörít a legjobban):
  x, y (uint16, a blokkon belül 0..65535 ↔ 0..4096 z13 px, kb. 0,8 m), hossz és szélesség (0,5 m), a hosszabb
  oldal iránya északtól (0..179° → 0..255), gerincmagasság (0,25 m), jelzők (1: nyeregtető).
A kép 1024 px széles; n épületnél sor = ceil(n/1024), a k. mező a [k·sor, (k+1)·sor) sávban van.
A blokkok listája és az épületszámok a <sat_mappa>/out/bld_index.json-ba kerülnek.

Használat: python3 tools/build_buildings.py <sat_mappa> <sorcsoport_lista.json> [szálak=12] [--clip=<ország.geojson>,<sáv_m>]
A sorcsoport-listát az overture_io.py-vel lehet előállítani (a magyarországi bbox-ot érintő sorcsoportok);
a --clip az országhatáron túl csak a megadott szélességű sávot tartja meg (pl. Natural Earth, 10000).
--region=<szélesség>,<hosszúság>,<sugár_km> esetén csak a kör (+3 km) épületeit veszi, országhatártól
függetlenül, és a <sat_mappa> helyett közvetlenül ebbe a mappába ír (b12_*.png, bld_index.json).
"""
import json, os, sys, math, time, threading, collections
import concurrent.futures as cf
import numpy as np, shapely
from PIL import Image
from overture_io import open_parquet

args = [a for a in sys.argv[1:] if not a.startswith('--')]
work, rg_file = args[0], args[1]
threads = int(args[2]) if len(args) > 2 else 12
clip = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--clip=')), None)
REGION = next(([float(v) for v in a.split('=', 1)[1].split(',')] for a in sys.argv[1:] if a.startswith('--region=')), None)
if REGION:
    out = work; os.makedirs(out, exist_ok=True); cover = None
    _dl = (REGION[2] + 3) / 111.2; _do = (REGION[2] + 3) / (111.32 * math.cos(math.radians(REGION[0])))
    RBOX = (REGION[1] - _do, REGION[0] - _dl, REGION[1] + _do, REGION[0] + _dl)   # xmin, ymin, xmax, ymax
else:
    out = os.path.join(work, 'out')
    cover = {tuple(b) for b in json.load(open(os.path.join(out, 'sat_index.json')))['s13']}


def in_region(lat, lon):
    """A régió körén (+3 km) belül? (közelítő síkvetület, a régió közepén mért léptékkel)"""
    dy = (lat - REGION[0]) * 111.2; dx = (lon - REGION[1]) * 111.32 * math.cos(math.radians(REGION[0]))
    return dx * dx + dy * dy <= (REGION[2] + 3) ** 2
N13 = 256 * 2 ** 13
BLK = 4096   # egy kimeneti blokk z13 képpontban (= egy z12-es 2048-as műholdkép-blokk)
COLS = ['geometry', 'bbox', 'height', 'num_floors', 'roof_shape', 'roof_height', 'is_underground']


def gx(lon): return (lon + 180) / 360 * N13
def gy(lat):
    s = np.sin(np.radians(lat)); return (0.5 - np.log((1 + s) / (1 - s)) / (4 * math.pi)) * N13


def process(t):
    bb = t.column('bbox').combine_chunks()
    cxm = ((bb.field('xmin').to_numpy() + bb.field('xmax').to_numpy()) / 2)
    cym = ((bb.field('ymin').to_numpy() + bb.field('ymax').to_numpy()) / 2)
    bx = (gx(cxm) // 2048).astype(np.int64); by = (gy(cym) // 2048).astype(np.int64)
    und = t.column('is_underground').to_numpy(zero_copy_only=False)
    if REGION:
        keep = in_region(cym, cxm) & ~(und == True)  # noqa: E712
    else:
        keep = np.array([(a, b) in cover for a, b in zip(bx, by)]) & ~(und == True)  # noqa: E712
    idx = np.nonzero(keep)[0]
    if not len(idx): return []
    geoms = shapely.from_wkb(t.column('geometry').to_numpy(zero_copy_only=False)[idx])
    lat0, lon0 = float(np.mean(cym[idx])), float(np.mean(cxm[idx]))
    kx, ky = 111320.0 * math.cos(math.radians(lat0)), 110574.0
    coords, gi = shapely.get_coordinates(geoms, return_index=True)
    lat_v = cym[idx][gi]  # helyi lépték a pont szélességén (pontos méretekhez)
    xy = np.column_stack(((coords[:, 0] - lon0) * 111320.0 * np.cos(np.radians(lat_v)), (coords[:, 1] - lat0) * ky))
    geoms = shapely.set_coordinates(geoms, xy)
    area = shapely.area(geoms)
    rect = shapely.oriented_envelope(geoms)
    rc = shapely.get_coordinates(rect, return_index=True)
    res = []
    hgt = t.column('height').to_numpy(zero_copy_only=False)[idx]
    flo = t.column('num_floors').to_numpy(zero_copy_only=False)[idx]
    roof = np.array(t.column('roof_shape').to_pylist(), dtype=object)[idx]
    pts = collections.defaultdict(list)
    for k, p in zip(rc[1], rc[0]): pts[k].append(p)
    for k in range(len(idx)):
        p = pts.get(k)
        A = area[k]
        if not p or len(p) < 4 or A < 12: continue
        p = np.array(p[:4])
        e1, e2 = p[1] - p[0], p[2] - p[1]
        l1, l2 = math.hypot(*e1), math.hypot(*e2)
        if l1 < 1 or l2 < 1: continue
        L, W, ev = (l1, l2, e1) if l1 >= l2 else (l2, l1, e2)
        ang = math.degrees(math.atan2(ev[0], ev[1])) % 180          # hosszabb oldal iránya északtól
        c = p.mean(0)
        lat = lat0 + c[1] / ky; lon = lon0 + c[0] / (111320.0 * math.cos(math.radians(lat)))
        h, f, rs = hgt[k], flo[k], roof[k]
        if h == h and h is not None and h > 1.5:       # a forrás magassága
            H = float(h)
            gable = rs in ('gabled', 'hipped', 'half_hipped', 'gambrel', 'mansard', 'pyramidal') or (rs is None and A < 500 and W <= 16 and H <= 12)
        elif f == f and f is not None and f > 0:     # szintszámból
            H = f * 3.0 + (2.5 if f <= 2 else 1.0)
            gable = rs != 'flat' and f <= 2 and A < 500 and W <= 16
        else:                                          # alapterületből
            H = 3.0 if A < 25 else 4.5 if A < 60 else 7.0 if A < 350 else 8.5 if A < 1500 else 10.0
            gable = rs != 'flat' and A < 600 and W <= 16
        Gx, Gy = gx(lon), float(gy(np.array(lat)))
        if cover is not None and (int(Gx // 2048), int(Gy // 2048)) not in cover: continue
        b = (int(Gx // BLK), int(Gy // BLK))
        res.append((b, min(65535, round((Gx - b[0] * BLK) / BLK * 65535)), min(65535, round((Gy - b[1] * BLK) / BLK * 65535)),
                    min(255, round(L * 2)), min(255, round(W * 2)), round(ang * 256 / 180) % 256,
                    min(255, round(H * 4)), 1 if gable else 0))
    return res


def clip_mask(lat, lon, spec):
    """Az országhatáron belül vagy attól legfeljebb <sáv_m> méterre lévő pontok."""
    path, buf = spec.split(',')
    k = 111320.0 * math.cos(math.radians(47.2))
    to_m = lambda xy: np.column_stack(((xy[:, 0] - 19.0) * k, (xy[:, 1] - 47.2) * 110574.0))
    poly = shapely.geometry.shape(json.load(open(path)))
    poly = shapely.transform(poly, to_m).buffer(float(buf))
    pts = shapely.points(to_m(np.column_stack((lon, lat))))
    return shapely.contains(poly, pts)


def write_chunk(path, a):
    """a: (n, 8) int tömb — x16, y16, L, W, irány, H, jelzők — soronként rendezve, mezőnként külön sávba."""
    a = a[np.lexsort((a[:, 0], a[:, 1]))]
    n = len(a); rows = -(-n // 1024)
    planes = np.zeros((9, rows * 1024), np.uint8)
    planes[0, :n], planes[1, :n] = a[:, 0] >> 8, a[:, 0] & 255
    planes[2, :n], planes[3, :n] = a[:, 1] >> 8, a[:, 1] & 255
    for k in range(5): planes[4 + k, :n] = a[:, 2 + k]
    Image.fromarray(planes.reshape(9 * rows, 1024), 'L').save(path, optimize=True)


def job(item):
    k, s, i = item
    for a in range(5):
        try:
            return process(open_parquet(k, s).read_row_group(i, columns=COLS))
        except Exception as e:
            if a == 4: raise
            time.sleep(5 * (a + 1))


if __name__ == '__main__':
    rgs = json.load(open(rg_file))
    items = [(k, s, h[0]) for k, s, hs in rgs for h in hs
             if not REGION or not (h[2][2] < RBOX[0] or h[2][0] > RBOX[2] or h[2][3] < RBOX[1] or h[2][1] > RBOX[3])]
    acc = collections.defaultdict(list); t0 = time.time(); n = 0
    with cf.ThreadPoolExecutor(threads) as ex:
        for done, res in enumerate(ex.map(job, items)):
            for r in res: acc[r[0]].append(r[1:])
            n += len(res)
            print(f'sorcsoport {done + 1}/{len(items)}  épületek: {n}  {time.time() - t0:.0f} s', flush=True)
    index = []
    for (bx, by), rows in sorted(acc.items()):
        a = np.array(rows, dtype=np.int64)
        if clip:
            gxp = bx * BLK + a[:, 0] / 65535 * BLK; gyp = by * BLK + a[:, 1] / 65535 * BLK
            lon = gxp / N13 * 360 - 180; lat = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * gyp / N13))))
            a = a[clip_mask(lat, lon, clip)]
            if not len(a): continue
        write_chunk(os.path.join(out, f'b12_{bx}_{by}.png'), a)
        index.append([bx, by, len(a)])
    json.dump({'b12': index}, open(os.path.join(out, 'bld_index.json'), 'w'))
    tot = sum(os.path.getsize(os.path.join(out, f'b12_{b[0]}_{b[1]}.png')) for b in index)
    print('kész:', n, 'épület,', len(index), 'blokk,', round(tot / 1e6, 1), 'MB', flush=True)
