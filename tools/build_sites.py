"""Egy térképkép adott színű területeit (pl. „Szabad terület” kékje) sokszögekké alakítja, földrajzi koordinátákkal.

A kép illesztése illesztőpontokkal (képpont → szélesség, hosszúság) történik, web-Mercator vetületben, affin
leképezéssel (legkisebb négyzetek). A rárajzolt elemek (feliratok, számozott körök, határvonalak, jelmagyarázat-
keretek) alatti képpontokat a környezetük alapján pótolja: ahol a környező ismert képpontok többsége a keresett
szín, ott a pótolt képpont is az. A sokszögek egyszerűsítve, a kis foltok (alapból 2 ha alatt) elhagyva.

Használat: python3 tools/build_sites.py <kép> <illesztőpontok.json> <kimenet.json> [--frame=x0,y0,x1,y1] [--color=12,89,232]
  illesztőpontok.json: [[x, y, szélesség, hosszúság], ...]
Kimenet: {"rms_m": illesztési hiba (m), "polys": [[[[szélesség, hosszúság], ...] külső gyűrű, ...lyukak], ...]}
"""
import json, math, sys
import numpy as np, shapely
from PIL import Image
from scipy import ndimage as ndi
from rasterio import features
from affine import Affine

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
img, gcp_f, out = args
a = np.asarray(Image.open(img).convert('RGB')).astype(np.int32)
H, W = a.shape[:2]
x0, y0, x1, y1 = [int(v) for v in opt.get('frame', f'0,0,{W},{H}').split(',')]
col = np.array([int(v) for v in opt.get('color', '12,89,232').split(',')])
R = 6378137.0
merc = lambda la, lo: (math.radians(lo) * R, R * math.log(math.tan(math.pi / 4 + math.radians(la) / 2)))
unmerc = lambda mx, my: (math.degrees(2 * math.atan(math.exp(my / R)) - math.pi / 2), math.degrees(mx / R))

# illesztés
g = json.load(open(gcp_f))
X = np.array([[x, y, 1] for x, y, _, _ in g]); M = np.array([merc(la, lo) for _, _, la, lo in g])
A, *_ = np.linalg.lstsq(X, M, rcond=None)
res = np.hypot(*(X @ A - M).T) * math.cos(math.radians(np.mean([p[2] for p in g])))
print(f'illesztés: {len(g)} pont, hiba medián {np.median(res):.0f} m, legfeljebb {res.max():.0f} m', flush=True)

# a keresett szín és a rárajzolt elemek
d = np.sqrt(((a - col) ** 2).sum(-1))
target = d < 60
r, gg, b = a[..., 0], a[..., 1], a[..., 2]
overlay = (a.min(-1) > 228) | (a.max(-1) < 45) | ((r > 120) & (gg < 70) & (b < 140) & (r - b > 40))   # fehér, fekete, piros/bíbor vonal és felirat
frame = np.zeros_like(target); frame[y0:y1, x0:x1] = True
known = frame & ~overlay
# pótlás: a környező (41 × 41 képpontos ablak) ismert képpontjainak többsége szerint
k = np.ones((41, 41), np.float32)
num = ndi.convolve((target & known).astype(np.float32), k, mode='constant'); den = ndi.convolve(known.astype(np.float32), k, mode='constant')
filled = np.where(known, target, (num / np.maximum(den, 1)) > 0.5) & frame
filled = ndi.binary_closing(ndi.binary_opening(filled, iterations=1), iterations=2) & frame   # a feliratok és vonalak nyoma nélkül

# sokszögek (képpont → web-Mercator az illesztéssel), egyszerűsítés, kis foltok elhagyása
T = Affine(A[0, 0], A[1, 0], A[2, 0], A[0, 1], A[1, 1], A[2, 1])
min_ha = float(opt.get('min_ha', 2)); k_ground = math.cos(math.radians(np.mean([p[2] for p in g])))
polys = []
for geom, v in features.shapes(filled.astype(np.uint8), mask=filled, transform=T):
    p = shapely.geometry.shape(geom).simplify(20 / k_ground)
    if p.is_empty or p.area * k_ground ** 2 < min_ha * 1e4: continue
    p = shapely.Polygon(p.exterior, [h for h in p.interiors if shapely.Polygon(h).area * k_ground ** 2 >= min_ha * 1e4])
    rings = [p.exterior] + list(p.interiors)
    polys.append([[[round(c, 6) for c in unmerc(x, y)] for x, y in ring.coords] for ring in rings])
tot = sum(shapely.Polygon([merc(la, lo) for la, lo in pp[0]]).area for pp in polys) * k_ground ** 2 / 1e4
json.dump({'rms_m': round(float(np.sqrt((res ** 2).mean()))), 'polys': polys}, open(out, 'w'), separators=(',', ':'))
print(f'kész: {len(polys)} sokszög, összesen kb. {tot:.0f} ha (a lyukakkal együtt)', flush=True)
