"""Fák és erdők egy kör alakú régióra a Meta / WRI globális lombkorona-magasság térképéből.

Forrás: High Resolution Canopy Height Maps (Meta és World Resources Institute, 2024, CC BY 4.0): Maxar-légifotókból
gépi tanulással becsült lombkorona-magasság, kb. 1 m-es rács (web-Mercator z17), egész méterben. Jáknál a felvételek
2016–2019-esek. A csempék (z9 quadkey, <kulcs>.tif) a forests/v1/alsgedi_global_v6_float/chm/ alatt vannak.

Lépések, z14-es blokkonként (2048 × 2048 z14 px = 16384 × 16384 z17 px, kb. 13 km), átfedő résztáblákban:
1. Utak (tools/build_roads.py): a kocsiutak mentén az úttest szélétől 3 m-ig nem marad fa, az ösvényeken,
   földutakon és járdákon csak magán az úton nem (így az útra tett nézőpont nem fában áll, de az utcai fasorok
   és a dűlőutak menti fasorok megmaradnak). A „service” utak (bejárók, udvari utak, parkolók) a házak
   mellett futnak, ezeknél is csak magán az úton nem lehet fa.
2. Erdő: ahol egy 24 m átmérőjű kör teljesen lombkorona alá fér, és ennek 12 m-es környéke. Ez z14-es rácsba
   kerül (kb. 6,5 m): c14_<bx>_<by>.png, 0 = nincs erdő, különben az átlagos famagasság méterben (1..127),
   +128, ha a cella az erdő belseje (40 m-nél messzebb a lombkorona szélétől, az erdei utakon és kis tisztásokon
   átnézve; télen csak ez tömör takarás).
3. Egyes fák (kertek, fasorok, facsoportok, magányos fák): a simított lombkorona-magasság helyi csúcsai,
   vízválasztó szegmentálással kapott koronaterülettel; a csúcsokkal le nem fedett lombkoronára második körben
   kisebb fák kerülnek. Fánként: hely (kb. 0,2 m), magasság (0,25 m), koronasugár (0,1 m).
   t14_<bx>_<by>.png, mezőnként külön sávban (x16, y16, magasság, sugár), 1024 px széles, mint az épületeknél.
A lista a <kimenet>/canopy_index.json-ba kerül ("c14", "t14").

Használat: python3 tools/build_canopy.py <chm_mappa> <utak.json> <kimenet> <szélesség> <hosszúság> <sugár_km> [folyamatok=4]
"""
import json, math, os, sys, time
import multiprocessing as mp
import numpy as np

Z17 = 256 * 2 ** 17
SUB, M = 4096, 160            # résztábla és átfedés z17 képpontban
# kocsiutak: úttest szélessége (m); a fák és az épületek ettől 3 m-re kezdődhetnek
CAR = {'motorway': 11, 'trunk': 9, 'primary': 7.5, 'secondary': 7, 'tertiary': 6, 'unclassified': 5, 'residential': 5,
       'living_street': 4.5, 'unknown': 4}
# gyalog- és földutak, bejárók, udvari és gazdasági utak, parkolók: csak maga az út (+0,5 m)
PATH = {'service': 3.5, 'track': 3, 'footway': 1.5, 'path': 1.2, 'cycleway': 2, 'pedestrian': 3, 'steps': 1.5, 'bridleway': 2}


def clearance(cls):
    """Az út középvonalától mért fa- és épületmentes félszélesség (m)."""
    if cls in CAR: return CAR[cls] / 2 + 3
    return PATH.get(cls, 1.5) / 2 + 0.5


def gx(lon): return (lon + 180) / 360 * Z17
def gy(lat):
    s = math.sin(math.radians(lat)); return (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * Z17


def quadkey(x, y, z=9):
    return ''.join(str((1 if x >> (i - 1) & 1 else 0) + (2 if y >> (i - 1) & 1 else 0)) for i in range(z, 0, -1))


_src = {}
def read17(x0, y0, w, h):
    """z17 képpontok [x0, x0+w) × [y0, y0+h) a csempékből (ahol nincs adat: 0)."""
    import rasterio
    from rasterio.windows import Window
    out = np.zeros((h, w), np.uint8)
    for tx in range(x0 // 65536, (x0 + w - 1) // 65536 + 1):
        for ty in range(y0 // 65536, (y0 + h - 1) // 65536 + 1):
            f = os.path.join(CHM, quadkey(tx, ty) + '.tif')
            if not os.path.exists(f): continue
            if f not in _src: _src[f] = rasterio.open(f)
            ax0, ay0 = max(x0, tx * 65536), max(y0, ty * 65536)
            ax1, ay1 = min(x0 + w, (tx + 1) * 65536), min(y0 + h, (ty + 1) * 65536)
            out[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0] = _src[f].read(1, window=Window(ax0 - tx * 65536, ay0 - ty * 65536, ax1 - ax0, ay1 - ay0))
    return out


def detect(s, a, mask, px, caps):
    """Helyi csúcsok (ablak a magasság szerint) és vízválasztó koronák a maszkon. → [(sor, oszlop, h, r)], lefedettség"""
    from scipy import ndimage as ndi
    from skimage.segmentation import watershed
    mx = np.zeros(s.shape, bool)
    for lo, hi, r in caps:
        fp = np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r
        mx |= (s == ndi.maximum_filter(s, footprint=fp)) & (s >= lo) & (s < hi) & mask
    lab, n = ndi.label(mx)
    if not n: return [], np.zeros(s.shape, bool)
    pk = np.array(ndi.center_of_mass(mx, lab, range(1, n + 1))).round().astype(int)
    mk = np.zeros(s.shape, np.int32); mk[pk[:, 0], pk[:, 1]] = np.arange(1, n + 1)
    seg = watershed(-s, mk, mask=mask)
    area = ndi.sum(np.ones(s.shape, np.float32), seg, range(1, n + 1)) * px * px
    h = np.asarray(ndi.maximum(a, seg, range(1, n + 1)), np.float32)
    r = np.minimum(np.sqrt(area / np.pi), np.minimum(0.45 * h + 2, 9))
    cov = np.zeros(s.shape, bool)
    yy, xx = np.ogrid[:s.shape[0], :s.shape[1]]
    for (y, x), rr in zip(pk, r):
        k = int(rr / px) + 1; y0, y1, x0, x1 = max(0, y - k), y + k + 1, max(0, x - k), x + k + 1
        cov[y0:y1, x0:x1] |= (yy[y0:y1] - y) ** 2 + (xx[:, x0:x1] - x) ** 2 <= (rr / px) ** 2
    return [(y, x, hh, rr) for (y, x), hh, rr in zip(pk, h, r) if hh >= 3], cov


def subtile(X0, Y0, roads):
    """Egy SUB × SUB résztábla (z17 bal felső sarok: X0, Y0). → (erdőcellák 512×512, [fák globális z17 koordinátával])"""
    from scipy import ndimage as ndi
    from PIL import Image, ImageDraw
    W = SUB + 2 * M
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (Y0 + SUB / 2) / Z17))))
    px = 2 * math.pi * 6378137 / Z17 * math.cos(math.radians(lat))   # egy z17 képpont a földön (m)
    a = read17(X0 - M, Y0 - M, W, W)
    if not a.any(): return np.zeros((SUB // 8, SUB // 8), np.uint8), []
    # 1. utak
    im = Image.new('L', (W, W), 0); d = ImageDraw.Draw(im)
    for cls, pts in roads:
        p = [(x - X0 + M, y - Y0 + M) for x, y in pts]; wpx = 2 * clearance(cls) / px
        d.line(p, fill=255, width=max(1, round(wpx)), joint='curve')
        for x, y in p: d.ellipse([x - wpx / 2, y - wpx / 2, x + wpx / 2, y + wpx / 2], fill=255)
    a[np.asarray(im) > 0] = 0
    af = a.astype(np.float32); s = ndi.gaussian_filter(af, 1.0)
    can = (s >= 2.5) & (a >= 2)
    # 2. erdő
    core = ndi.distance_transform_edt(can) >= 12 / px
    forest = (ndi.distance_transform_edt(~core) <= 12 / px) & can
    # erdő belseje: az erdei utak és kis tisztások (legfeljebb kb. 12 m) nem tesznek erdőszélt az erdő közepébe
    inner = ndi.distance_transform_edt(ndi.binary_closing(can, structure=np.ones((3, 3), bool), iterations=round(6 / px))) > 40 / px
    c = slice(M, M + SUB)
    f8 = forest[c, c].reshape(SUB // 8, 8, SUB // 8, 8); fr = f8.mean((1, 3))
    hs = np.where(forest[c, c], af[c, c], 0).reshape(SUB // 8, 8, SUB // 8, 8).sum((1, 3)) / np.maximum(1, f8.sum((1, 3)))
    inn = inner[c, c].reshape(SUB // 8, 8, SUB // 8, 8).mean((1, 3)) >= 0.5
    cells = np.where(fr >= 0.5, np.clip(np.round(hs), 1, 127) + inn * 128, 0).astype(np.uint8)
    # 3. egyes fák
    rest = can & ~forest
    t1, cov = detect(s, af, rest, px, [(2.5, 8, round(2 / px)), (8, 16, round(3 / px)), (16, 99, round(4 / px))])
    left = rest & ~cov
    left &= ndi.binary_opening(left, iterations=1)
    t2, _ = detect(s, af, left, px, [(2.5, 99, round(2.5 / px))])
    trees = [(X0 - M + x, Y0 - M + y, h, min(r, 3.5) if k else r)
             for k, tl in enumerate((t1, t2)) for y, x, h, r in tl if M <= y < M + SUB and M <= x < M + SUB]
    return cells, trees


def block(job):
    bx, by, roads = job
    from PIL import Image
    t0 = time.time(); cells = np.zeros((2048, 2048), np.uint8); trees = []
    for j in range(4):
        for i in range(4):
            X0, Y0 = bx * 16384 + i * SUB, by * 16384 + j * SUB
            rs = [r for r in roads if r[2][0] < X0 + SUB + M and r[2][2] > X0 - M and r[2][1] < Y0 + SUB + M and r[2][3] > Y0 - M]
            c, t = subtile(X0, Y0, [(r[0], r[1]) for r in rs])
            cells[j * 512:(j + 1) * 512, i * 512:(i + 1) * 512] = c; trees += t
    n = 0
    if cells.any():
        Image.fromarray(cells, 'L').save(os.path.join(OUT, f'c14_{bx}_{by}.png'), optimize=True)
    if trees:
        t = np.array(trees, np.float64)
        q = np.column_stack([np.clip(np.round((t[:, 0] - bx * 16384) / 16384 * 65535), 0, 65535),
                             np.clip(np.round((t[:, 1] - by * 16384) / 16384 * 65535), 0, 65535),
                             np.clip(np.round(t[:, 2] * 4), 0, 255), np.clip(np.round(t[:, 3] * 10), 0, 255)]).astype(np.int64)
        q = q[np.lexsort((q[:, 0], q[:, 1]))]; n = len(q); rows = -(-n // 1024)
        pl = np.zeros((6, rows * 1024), np.uint8)
        pl[0, :n], pl[1, :n], pl[2, :n], pl[3, :n] = q[:, 0] >> 8, q[:, 0] & 255, q[:, 1] >> 8, q[:, 1] & 255
        pl[4, :n], pl[5, :n] = q[:, 2], q[:, 3]
        Image.fromarray(pl.reshape(6 * rows, 1024), 'L').save(os.path.join(OUT, f't14_{bx}_{by}.png'), optimize=True)
    return bx, by, bool(cells.any()), n, time.time() - t0


def init(chm, out):
    global CHM, OUT; CHM, OUT = chm, out


if __name__ == '__main__':
    CHM, roads_f, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
    LAT, LON, KM = float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6]) + 6
    procs = int(sys.argv[7]) if len(sys.argv) > 7 else 4
    os.makedirs(OUT, exist_ok=True)
    roads = []
    for cls, pts in json.load(open(roads_f)):
        p = [(gx(lo), gy(la)) for la, lo in pts]; xs, ys = [q[0] for q in p], [q[1] for q in p]
        roads.append((cls, p, (min(xs), min(ys), max(xs), max(ys))))
    dl, do = KM / 111.2, KM / (111.32 * math.cos(math.radians(LAT)))
    jobs = []
    for bx in range(int(gx(LON - do) // 16384), int(gx(LON + do) // 16384) + 1):
        for by in range(int(gy(LAT + dl) // 16384), int(gy(LAT - dl) // 16384) + 1):
            X0, Y0 = bx * 16384, by * 16384
            jobs.append((bx, by, [r for r in roads if r[2][0] < X0 + 16384 + M and r[2][2] > X0 - M and r[2][1] < Y0 + 16384 + M and r[2][3] > Y0 - M]))
    if len(sys.argv) > 8: jobs = [j for j in jobs if f'{j[0]}_{j[1]}' in sys.argv[8].split(',')]
    t0, idx = time.time(), {'c14': [], 't14': []}
    with mp.Pool(procs, init, (CHM, OUT)) as pool:
        for k, (bx, by, hc, n, dt) in enumerate(pool.imap_unordered(block, jobs)):
            if hc: idx['c14'].append([bx, by])
            if n: idx['t14'].append([bx, by, n])
            print(f'blokk {k + 1}/{len(jobs)} {bx}_{by}: {n} fa, {dt:.0f} s (összesen {time.time() - t0:.0f} s)', flush=True)
    idx['c14'].sort(); idx['t14'].sort()
    json.dump(idx, open(os.path.join(OUT, 'canopy_index.json'), 'w'))
    tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith('.png'))
    print('kész:', sum(t[2] for t in idx['t14']), 'fa,', len(idx['c14']), 'erdőblokk,', round(tot / 1e6, 1), 'MB', flush=True)
