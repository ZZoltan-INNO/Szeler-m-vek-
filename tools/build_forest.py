"""Fás területek (erdő, fasor, facsoport) egy kör alakú régióra az ESA WorldCover alapján.

Forrás: ESA WorldCover 10 m 2021 v200 (CC BY 4.0) — a Sentinel-1 és Sentinel-2 felvételekből gépi tanulással
készült felszínborítás; a 10-es osztály a „fás terület” (Tree cover). A szkript a COG-fájlból csak a régió
ablakát olvassa (HTTP range), web-Mercator z14 rácsba vetíti (kb. 6,5 m/px, a műholdkép z14-es blokkjaival
azonos 2048×2048-as kiosztás), kiszűri az egyetlen 10 m-es képpontnál kisebb foltokat, és szürke PNG-be menti
(f14_<bx>_<by>.png): 0 = nem fás, 128 = fás terület széle (40 m-en belül nem fás képponttól, pl. fasor,
erdőszél), 255 = erdő belseje. Télen csak az erdő belseje számít tömör takarásnak (a széle lombtalanul átlátszik).
A lista a <kimenet>/forest_index.json-ba kerül ("f14").

Használat: python3 tools/build_forest.py <kimenet> <szélesség> <hosszúság> <sugár_km>
"""
import json, math, os, sys
import numpy as np, rasterio
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_bounds
from scipy import ndimage
from PIL import Image

out, LAT, LON, KM = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
Z, N, R = 14, 2048, 6378137.0
SRC = 'https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_{t}_Map.tif'


def merc(px, py):
    n = 256 * 2 ** Z
    return px / n * 2 * math.pi * R - math.pi * R, math.pi * R - py / n * 2 * math.pi * R


def tile_name(lat, lon):  # 3×3 fokos WorldCover-csempe bal alsó sarka
    la, lo = int(math.floor(lat / 3) * 3), int(math.floor(lon / 3) * 3)
    return f"{'N' if la >= 0 else 'S'}{abs(la):02d}{'E' if lo >= 0 else 'W'}{abs(lo):03d}"


os.makedirs(out, exist_ok=True)
os.environ.update(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', CPL_VSIL_CURL_ALLOWED_EXTENSIONS='.tif')
km = KM + 6
dl, do = km / 111.2, km / (111.32 * math.cos(math.radians(LAT)))
n = 256 * 2 ** Z
gx = lambda lo: (lo + 180) / 360 * n
gy = lambda la: (0.5 - math.log((1 + math.sin(math.radians(la))) / (1 - math.sin(math.radians(la)))) / (4 * math.pi)) * n
tiles = sorted({tile_name(la, lo) for la in (LAT - dl, LAT + dl) for lo in (LON - do, LON + do)})
srcs = [rasterio.open('/vsicurl/' + SRC.format(t=t)) for t in tiles]
index, share = [], []
for bx in range(int(gx(LON - do) // N), int(gx(LON + do) // N) + 1):
    for by in range(int(gy(LAT + dl) // N), int(gy(LAT - dl) // N) + 1):
        x0, y1 = merc(bx * N, by * N); x1, y0 = merc((bx + 1) * N, (by + 1) * N)
        cls = np.zeros((N, N), np.uint8)
        for src in srcs:
            tmp = np.zeros((N, N), np.uint8)
            reproject(rasterio.band(src, 1), tmp, src_transform=src.transform, src_crs=src.crs, src_nodata=0,
                      dst_transform=from_bounds(x0, y0, x1, y1, N, N), dst_crs='EPSG:3857', dst_nodata=0, resampling=Resampling.nearest)
            cls = np.where(cls == 0, tmp, cls)
        m = cls == 10
        lab, k = ndimage.label(m)
        if k:
            size = ndimage.sum(m, lab, range(1, k + 1))
            m &= np.isin(lab, np.nonzero(size >= 6)[0] + 1)   # 6 z14-képpont ≈ egy 10 m-es forrásképpont
        px_m = 2 * math.pi * R / n * math.cos(math.radians(LAT))       # egy z14-képpont a terepen (m)
        inner = ndimage.distance_transform_edt(m) * px_m >= 40
        img = np.where(inner, 255, np.where(m, 128, 0)).astype(np.uint8)
        Image.fromarray(img, 'L').save(os.path.join(out, f'f14_{bx}_{by}.png'), optimize=True)
        index.append([bx, by]); share.append(m.mean())
        print('blokk', bx, by, f'fás: {m.mean() * 100:.1f}%', flush=True)
json.dump({'f14': index}, open(os.path.join(out, 'forest_index.json'), 'w'))
tot = sum(os.path.getsize(os.path.join(out, f'f14_{b[0]}_{b[1]}.png')) for b in index)
print('kész:', len(index), 'blokk,', round(tot / 1e6, 1), 'MB, átlagos fás arány', f'{np.mean(share) * 100:.1f}%', flush=True)
