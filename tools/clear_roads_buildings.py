"""A kocsiutak úttestétől 3 m-en belül ne legyen épület (a tools/build_buildings.py kimenetén).

Az Overture-épületek (főleg a gépi felismerésből származók) és az OpenStreetMap-utak néhány métert elcsúszhatnak
egymáshoz képest, így az útra tett nézőpont néha épületben „állna”. Ahol egy épület téglalapja belelóg egy kocsiút
sávjába (úttest fele + 3 m, a szélességek a tools/build_canopy.py-ben), ott az épületnek csak a belelógó oldalát
vágja vissza a sáv széléig; ha így 3 m-nél keskenyebb vagy 12 m²-nél kisebb maradna, elhagyja.
A gyalog- és földutak az épületeket nem érintik.

Használat: python3 tools/clear_roads_buildings.py <bld_mappa> <utak.json> <kimeneti_mappa>
"""
import json, math, os, sys
import numpy as np, shapely
from shapely.strtree import STRtree
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from build_canopy import CAR, clearance

N13, BLK = 256 * 2 ** 13, 4096
src, roads_f, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
idx = json.load(open(os.path.join(src, 'bld_index.json')))['b12']
lat0 = float(np.mean([math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (by + 0.5) * BLK / N13)))) for _, by, _ in idx]))
K = 2 * math.pi * 6378137 * math.cos(math.radians(lat0)) / N13   # egy z13 képpont (m) a régió közepén


def to_m(lat, lon):   # z13 képpont → helyi méter (kelet, észak)
    s = math.sin(math.radians(lat))
    return (lon + 180) / 360 * N13 * K, -(0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * N13 * K


lines, rad = [], []
for cls, pts in json.load(open(roads_f)):
    if cls in CAR and len(pts) > 1:
        lines.append(shapely.LineString([to_m(la, lo) for la, lo in pts])); rad.append(clearance(cls))
corr = shapely.buffer(np.array(lines), np.array(rad), quad_segs=4)
tree = STRtree(corr)
print('kocsiút-szakasz:', len(corr), flush=True)


def rect(cx, cy, L, W, a):
    u, v = np.array([math.sin(a), math.cos(a)]), np.array([math.cos(a), -math.sin(a)])
    c = np.array([cx, cy])
    return shapely.Polygon([c + u * L / 2 + v * W / 2, c + u * L / 2 - v * W / 2, c - u * L / 2 - v * W / 2, c - u * L / 2 + v * W / 2])


def fix(cx, cy, L, W, a):
    """→ None (elhagyandó) vagy (cx, cy, L, W, a) a visszavágás után."""
    P = rect(cx, cy, L, W, a)
    hit = [corr[i] for i in tree.query(P, predicate='intersects')]
    if not hit: return cx, cy, L, W, a
    C = shapely.union_all(hit)
    if P.intersection(C).area < 0.3: return cx, cy, L, W, a
    u, v = np.array([math.sin(a), math.cos(a)]), np.array([math.cos(a), -math.sin(a)])
    best = None
    for ax, sg in ((u, 1), (u, -1), (v, 1), (v, -1)):   # melyik oldalát kell a legkevésbé visszavágni
        dim = L if ax is u else W
        lo, hi = 0.0, dim
        for _ in range(14):
            t = (lo + hi) / 2
            c2 = np.array([cx, cy]) - ax * sg * t / 2
            Q = rect(*c2, L - (t if ax is u else 0), W - (t if ax is v else 0), a)
            if Q.intersection(C).area < 0.3: hi = t
            else: lo = t
        if best is None or hi < best[0]: best = (hi, ax is u, sg)
    t, along, sg = best
    L2, W2 = (L - t, W) if along else (L, W - t)
    c2 = np.array([cx, cy]) - (u if along else v) * sg * t / 2
    if min(L2, W2) < 3 or L2 * W2 < 12: return None
    if W2 > L2: L2, W2, a = W2, L2, (a + math.pi / 2) % math.pi
    return c2[0], c2[1], L2, W2, a


new_idx, cut, drop, tot = [], 0, 0, 0
for bx, by, n in idx:
    p = np.asarray(Image.open(os.path.join(src, f'b12_{bx}_{by}.png'))); rows = p.shape[0] // 9; pl = p.reshape(9, rows * 1024)[:, :n].astype(np.int64)
    X = (pl[0] << 8 | pl[1]) / 65535 * BLK + bx * BLK; Y = (pl[2] << 8 | pl[3]) / 65535 * BLK + by * BLK
    keep = []
    for k in range(n):
        cx, cy = X[k] * K, -Y[k] * K
        L, W, a = pl[4, k] / 2, pl[5, k] / 2, pl[6, k] * math.pi / 256
        r = fix(cx, cy, L, W, a); tot += 1
        if r is None: drop += 1; continue
        if r[2] != L or r[3] != W: cut += 1
        gx_, gy_ = r[0] / K, -r[1] / K
        keep.append([min(65535, max(0, round((gx_ - bx * BLK) / BLK * 65535))), min(65535, max(0, round((gy_ - by * BLK) / BLK * 65535))),
                     min(255, round(r[2] * 2)), min(255, round(r[3] * 2)), round(r[4] * 256 / math.pi) % 256, pl[7, k], pl[8, k]])
    a = np.array(keep, np.int64); a = a[np.lexsort((a[:, 0], a[:, 1]))]; m = len(a); rows = -(-m // 1024)
    planes = np.zeros((9, rows * 1024), np.uint8)
    planes[0, :m], planes[1, :m], planes[2, :m], planes[3, :m] = a[:, 0] >> 8, a[:, 0] & 255, a[:, 1] >> 8, a[:, 1] & 255
    for j in range(5): planes[4 + j, :m] = a[:, 2 + j]
    Image.fromarray(planes.reshape(9 * rows, 1024), 'L').save(os.path.join(out, f'b12_{bx}_{by}.png'), optimize=True)
    new_idx.append([bx, by, m])
    print(f'b12_{bx}_{by}: {n} → {m} épület', flush=True)
json.dump({'b12': new_idx}, open(os.path.join(out, 'bld_index.json'), 'w'))
print(f'kész: {tot} épületből {cut} visszavágva, {drop} elhagyva', flush=True)
