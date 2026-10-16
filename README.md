# Szélerőmű-rálátás

Magyarázó kalkulátor arról, hogy honnan és mennyire látszik egy nagy szélturbina.
Egyetlen HTML oldal (`index.html`), telepítés nélkül fut a böngészőben.

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
