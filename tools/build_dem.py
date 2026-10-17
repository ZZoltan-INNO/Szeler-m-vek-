"""Magyarország domborzati adatának és településlistájának előállítása az artifact-változathoz.

1. Letölti az AWS Terrain Tiles (terrarium) csempéit z11 (~50 m) és z8 (áttekintő) szinten.
2. Egész méterre kerekíti a magasságot (B csatorna = 0, jobb tömörítés).
3. 4×4 (z11) illetve 8×8 (z8) csempét egy PNG-be fűz; z11-ből csak azokat a blokkokat
   tartja meg, amelyek 25 km-en belül vannak magyar településtől.
Kimenet: <kimenet>/z11_*.png, z8_*.png, index.json

A telepulesek.json ([név, szélesség, hosszúság, lakosság]) az npm `all-the-cities` (GeoNames,
1000 fő feletti települések) és `countries-states-cities-service` csomagokból készül, lásd README.

Használat: python3 tools/build_dem.py <munkamappa> <telepulesek.json>
"""
import json, math, os, sys, subprocess
import numpy as np
from PIL import Image

work, settle = sys.argv[1], sys.argv[2]
T = json.load(open(settle))
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

def tile(lat, lon, z):
    n = 2 ** z; s = math.sin(math.radians(lat))
    return int((lon + 180) / 360 * n), int((0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n)

def ll(x, y, z):
    n = 2 ** z
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n)))), x / n * 360 - 180

def build(z, c, mask_km):
    x0, y0 = tile(48.75, 15.9, z); x1, y1 = tile(45.55, 23.1, z)
    x0 -= x0 % c; y0 -= y0 % c; x1 = x1 - x1 % c + c - 1; y1 = y1 - y1 % c + c - 1
    raw = os.path.join(work, f'raw{z}'); os.makedirs(raw, exist_ok=True)
    keys = []
    for cx in range(x0 // c, x1 // c + 1):
        for cy in range(y0 // c, y1 // c + 1):
            la0, lo0 = ll(cx * c, cy * c, z); la1, lo1 = ll(cx * c + c, cy * c + c, z)
            dl, do = mask_km / 111, mask_km / (111 * 0.68)
            if mask_km and not any(la1 - dl <= t[1] <= la0 + dl and lo0 - do <= t[2] <= lo1 + do for t in T):
                continue
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

os.makedirs(os.path.join(work, 'out'), exist_ok=True)
idx = {'z11': build(11, 4, 25), 'z8': build(8, 8, 0)}
json.dump(idx, open(os.path.join(work, 'out', 'index.json'), 'w'))
print('z11:', len(idx['z11']), 'blokk, z8:', len(idx['z8']), 'blokk')
