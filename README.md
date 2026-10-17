# Szélerőmű-rálátás

Magyarázó kalkulátor arról, hogy honnan és mennyire látszik egy nagy szélturbina.
Két változat, mindkettő egyetlen HTML fájl, telepítés nélkül fut a böngészőben:

- **`alap.html` – alapváltozat**: sík terep, térkép nélkül. Megadható a turbina távolsága, agymagassága és rotorátmérője, a szemmagasság fix 1,7 m. Bokor, épület, fák és domb tehető elé, a helyük és a magasságuk csúszkával állítható. Megmutatja a szemmagasságú képet, az oldalnézetet és hogy mennyi takarásban van. Internet nélkül is működik (csak a betűtípusok töltődnek hálózatról).
- **`index.html` – térképes változat**: valós domborzattal, a lent leírt funkciókkal. Internetről tölti a térképet és a domborzatot.

### Beépített adatokkal (claude.ai artifact)

A térképes változat internet nélküli kiadása, amely telefonon, a Claude alkalmazásban is működik:
a magyarországi domborzat (kb. 50 m-es rács), a Sentinel-2 műholdkép (nagyításkor kb. 13 m/px, a 10 m-es
eredeti felbontásból) és kb. 1100 településnév az oldal mellett van. Háttértérkép (utak, folyók) nincs benne.

Előállítás:

```
python3 tools/build_dem.py <munkamappa> <telepulesek.json>     # domborzati blokkok
python3 tools/build_sat.py <sat_mappa> <munkamappa>/out/index.json  # műholdkép z12 + z9 (20 m-es szintről)
python3 tools/build_sat13.py <sat_mappa> 8                          # éles műholdkép z13 (10 m-es eredetiből)
python3 tools/build_artifact.py <munkamappa>/out <kimenet> [alapváltozat_url] <sat_mappa>/out
```

Településnevek: GeoNames (CC BY 4.0) az `all-the-cities` (MIT) és a `countries-states-cities-service` (MIT) npm-csomagokon keresztül.

### Közzététel weboldalként (pl. Facebook-csoportba)

```
python3 tools/build_artifact.py --web [--base=https://VÉGLEGES-CÍM/] <munkamappa>/out <kimenet> <muhold_mappa>
```

A `<kimenet>` mappa (index.html, alap.html, dem/, assets/, kb. 80 MB) bármilyen statikus tárhelyre feltölthető.
A legegyszerűbb a Netlify Drop (https://app.netlify.com/drop): ingyenes fiókkal be kell húzni a mappát vagy a ZIP-et.
Ugyanez működik Cloudflare Pages vagy GitHub Pages alatt is. A webes kiadás Facebook-előnézetet (`assets/og.jpg`) és
„Megosztás” gombot kap; a link a címsorban (#…) hordozza a nézőpontot, a turbinákat és a takarásokat.
A `--base` a végleges címmel abszolút útvonalat ad az előnézeti képnek (a Facebook ezt szereti).

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
