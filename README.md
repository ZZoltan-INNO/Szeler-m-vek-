# Szélerőmű-rálátás

Magyarázó kalkulátor arról, hogy honnan és mennyire látszik egy nagy szélturbina.
Két változat, mindkettő egyetlen HTML fájl, telepítés nélkül fut a böngészőben:

- **`alap.html` – alapváltozat**: sík terep, térkép nélkül. Megadható a turbina távolsága, agymagassága és rotorátmérője, a szemmagasság fix 1,7 m. Bokor, épület, fák és domb tehető elé, a helyük és a magasságuk csúszkával állítható. Megmutatja a szemmagasságú képet, az oldalnézetet és hogy mennyi takarásban van. Internet nélkül is működik (csak a betűtípusok töltődnek hálózatról).
- **`index.html` – térképes változat**: valós domborzattal, a lent leírt funkciókkal. Internetről tölti a térképet és a domborzatot.

### Beépített adatokkal: Ják és 30 km-es környéke

A térképes változat internet nélküli kiadása (claude.ai artifact és a Facebookra szánt weboldal) egy kör
alakú régió adatait tartalmazza, jelenleg Ják 30 km-es környékét (kb. 28 MB):

- **domborzat:** AWS Terrain Tiles z12 (kb. 26 m/px; Ausztriában 10 m-es forrásból),
- **műholdkép:** Copernicus Sentinel-2, 2023–2024 nyara, a 10 m-es eredetiből z14 (kb. 6,5 m/px) és z12,
- **valós épületek:** Overture Maps (OpenStreetMap + Microsoft ML Buildings, ODbL), kb. 200 ezer épület a
  magyar és az osztrák oldalon: elforgatott téglalap alaprajz, becsült gerincmagasság, nyeregtető. A 3D
  nézetben megjelennek, és a takarás számításában is szerepelnek (a nézőpontot tartalmazó saját ház kivételével),
- **településnevek:** Overture Maps divisions (ODbL), az osztrák falvakkal együtt.

Előállítás (a régió közepe és sugara paraméter):

```
python3 tools/build_region.py <munka>/dem 47.1425 16.5815 30                          # domborzat + településnevek
python3 tools/build_sat.py <sat_mappa> <index.json>                                    # felvételek kiválasztása (selected.json)
python3 tools/build_sat13.py <sat_mappa> 8 --zoom=12 --region=47.1425,16.5815,30 --out=<munka>/sat
python3 tools/build_sat13.py <sat_mappa> 8 --zoom=14 --region=47.1425,16.5815,30 --out=<munka>/sat
python3 tools/build_buildings.py <munka>/bld <sorcsoportok.json> 12 --region=47.1425,16.5815,30
python3 tools/build_artifact.py --bld=<munka>/bld <munka>/dem/out <kimenet> [alapváltozat_url] <munka>/sat
```

A sorcsoport-listát (az Overture-épületfájlok érintett részei) a `tools/overture_io.py` segédfüggvényeivel
lehet összeállítani; a szkriptek a fájloknak csak a szükséges részét olvassák (HTTP range).

### Közzététel weboldalként (pl. Facebook-csoportba)

```
python3 tools/build_artifact.py --web [--base=https://VÉGLEGES-CÍM/] --bld=<munka>/bld <munka>/dem/out <kimenet> <munka>/sat
```

A `<kimenet>` mappa (index.html, alap.html, dem/, assets/, kb. 28 MB) bármilyen statikus tárhelyre feltölthető.
A legegyszerűbb a Netlify Drop (https://app.netlify.com/drop): ingyenes fiókkal be kell húzni a mappát vagy a ZIP-et.
Ugyanez működik Cloudflare Pages vagy GitHub Pages alatt is. A webes kiadás Facebook-előnézetet (`assets/og.jpg`) és
„Megosztás” gombot kap; a link a címsorban (#…) hordozza a nézőpontot, a turbinákat és a takarásokat.
A `--base` a végleges címmel abszolút útvonalat ad az előnézeti képnek (a Facebook ezt szereti).
A `--esri-key=<kulcs>` nagy felbontású légifotót (Esri World Imagery, kb. 30–50 cm) kapcsol be a webes kiadásban:
„Légifotó” alaptérkép 19-es nagyításig, és a 3D terepen a nézőpont kb. 2×2 km-es környezetében. A kulcs ingyenes
(ArcGIS Location Platform, „Basemaps” jogosultság), és az Esri felületén a weboldal címére kell korlátozni.
Érvénytelen kulcsnál az oldal magától a beépített Sentinel-2 képre vált. A claude.ai artifact külső képet nem tölthet be,
ott a Sentinel-2 marad.

## Térképes változat

## Mit tud

- **Domborzati térkép** (OpenTopoMap, utcatérkép vagy műhold), amelyre letehető egy vagy több turbina és a nézőpont. A jelölők húzhatók.
- **Valós domborzat**: a terepmagasságokat az AWS Terrain Tiles (SRTM alapú, kb. 25–30 m-es rács) csempékből olvassa, a Föld görbületét és a légköri fénytörést (k = 0,13) is beszámítja.
- **Szemmagasságú kép**: torzítatlan (szöghű) látkép a nézőpontból a turbina felé, a domborzattal, a megadott takarásokkal és a turbinával. A takart rész szaggatott vonallal jelölhető, a kép oldalra húzva körbenézhető.
- **Takarások**: bokorsor, tömör kerítés, fasor, erdősáv, családi ház, társasház, földhát. Mindegyiknek állítható a távolsága, magassága, szélessége és oldalirányú eltolása.
- **Nézőpont**: talajszint, árok alja, emelet, magasabb emelet (csúszkával −3…+40 m).
- **Évszak**: nyáron a lombos fák takarnak, télen áttetszők.
- **Eredmény**: a turbina talppontjától számított takart magasság, mi látszik (semmi / csak a lapátvég / gondola és lapátok / szinte minden), mi a takaró elem, mekkora szögben látszik a gép.
- **Fotórealisztikus 3D nézet** (three.js, `src/realview.js`, mindkét változatban): valós fotó-textúrák az `assets/` mappában. Levél- és kéregfotók, fű: ez-tree (MIT, © Daniel Greenheck). Égbolt-fény: Poly Haven „Quarry 01” HDRI (CC0), RGBE-bájtokként PNG-be csomagolva (`tools/hdr2png.py`), mert az artifact nem szolgál ki `.hdr` fájlt. Terep: Sentinel-2 műholdkép. A turbina takart része pirosan áttűnik.
- **Oldalnézet**: terepmetszet a rálátás határvonalával.
- **Láthatósági térkép**: 5–20 km sugarú körben kiszínezi, honnan látszik a lapátvég, a gondola vagy a teljes rotor (csak domborzattal számolva).
- **Megosztható link**: a beállítások a címsorban tárolódnak.

## Használat

Nyisd meg az `index.html` fájlt böngészőben, vagy kapcsold be a GitHub Pages-t a repóra
(Settings → Pages → Branch: a kívánt ág, `/ (root)`), és a kalkulátor a Pages címen érhető el.

Internetkapcsolat kell hozzá: a térképcsempék, a domborzati adat és a Leaflet könyvtár is hálózatról töltődik.

## Korlátok

- A domborzati modell kb. 25–30 m felbontású: kis árkokat, töltéseket, egyes fákat nem lát, ezeket kézzel kell megadni.
- Erdős területen a modell részben a lombkorona magasságát méri.
- A számítás tájékoztató jellegű, nem helyettesíti a hivatalos látványtervet.

A kiinduló specifikáció: [`docs/szeleromu-lathatosag-spec.md`](docs/szeleromu-lathatosag-spec.md).
