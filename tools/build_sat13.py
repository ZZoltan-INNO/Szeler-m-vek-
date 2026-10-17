"""Élesebb Sentinel-2 mozaik: teljes, 10 m-es felbontásból web-Mercator z13 (kb. 13 m/px) vagy más szintű rácsba.

A tools/build_sat.py ugyanazokat a felvételeket választja ki (selected.json), de csak 20 m-es
áttekintő szinten tölti le. Ez a szkript a teljes felbontású TCI képet nem tölti le egészben:
blokkonként csak a szükséges részt olvassa a felhőből (COG, HTTP range), és WebP-be ment.
Egy z12-es blokkra 2×2 z13-as blokk jut (s13_<bx>_<by>.webp, 2048×2048 px).

Használat: python3 tools/build_sat13.py <munkamappa> [párhuzamos_folyamatok=6] [csak_ennyi_blokk]
             [--zoom=14 --region=<szélesség>,<hosszúság>,<sugár_km> --out=<mappa>]
A <munkamappa> a tools/build_sat.py munkamappája (selected.json, squares.json, out/sat_index.json).
--region esetén a kör (+6 km) befoglalóját fedő blokkokat készíti a --zoom szinten (s<zoom>_<bx>_<by>.webp),
és a --out mappa sat_index.json-jába írja a listát ("s<zoom>").
"""
import json, os, sys, math, time
import multiprocessing as mp
import numpy as np

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
work = args[0]
procs = int(args[1]) if len(args) > 1 else 6
limit = int(args[2]) if len(args) > 2 else None
ZOOM = int(opt.get('zoom', 13))
REGION = [float(v) for v in opt['region'].split(',')] if 'region' in opt else None
OUT = opt.get('out', os.path.join(work, 'out'))
B = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/'
R = 6378137.0
Q = 74   # WebP minőség


def merc(px, py, z):  # globális képpont → EPSG:3857 méter
    n = 256 * 2 ** z
    return px / n * 2 * math.pi * R - math.pi * R, math.pi * R - py / n * 2 * math.pi * R


def scene_list():
    squares = json.load(open(os.path.join(work, 'squares.json')))
    sel = json.load(open(os.path.join(work, 'selected.json')))
    # prioritás: négyzetenként a legjobb jelenet előbb, aztán a tartalékok (mint a build_sat.py-ban)
    return [it['p'] for rank in range(3) for sq in squares for it in sel.get(sq, [])[rank:rank + 1]]


_dss = None
def _init(paths, bounds):
    global _dss
    import rasterio
    os.environ.update(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif',
                      GDAL_HTTP_MAX_RETRY='5', GDAL_HTTP_RETRY_DELAY='2', VSI_CACHE='TRUE', VSI_CACHE_SIZE='200000000')
    _dss = [(p, bounds[p]) for p in paths]


def render(job):
    import rasterio
    from rasterio.warp import reproject, Resampling
    from rasterio.transform import from_bounds
    from PIL import Image
    bx, by, fn = job
    if os.path.exists(fn):
        return fn, 0.0
    t0 = time.time(); N = 2048
    x0, y1 = merc(bx * N, by * N, ZOOM); x1, y0 = merc((bx + 1) * N, (by + 1) * N, ZOOM)
    tr = from_bounds(x0, y0, x1, y1, N, N)
    acc = np.zeros((3, N, N), np.uint8); filled = np.zeros((N, N), bool)
    for p, bb in _dss:
        if bb[2] < x0 or bb[0] > x1 or bb[3] < y0 or bb[1] > y1:
            continue
        for attempt in range(4):
            try:
                with rasterio.open('/vsicurl/' + B + p + 'TCI.tif') as ds:
                    tmp = np.zeros((3, N, N), np.uint8)
                    reproject(rasterio.band(ds, [1, 2, 3]), tmp, src_transform=ds.transform, src_crs=ds.crs, src_nodata=0,
                              dst_transform=tr, dst_crs='EPSG:3857', dst_nodata=0, resampling=Resampling.lanczos)
                break
            except Exception as e:
                if attempt == 3:
                    raise
                time.sleep(3 * (attempt + 1))
        ok = (tmp.sum(0) > 0) & ~filled
        acc[:, ok] = tmp[:, ok]; filled |= ok
        if filled.all():
            break
    img = np.transpose(acc, (1, 2, 0))
    img[~filled] = (226, 229, 224)
    Image.fromarray(img).save(fn + '.part.webp', quality=Q, method=6)
    os.rename(fn + '.part.webp', fn)
    return fn, time.time() - t0


if __name__ == '__main__':
    import rasterio
    from rasterio.warp import transform_bounds
    paths = scene_list()
    bf = os.path.join(work, 'bounds3857.json')
    bounds = json.load(open(bf)) if os.path.exists(bf) else {}
    os.environ.update(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif')
    for p in paths:  # a jelenetek befoglalója 3857-ben (gyors kizáráshoz), egyszer
        if p not in bounds:
            with rasterio.open('/vsicurl/' + B + p + 'TCI.tif') as ds:
                bounds[p] = transform_bounds(ds.crs, 'EPSG:3857', *ds.bounds)
    json.dump(bounds, open(bf, 'w'))
    os.makedirs(OUT, exist_ok=True)
    if REGION:   # a kör (+6 km) befoglalóját fedő blokkok
        lat, lon, km = REGION; km += 6
        dl, do = km / 111.2, km / (111.32 * math.cos(math.radians(lat)))
        n = 256 * 2 ** ZOOM
        gx = lambda lo: (lo + 180) / 360 * n
        gy = lambda la: (0.5 - math.log((1 + math.sin(math.radians(la))) / (1 - math.sin(math.radians(la)))) / (4 * math.pi)) * n
        jobs = [(bx, by, os.path.join(OUT, f's{ZOOM}_{bx}_{by}.webp'))
                for bx in range(int(gx(lon - do) // 2048), int(gx(lon + do) // 2048) + 1)
                for by in range(int(gy(lat + dl) // 2048), int(gy(lat - dl) // 2048) + 1)]
    else:        # országos z13: a z12-es blokkok negyedei
        idx = json.load(open(os.path.join(work, 'out', 'sat_index.json')))
        jobs = [(cx * 2 + i, cy * 2 + j, os.path.join(OUT, f's13_{cx * 2 + i}_{cy * 2 + j}.webp'))
                for cx, cy in idx['s12'] for i in range(2) for j in range(2)]
    if limit:
        jobs = jobs[:limit]
    t0 = time.time()
    with mp.Pool(procs, _init, (paths, bounds)) as pool:
        for k, (fn, dt) in enumerate(pool.imap_unordered(render, jobs)):
            print(f'blokk {k + 1}/{len(jobs)} {os.path.basename(fn)} {dt:.0f} s, összesen {time.time() - t0:.0f} s', flush=True)
    ixf = os.path.join(OUT, 'sat_index.json')
    idx = json.load(open(ixf)) if os.path.exists(ixf) else {}
    idx[f's{ZOOM}'] = [[bx, by] for bx, by, fn in jobs if os.path.exists(fn)]
    if not limit:
        json.dump(idx, open(ixf, 'w'))
    print('kész', len(idx[f's{ZOOM}']), 'blokk', flush=True)
