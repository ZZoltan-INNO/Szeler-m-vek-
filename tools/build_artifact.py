"""Az index.html-ből internet nélkül működő változatot készít (claude.ai artifacthoz).

Használat: python3 tools/build_artifact.py <dem_mappa> <kimeneti_mappa> [alapváltozat_url] [muhold_mappa]
A <dem_mappa> a tools/build_dem.py kimenete (z11_*.png, z8_*.png, index.json, telepulesek.json),
a <muhold_mappa> a tools/build_sat.py kimenete (s12_*.jpg, s9_*.jpg, sat_index.json).
"""
import json, re, shutil, sys, os

src, out = sys.argv[1], sys.argv[2]
alap_url = sys.argv[3] if len(sys.argv) > 3 else 'alap.html'
sat = sys.argv[4] if len(sys.argv) > 4 else None
s = open(os.path.join(os.path.dirname(__file__), '..', 'index.html'), encoding='utf-8').read()
idx = json.load(open(os.path.join(src, 'index.json')))

# Leaflet a megengedett CDN-ről (kisebb oldal), a saját kód maradjon beágyazva
s, n = re.subn(r'<script>\n/\* @preserve\n \* Leaflet 1\.9\.4.*?</script>\n',
               '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>\n', s, flags=re.S)
assert n == 1
local = {'base': 'dem/', 'z11': idx['z11'], 'z8': idx['z8']}
if sat:
    local.update(json.load(open(os.path.join(sat, 'sat_index.json'))))
s = s.replace('<script>\n"use strict";', '<script>window.LOCAL_DATA = ' + json.dumps(local, separators=(',', ':')) + ';</script>\n<script>\n"use strict";', 1)
s = s.replace('href="alap.html"', f'href="{alap_url}" target="_blank" rel="noopener"')
# az artifact maga adja a dokumentumvázat
for t in ['<!DOCTYPE html>\n', '<html lang="hu">\n', '<head>\n', '<meta charset="utf-8">\n',
          '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n',
          '</head>\n', '<body>\n', '</body>\n', '</html>\n']:
    assert s.count(t) == 1, t
    s = s.replace(t, '')
s = s.replace('<title>Szélerőmű-rálátás</title>', '<title>Szélerőmű-rálátás</title>\n<meta name="claude:viewport-fit-sides" content="cover">', 1)
os.makedirs(os.path.join(out, 'dem'), exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(s)
for f in os.listdir(src):
    if f.endswith('.png') or f == 'telepulesek.json':
        shutil.copy(os.path.join(src, f), os.path.join(out, 'dem', f))
if sat:
    for f in os.listdir(sat):
        if f.endswith('.jpg'):
            shutil.copy(os.path.join(sat, f), os.path.join(out, 'dem', f))
# fotó-textúrák és égbolt-fény a 3D nézethez
adir = os.path.join(os.path.dirname(__file__), '..', 'assets')
os.makedirs(os.path.join(out, 'assets'), exist_ok=True)
for f in os.listdir(adir):
    if f.endswith(('.png', '.jpg')):
        shutil.copy(os.path.join(adir, f), os.path.join(out, 'assets', f))
print('kész:', out, len(os.listdir(os.path.join(out, 'dem'))), 'adatfájl')
