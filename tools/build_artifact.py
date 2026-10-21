"""Az index.html-ből internet nélkül működő változatot készít (beépített domborzattal és műholdképpel).

Használat:
  python3 tools/build_artifact.py <dem_mappa> <kimeneti_mappa> [alapváltozat_url] [muhold_mappa]
      claude.ai artifacthoz (a dokumentumvázat az artifact adja)
  python3 tools/build_artifact.py --web [--base=https://valami.netlify.app/] <dem_mappa> <kimeneti_mappa> [muhold_mappa]
      önálló weboldal bármilyen statikus tárhelyre (Netlify, GitHub Pages, Cloudflare Pages):
      index.html + alap.html + dem/ + assets/, Facebook-előnézettel (og:*), megosztható linkkel.
      A --base a végleges cím; nélküle az előnézeti kép relatív útvonalú.
  --bld=<mappa>: a valós épületek (tools/build_buildings.py) külön mappából (b12_*.png, bld_index.json).
  --villages=<fájl>: települések lakott területének határa (tools/build_villages.py), a térképen és a turbinák távolságához.
  --sites=<fájl>: lehetséges telepítési területek sokszögei (tools/build_sites.py), áttetsző kékkel a térképen.
  --forest=<mappa>: fák és erdők (tools/build_canopy.py: c14_*.png, t14_*.png, canopy_index.json).
  --esri-key=<kulcs>: (csak --web) nagy felbontású Esri légifotó a térképen és a 3D terepen a nézőpont 1 km-es körzetében.
  --place=<név>,<szélesség>,<hosszúság>: más régiónál (tools/build_region.py) a kezdő nézőpont és a feliratok települése.
A <dem_mappa> lehet a tools/build_region.py kimenete is (régiós kiadás: demZ, z12, z8, region).
A <dem_mappa> a tools/build_dem.py kimenete (z11_*.png, z8_*.png, index.json, telepulesek.json),
a <muhold_mappa> a tools/build_sat.py, a tools/build_sat13.py és a tools/build_buildings.py kimenete
(s13_*.webp, s12_*.jpg, s9_*.jpg, sat_index.json, b12_*.png, bld_index.json).
"""
import datetime, json, re, shutil, sys, os

args = [a for a in sys.argv[1:] if not a.startswith('--')]
web = '--web' in sys.argv
base = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--base=')), '')
bld = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--bld=')), None)
esri = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--esri-key=')), None)
place = next((a.split('=', 1)[1].split(',') for a in sys.argv[1:] if a.startswith('--place=')), None)   # más régió: név, szélesség, hosszúság
forest = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--forest=')), None)
villages = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--villages=')), None)
sites = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--sites=')), None)
if base and not base.endswith('/'):
    base += '/'
src, out = args[0], args[1]
if web:
    alap_url, sat = 'alap.html', (args[2] if len(args) > 2 else None)
else:
    alap_url = args[2] if len(args) > 2 else 'alap.html'
    sat = args[3] if len(args) > 3 else None
root = os.path.join(os.path.dirname(__file__), '..')
s = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
idx = json.load(open(os.path.join(src, 'index.json')))

SKELETON = ['<!DOCTYPE html>\n', '<html lang="hu">\n', '<head>\n', '<meta charset="utf-8">\n',
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n',
            '</head>\n', '<body>\n', '</body>\n', '</html>\n']
ICON = ('<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E'
        '%3Cg stroke=%22%231d5fa6%22 stroke-width=%222.6%22 stroke-linecap=%22round%22%3E%3Cpath d=%22M16 14v16%22/%3E'
        '%3Cpath d=%22M16 14V3M16 14l9.5 5.5M16 14l-9.5 5.5%22/%3E%3C/g%3E%3C/svg%3E">\n')


def social(html, title, desc, page):
    """Facebook/Messenger-előnézet (Open Graph) és ikon a <title> után."""
    tags = (f'<meta property="og:type" content="website">\n<meta property="og:locale" content="hu_HU">\n'
            f'<meta property="og:title" content="{title}">\n<meta property="og:description" content="{desc}">\n'
            f'<meta property="og:image" content="{base}assets/og.jpg">\n<meta property="og:image:width" content="1200">\n'
            f'<meta property="og:image:height" content="630">\n'
            + (f'<meta property="og:url" content="{base}{page}">\n' if base else '')
            + '<meta name="twitter:card" content="summary_large_image">\n' + ICON)
    i = html.index('</title>\n') + len('</title>\n')
    return html[:i] + tags + html[i:]


# Leaflet a megengedett CDN-ről (kisebb oldal), a saját kód maradjon beágyazva
s, n = re.subn(r'<script>\n/\* @preserve\n \* Leaflet 1\.9\.4.*?</script>\n',
               '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>\n', s, flags=re.S)
assert n == 1
local = {'base': 'dem/', **idx}   # z11 + z8 (országos) vagy demZ + z12 + z8 + region (régiós)
local['built'] = datetime.date.today().isoformat()   # a térkép alatti feliratban: melyik kiadás fut
if web:
    local['web'] = True
    if esri:   # Esri World Imagery légifotó (Location Platform API-kulcs; az Esri-felületen a weboldal címére korlátozva)
        local['esriKey'] = esri
if sat:
    local.update(json.load(open(os.path.join(sat, 'sat_index.json'))))
if villages:   # lakott területek határa (tools/build_villages.py), kicsi: a lapba ágyazva
    local['villages'] = json.load(open(villages))
if sites:   # lehetséges telepítési területek (tools/build_sites.py)
    local['sites'] = json.load(open(sites))
if forest:   # fák és erdők (tools/build_canopy.py)
    local.update(json.load(open(os.path.join(forest, 'canopy_index.json'))))
bdir = bld or sat
if bdir and os.path.exists(os.path.join(bdir, 'bld_index.json')):   # valós épületek (tools/build_buildings.py)
    local.update(json.load(open(os.path.join(bdir, 'bld_index.json'))))
if place:   # kezdő nézőpont és a feliratok a régió településével (alapból Ják)
    local['home'] = {'name': place[0], 'lat': float(place[1]), 'lon': float(place[2])}
    a = '>Ják és 30 km-es környéke<'
    assert s.count(a) == 1
    s = s.replace(a, f">{place[0]} és {local['region']['km']:g} km-es környéke<")
s = s.replace('<script>\n"use strict";', '<script>window.LOCAL_DATA = ' + json.dumps(local, separators=(',', ':')) + ';</script>\n<script>\n"use strict";', 1)
if web:
    s = social(s, f"HorizonLens · Honnan látszik a szélerőmű? {place[0] if place else 'Ják'} és környéke",
               'Húzd a 250 m magas turbinát oda, ahová tervezik, válaszd ki, honnan nézed (akár a házad elől), '
               'és nézd meg 3D-ben a valós domborzattal és házakkal, mennyi látszik belőle.', '')
    a = open(os.path.join(root, 'alap.html'), encoding='utf-8').read()
    a = social(a, 'Mennyi látszik a szélturbinából?',
               'Egyszerű kalkulátor: távolság, turbinamagasság, előtte bokor, épület, fasor vagy domb, és 3D-ben látod, mennyit takarnak.',
               'alap.html')
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'alap.html'), 'w', encoding='utf-8').write(a)
else:
    s = s.replace('href="alap.html"', f'href="{alap_url}" target="_blank" rel="noopener"')
    # az artifact maga adja a dokumentumvázat
    for t in SKELETON:
        assert s.count(t) == 1, t
        s = s.replace(t, '')
    s = s.replace('<title>HorizonLens</title>', '<title>HorizonLens</title>\n<meta name="claude:viewport-fit-sides" content="cover">', 1)
os.makedirs(os.path.join(out, 'dem'), exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(s)
for f in os.listdir(src):
    if f.endswith('.png') or f == 'telepulesek.json':
        shutil.copy(os.path.join(src, f), os.path.join(out, 'dem', f))
if sat:
    for f in os.listdir(sat):
        if f.endswith(('.jpg', '.webp')) and not f.endswith('.part.webp'):
            shutil.copy(os.path.join(sat, f), os.path.join(out, 'dem', f))
if forest:
    for f in os.listdir(forest):
        if f.startswith(('c14_', 't14_')) and f.endswith('.png'):
            shutil.copy(os.path.join(forest, f), os.path.join(out, 'dem', f))
if bdir:
    for f in os.listdir(bdir):
        if f.startswith('b12_') and f.endswith('.png'):
            shutil.copy(os.path.join(bdir, f), os.path.join(out, 'dem', f))
# fotó-textúrák és égbolt-fény a 3D nézethez (+ az előnézeti kép)
adir = os.path.join(root, 'assets')
os.makedirs(os.path.join(out, 'assets'), exist_ok=True)
for f in os.listdir(adir):
    if f.endswith(('.png', '.jpg', '.mp4', '.webm')) or f.endswith('_chips.json') or (web and f.startswith('LICENSE')):
        shutil.copy(os.path.join(adir, f), os.path.join(out, 'assets', f))
print('kész:', out, len(os.listdir(os.path.join(out, 'dem'))), 'adatfájl', '(weboldal)' if web else '(artifact)')
