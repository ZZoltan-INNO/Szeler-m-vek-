# Szélerőmű-rálátás

Magyarázó kalkulátor arról, hogy honnan és mennyire látszik egy nagy szélturbina.
Két változat, mindkettő egyetlen HTML fájl, telepítés nélkül fut a böngészőben:

- **`alap.html` – alapváltozat**: sík terep, térkép nélkül. Megadható a turbina távolsága, agymagassága és rotorátmérője, a szemmagasság fix 1,7 m. Bokor, épület, fák és domb tehető elé, a helyük és a magasságuk csúszkával állítható. Megmutatja a szemmagasságú képet, az oldalnézetet és hogy mennyi takarásban van. Internet nélkül is működik (csak a betűtípusok töltődnek hálózatról).
- **`index.html` – térképes változat**: valós domborzattal, a lent leírt funkciókkal.

## Térképes változat

## Mit tud

- **Domborzati térkép** (OpenTopoMap, utcatérkép vagy műhold), amelyre letehető egy vagy több turbina és a nézőpont. A jelölők húzhatók.
- **Valós domborzat**: a terepmagasságokat az AWS Terrain Tiles (SRTM alapú, kb. 25–30 m-es rács) csempékből olvassa, a Föld görbületét és a légköri fénytörést (k = 0,13) is beszámítja.
- **Szemmagasságú kép**: torzítatlan (szöghű) látkép a nézőpontból a turbina felé, a domborzattal, a megadott takarásokkal és a turbinával. A takart rész szaggatott vonallal jelölhető, a kép oldalra húzva körbenézhető.
- **Takarások**: bokorsor, tömör kerítés, fasor, erdősáv, családi ház, társasház, földhát. Mindegyiknek állítható a távolsága, magassága, szélessége és oldalirányú eltolása.
- **Nézőpont**: talajszint, árok alja, emelet, magasabb emelet (csúszkával −3…+40 m).
- **Évszak**: nyáron a lombos fák takarnak, télen áttetszők.
- **Eredmény**: a turbina talppontjától számított takart magasság, mi látszik (semmi / csak a lapátvég / gondola és lapátok / szinte minden), mi a takaró elem, mekkora szögben látszik a gép.
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
