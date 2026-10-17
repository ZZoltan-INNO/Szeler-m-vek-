"""Sentinel-2 műholdkép-mozaik Magyarországra az artifact-változathoz.

Forrás: Copernicus Sentinel-2 L2A, AWS Open Data (sentinel-cogs, Element 84), TCI (valós színes) kép.
Négyzetenként (MGRS 100 km) a 2024. június–augusztusi, legkevésbé felhős és legteljesebb
felvételeket választja, 20 m-es áttekintő szinten tölti le, majd web-Mercator z12
(kb. 26 m/px) rácsba vetíti, 8×8 csempés (2048×2048) JPEG blokkokba, a domborzati
blokkokkal azonos kiosztásban. Kicsinyített nézethez z9-es áttekintőt is készít.

Használat: python3 tools/build_sat.py <munkamappa> <dem_index.json>
"""
import json, os, sys, math, urllib.request, re, concurrent.futures as cf
import numpy as np, rasterio, mgrs
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_bounds
from PIL import Image

work, dem_index = sys.argv[1], sys.argv[2]
os.makedirs(os.path.join(work, 'scenes'), exist_ok=True); os.makedirs(os.path.join(work, 'out'), exist_ok=True)
B = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/'
R = 6378137.0

def ls(prefix):
    u = B + '?list-type=2&delimiter=/&prefix=' + prefix
    x = urllib.request.urlopen(u, timeout=120).read().decode()
    return re.findall(r'<Prefix>([^<]+/)</Prefix>', x)[1:]

def item(p):
    sid = p.rstrip('/').split('/')[-1]
    j = json.load(urllib.request.urlopen(B + p + sid + '.json', timeout=120))
    pr = j['properties']
    return dict(p=p, id=sid, cloud=pr.get('eo:cloud_cover', 100), nodata=pr.get('s2:nodata_pixel_percentage', 100))

def pick(sq):
    z, band, s = sq[:2], sq[2], sq[3:]
    cands = []
    for y, months in ((2024, (6, 7, 8)), (2023, (7, 8))):
        for mth in months:
            try: cands += ls(f'sentinel-s2-l2a-cogs/{int(z)}/{band}/{s}/{y}/{mth}/')
            except Exception as e: print('lista hiba', sq, e)
    its = []
    for p in cands:
        try: its.append(item(p))
        except Exception: pass
    its = [i for i in its if i['cloud'] < 20]
    its.sort(key=lambda i: i['cloud'] * 3 + i['nodata'])
    return sq, its[:3]

def fetch(it):
    out = os.path.join(work, 'scenes', it['id'] + '.tif')
    if os.path.exists(out): return out
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif'):
        with rasterio.open('/vsicurl/' + B + it['p'] + 'TCI.tif', OVERVIEW_LEVEL=0) as src:
            a = src.read(); prof = src.profile
            prof.update(driver='GTiff', compress='deflate', tiled=True, blockxsize=512, blockysize=512, width=a.shape[2], height=a.shape[1], transform=src.transform, nodata=0)
            with rasterio.open(out + '.part', 'w', **prof) as dst: dst.write(a)
    os.rename(out + '.part', out); return out

squares = json.load(open(os.path.join(work, 'squares.json')))
sel_f = os.path.join(work, 'selected.json')
if os.path.exists(sel_f): sel = json.load(open(sel_f))
else:
    with cf.ThreadPoolExecutor(8) as ex: sel = dict(ex.map(pick, squares))
    json.dump(sel, open(sel_f, 'w'), indent=0)
scenes = [it for sq in squares for it in sel.get(sq, [])]
print('jelenetek:', len(scenes), flush=True)
with cf.ThreadPoolExecutor(6) as ex:
    for i, f in enumerate(ex.map(fetch, scenes)): print('letöltve', i + 1, '/', len(scenes), os.path.basename(f), flush=True)
# prioritás: négyzetenként a legjobb jelenet előbb, aztán a tartalékok
order = [os.path.join(work, 'scenes', it['id'] + '.tif') for rank in range(3) for sq in squares for it in sel.get(sq, [])[rank:rank + 1]]
dss = [rasterio.open(f) for f in order]

def merc(px, py, z):  # globális képpont → EPSG:3857 méter
    n = 256 * 2 ** z
    return px / n * 2 * math.pi * R - math.pi * R, math.pi * R - py / n * 2 * math.pi * R

def render(z, tx0, ty0, ntiles, fn, q):
    N = 256 * ntiles
    x0, y1 = merc(tx0 * 256, ty0 * 256, z); x1, y0 = merc((tx0 + ntiles) * 256, (ty0 + ntiles) * 256, z)
    tr = from_bounds(x0, y0, x1, y1, N, N)
    acc = np.zeros((3, N, N), np.uint8); filled = np.zeros((N, N), bool)
    for ds in dss:
        b = ds.bounds  # gyors kizárás a jelenet befoglalója alapján (3857-ben)
        from rasterio.warp import transform_bounds
        bb = transform_bounds(ds.crs, 'EPSG:3857', *b)
        if bb[2] < x0 or bb[0] > x1 or bb[3] < y0 or bb[1] > y1: continue
        tmp = np.zeros((3, N, N), np.uint8)
        reproject(rasterio.band(ds, [1, 2, 3]), tmp, src_transform=ds.transform, src_crs=ds.crs, src_nodata=0,
                  dst_transform=tr, dst_crs='EPSG:3857', dst_nodata=0, resampling=Resampling.bilinear)
        ok = (tmp.sum(0) > 0) & ~filled
        acc[:, ok] = tmp[:, ok]; filled |= ok
        if filled.all(): break
    img = np.transpose(acc, (1, 2, 0))
    img[~filled] = (226, 229, 224)
    Image.fromarray(img).save(fn, quality=q, optimize=True, progressive=True)

idx = json.load(open(dem_index)); done = []
for cx, cy in idx['z11']:  # z11 4×4 blokk = z12 8×8 blokk
    fn = os.path.join(work, 'out', f's12_{cx}_{cy}.jpg')
    if not os.path.exists(fn): render(12, cx * 8, cy * 8, 8, fn, 72)
    done.append([cx, cy]); print('blokk', len(done), '/', len(idx['z11']), flush=True)
# z9 áttekintő: 8×8 csempe = 2048 px
ov = []
# a z9-es blokkok a z8-as domborzati áttekintővel azonos területet fedik (z8 8×8 → z9 16×16 csempe → 2×2 blokk)
for cx8, cy8 in idx['z8']:
    for i in range(2):
        for j in range(2):
            bx, by = cx8 * 2 + i, cy8 * 2 + j
            fn = os.path.join(work, 'out', f's9_{bx}_{by}.jpg')
            if not os.path.exists(fn): render(9, bx * 8, by * 8, 8, fn, 70)
            ov.append([bx, by])
json.dump({'s12': done, 's9': ov}, open(os.path.join(work, 'out', 'sat_index.json'), 'w'))
print('kész', flush=True)
