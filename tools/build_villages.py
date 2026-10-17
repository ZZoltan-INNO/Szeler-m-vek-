"""Települések lakott (beépített) területének határa a valós épületekből (tools/build_buildings.py kimenete).

Nem a rendezési tervben rögzített hivatalos belterületi határ, hanem az összefüggő beépítés körvonala:
minden épület köré 35 m-es sáv, ezek uniója, majd 25 m-es visszahúzás (így a szomszédos telkek összeérnek,
de a határ legfeljebb kb. 10 m-rel nyúlik túl a szélső épületeken); a település pontjához (Overture) legközelebbi
összefüggő részt, illetve a hozzá 150 m-nél közelebbi nagyobb részeket tartja meg, a lyukakat kitölti.

Használat: python3 tools/build_villages.py <bld_mappa> <telepulesek.json> <kimenet.json> <név> [<név> ...]
Kimenet: [{"name": "Ják", "rings": [[[szélesség, hosszúság], ...], ...]}]
"""
import json, math, sys
import numpy as np, shapely
from shapely.ops import unary_union
from PIL import Image

bdir, settle, outp, names = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
N13, BB = 256 * 8192, 4096
idx = json.load(open(f'{bdir}/bld_index.json'))['b12']
rows = []
for bx, by, n in idx:
    im = np.array(Image.open(f'{bdir}/b12_{bx}_{by}.png')).reshape(-1); band = -(-n // 1024) * 1024
    F = [im[k * band:k * band + n].astype(float) for k in range(9)]
    X = bx * BB + (F[0] * 256 + F[1]) / 65535 * BB; Y = by * BB + (F[2] * 256 + F[3]) / 65535 * BB
    rows.append(np.column_stack((np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * Y / N13)))), X / N13 * 360 - 180, F[4] / 2, F[5] / 2, F[6] * np.pi / 256)))
B = np.concatenate(rows)
T = {r[0]: r for r in json.load(open(settle))}
out = []
for name in names:
    _, la0, lo0, _ = T[name]
    kx, ky = 111320 * math.cos(math.radians(la0)), 111195
    x = (B[:, 1] - lo0) * kx; y = (B[:, 0] - la0) * ky
    sel = np.hypot(x, y) < 4000
    polys = []
    for xi, yi, L, W, a in zip(x[sel], y[sel], B[sel, 2], B[sel, 3], B[sel, 4]):
        ex, ey = math.sin(a), math.cos(a)
        c = [(xi + ex * L / 2 * s + ey * W / 2 * u, yi + ey * L / 2 * s - ex * W / 2 * u) for s, u in ((1, 1), (1, -1), (-1, -1), (-1, 1))]
        polys.append(shapely.Polygon(c))
    area = unary_union([p.buffer(35, quad_segs=4) for p in polys]).buffer(-25, quad_segs=4)
    parts = list(area.geoms) if area.geom_type == 'MultiPolygon' else [area]
    ctr = shapely.Point(0, 0)
    main = min(parts, key=lambda p: p.distance(ctr))
    keep = [p for p in parts if p is main or (p.area > 20000 and p.distance(main) < 150)]
    geom = unary_union([shapely.Polygon(p.exterior) for p in keep]).simplify(4)
    geoms = list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]
    rings = [[[round(la0 + py / ky, 6), round(lo0 + px / kx, 6)] for px, py in g.exterior.coords] for g in geoms]
    out.append({'name': name, 'rings': rings})
    print(name, f'{sum(g.area for g in geoms) / 1e6:.2f} km²', sum(len(r) for r in rings), 'pont', len(geoms), 'rész', flush=True)
json.dump(out, open(outp, 'w'), ensure_ascii=False, separators=(',', ':'))
