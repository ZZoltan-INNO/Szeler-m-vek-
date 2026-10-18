# Szélerőmű-rálátás

Magyarázó kalkulátor arról, hogy honnan és mennyire látszik egy nagy szélturbina.
Két változat, mindkettő egyetlen HTML fájl, telepítés nélkül fut a böngészőben:

- **`alap.html` – alapváltozat**: sík terep, térkép nélkül. Megadható a turbina távolsága, agymagassága és rotorátmérője, a szemmagasság fix 1,7 m. Bokor, épület, fák és domb tehető elé, a helyük és a magasságuk csúszkával állítható. Megmutatja a szemmagasságú képet, az oldalnézetet és hogy mennyi takarásban van. Internet nélkül is működik (csak a betűtípusok töltődnek hálózatról).
- **`index.html` – térképes változat**: valós domborzattal, a lent leírt funkciókkal. Internetről tölti a térképet és a domborzatot.

### Beépített adatokkal: Ják és 30 km-es környéke

A térképes változat internet nélküli kiadása (claude.ai artifact és a Facebookra szánt weboldal) egy kör
alakú régió adatait tartalmazza, jelenleg Ják 30 km-es környékét (kb. 63 MB):

- **domborzat:** AWS Terrain Tiles z12 (kb. 26 m/px; Ausztriában 10 m-es forrásból),
- **műholdkép:** Copernicus Sentinel-2, 2023–2024 nyara, a 10 m-es eredetiből z14 (kb. 6,5 m/px) és z12,
- **valós épületek:** Overture Maps (OpenStreetMap + Microsoft ML Buildings, ODbL), kb. 200 ezer épület a
  magyar és az osztrák oldalon: elforgatott téglalap alaprajz, becsült gerincmagasság, nyeregtető. A 3D
  nézetben megjelennek, és a takarás számításában is szerepelnek (a nézőpontot tartalmazó saját ház kivételével),
- **fák és erdők:** a Meta és a World Resources Institute lombkorona-magasság térképe (2024, CC BY 4.0;
  2016–2019-es Maxar-légifotókból gépi tanulással, kb. 1 m-es rács, a fák magassága méterben). Ebből
  `tools/build_canopy.py` két dolgot készít: az összefüggő erdőket 6,5 m-es rácson, a mért átlagos famagassággal, és
  minden más fát (kertek, fasorok, facsoportok, magányos fák) egyenként, a helyével, magasságával és koronasugarával
  (a lombkorona helyi csúcsai, vízválasztó szegmentálással). A 3D kép és a számítás ugyanazokat a koronákat használja,
  így a takarási vonaluk építésből egyezik. Télen csak az erdő belseje tömör, a magányos fák, fasorok és erdőszélek
  lombtalanul átlátszók. A famagasság egy csúszkával korrigálható (a felvételek óta a fák nőhettek),
- **utak:** OpenStreetMap (Overture transportation, ODbL). A kocsiutak mentén az úttest szélétől 3 m-ig nincs fa és
  épület (ahol az épület-alaprajz belelógna, ott a ház azt az oldalát visszavágja), a földutakon, járdákon és
  bejárókon magán az úton nincs fa. Így az útra tett nézőpont nem fában vagy házban áll,
- **lakott terület határa** (Ják, Nárai): az épületekből számolt összefüggő beépítés körvonala (nem a hivatalos
  belterületi határ). A térképen szaggatott narancs vonal; minden turbina mellett látszik a határtól mért távolsága,
- **településnevek:** Overture Maps divisions (ODbL), az osztrák falvakkal együtt.
- **a jáki Szent György-templom és a Szent Jakab-kápolna** külön, részletes modellként (kváderkő, kőgúlás tornyok,
  lépcsőzetes kapuzat az apostolfülkékkel, ikerablakok, ívsoros frízek, három szentély, a kápolna hagymasisakja).
  Alaprajz, tájolás, a tornyok és a kápolna magassága OpenStreetMap szerint; a főhajó, a mellékhajók és a szentélyek
  magassága becsült. A 3D modell és a takarásszámítás ugyanabból a magasságmezőből dolgozik,
- **lehetséges telepítési területek:** egy szélerőmű-telepítési átvilágítás szabad (kék) területei áttetsző kékkel és a
  táblázat 14 területe számozva (a területrendezési terv mellékletei és a 700 m-es védőtávolság alapján). A kék foltokat
  `tools/build_sites.py` vágja ki az átvilágítás térképének képéből; a kép illesztése a számozott körökre és a táblázat
  koordinátáira (kb. 50 m-es hiba), a feliratok és vonalak alatti részt a környezetből pótolja,

Előállítás (a régió közepe és sugara paraméter):

```
python3 tools/build_region.py <munka>/dem 47.1425 16.5815 30                          # domborzat + településnevek
python3 tools/build_sat.py <sat_mappa> <index.json>                                    # felvételek kiválasztása (selected.json)
python3 tools/build_sat13.py <sat_mappa> 8 --zoom=12 --region=47.1425,16.5815,30 --out=<munka>/sat
python3 tools/build_sat13.py <sat_mappa> 8 --zoom=14 --region=47.1425,16.5815,30 --out=<munka>/sat
python3 tools/build_buildings.py <munka>/bld <sorcsoportok.json> 12 --region=47.1425,16.5815,30
python3 tools/build_roads.py <munka>/roads.json 47.1425 16.5815 30                     # utak
python3 tools/clear_roads_buildings.py <munka>/bld <munka>/roads.json <munka>/bld_r     # házak az utaktól 3 m-re
# a lombkorona-magasság csempéi (z9 quadkey, kb. 3 GB a régióra) letöltve a <chm> mappába:
#   https://dataforgood-fb-data.s3.amazonaws.com/forests/v1/alsgedi_global_v6_float/chm/<quadkey>.tif
python3 tools/build_canopy.py <chm> <munka>/roads.json <munka>/forest 47.1425 16.5815 30 4   # fák és erdők
python3 tools/build_villages.py <munka>/bld_r <munka>/dem/out/telepulesek.json <munka>/villages.json Ják Nárai
python3 tools/build_sites.py <kép.png> <illesztőpontok.json> <munka>/sites.json --frame=156,344,1256,1462   # átvilágítás kék területei
python3 tools/build_artifact.py --bld=<munka>/bld_r --forest=<munka>/forest --villages=<munka>/villages.json --sites=<munka>/sites.json \
    <munka>/dem/out <kimenet> [alapváltozat_url] <munka>/sat
```

A sorcsoport-listát (az Overture-épületfájlok érintett részei) a `tools/overture_io.py` segédfüggvényeivel
lehet összeállítani; a szkriptek a fájloknak csak a szükséges részét olvassák (HTTP range).

### Közzététel weboldalként (pl. Facebook-csoportba)

```
python3 tools/build_artifact.py --web [--base=https://VÉGLEGES-CÍM/] --bld=<munka>/bld_r --forest=<munka>/forest \
    --villages=<munka>/villages.json [--esri-key=<kulcs>] <munka>/dem/out <kimenet> <munka>/sat
```

Más régió (pl. tesztelésre) ugyanezekkel a lépésekkel készíthető; a `--place=<név>,<szélesség>,<hosszúság>` adja a kezdő
nézőpontot és a feliratokat. Almappába építve (pl. `<kimenet>/gyorujbarat`) egy feltöltéssel több régió is közzétehető.

A `<kimenet>` mappa (index.html, alap.html, dem/, assets/, kb. 63 MB) bármilyen statikus tárhelyre feltölthető.
A legegyszerűbb a Netlify Drop (https://app.netlify.com/drop): ingyenes fiókkal be kell húzni a mappát vagy a ZIP-et.
Ugyanez működik Cloudflare Pages vagy GitHub Pages alatt is. A webes kiadás Facebook-előnézetet (`assets/og.jpg`) és
„Megosztás” gombot kap; a link a címsorban (#…) hordozza a nézőpontot, a turbinákat és a takarásokat.
A `--base` a végleges címmel abszolút útvonalat ad az előnézeti képnek (a Facebook ezt szereti).
A `--esri-key=<kulcs>` nagy felbontású légifotót (Esri World Imagery, kb. 30–50 cm) kapcsol be a webes kiadásban:
„Légifotó” alaptérkép 19-es nagyításig, és a 3D terepen a nézőpont kb. 2×2 km-es környezetében. A kulcs ingyenes
(ArcGIS Location Platform, „Basemaps” jogosultság), és az Esri felületén a weboldal címére kell korlátozni.
Ha a kulcsos elérés nem működik (érvénytelen kulcs, hiányzó jogosultság, oldalcím-korlátozás), ugyanez a légifotó
kulcs nélkül, a nyilvános Esri-szerverről (server.arcgisonline.com) töltődik; a kulcs hibájának oka a térkép alatti
„Változat” felirat fölé víve látszik. Kulcs nélkül is ez a nyilvános elérés működik. Ha az Esri egyáltalán nem érhető el,
az oldal a beépített Sentinel-2 képre vált, és szól. A claude.ai artifact külső képet nem tölthet be,
ott a Sentinel-2 marad.

### A turbina a valódi képen

- **Saját fotó (fotómontázs):** a 3D kép alatti gombbal egy helyszíni fotó tölthető be. A fotó adataiból (EXIF) a hely
  (GPS), a látószög (35 mm-es egyenértékű fókusz), az irány (iránytű) és az évszak (dátum) jön; ami hiányzik, azt a
  térképi nézőpont, a telefonok szokásos fő kamerája (26 mm) és a kijelölt turbina iránya pótolja. A program a turbinát
  valós méretben rárajzolja, és a modell szerinti takarás vonala fölé vágja (a takart rész kérésre pirosan áttűnik).
  Igazításhoz a modell horizontja (sárga vonal), a falunevek és a fokbeosztás látszik; a kép húzható, és csúszkák is
  vannak. A kész kép menthető, a sarkában a forrás feltüntetésével.
- **Élő kamera (AR, telefonon, a nyilvános weboldalon):** a hátsó kamera képére rajzolja a turbinát a GPS, az iránytű és
  a giroszkóp alapján. A kép a giroszkópot követi (sima, nem ugrál), az égtájat az iránytűből csak lassan átlagolva veszi
  át, így az iránytű remegése nem látszik. Igazítás: az „Igazítás: kép megállítása” gombbal a kép megáll, és nyugodtan
  ráhúzható a falunevek vonala vagy (ha süt) a sárga Nap-jel a valódi helyére (az élő képen nincs modell-horizont vonal); két ujjal
  csippentve a kamera látószöge (a modell mérete) állítható, ezt a böngésző megjegyzi. A „Kész” után az igazítás rögzül:
  az iránytű ingadozása és a mágneses zavar (autó, kerítés) már nem mozdítja el, fordulás közben is a helyén marad.
  A kamera látószögét a program mozgás közben magától méri (a giroszkóp szerinti elfordulást összeveti a kép
  elmozdulásával, blokkillesztéssel), így a turbina a kép szélén is a tájhoz képest a helyén marad. A kép megállításakor
  a képen megkeresi az ég és a táj határát, és a modell horizontjához igazítja a dőlést (tagolt tájon az irányt is); ehhez
  azokat a részeket használja, ahol a horizontot 1,5 km-nél távolabbi domb vagy erdő adja. Nyugalomban tartott telefonnál
  a dőlést élő képen is finomhangolja, amíg kézzel nem igazítasz. A dőlés-beállítást a böngésző megjegyzi.
  Az „Iránytű szerint újra” visszaáll. Alapból csak az látszik a turbinából, ami a valóságban is látszani fog; a takart
  rész kérésre (pirosan) bekapcsolható. Pillanatkép menthető. A claude.ai artifactban a kamera nem érhető el.
  A saját fotónál is van Nap-jel, ha a fotóban benne van a készítés ideje.

### Árnyékvetés és villódzás

A Beállítások között egy nap (az év bármelyik napja) és egy időpont (magyar idő, nyári időszámítással) választható. A
Nap helyzetét csillagászati közelítés adja (kb. 0,01°). A térképen látszik a torony és a rotor árnyéka, a rotor
árnyékának útja azon a napon (órákkal), a kb. 2,3 km-es villódzási határ, és hogy az árnyék eléri-e a lakott területet;
a 3D kép ilyenkor a választott napállásból világít. Az éves villódzás-térkép a legrosszabb esetet számolja 20 m-es
rácson, minden nap 2 percenként (mindig süt a Nap, a rotor a Nap felé néz és forog; a Nap 3° fölött; a lapát a napkorong
legalább 20%-át takarja): óra/év és a legtöbb perc egy napon, plusz a lakóházak száma a sávokban. Viszonyításként a
Németországban alkalmazott 30 óra/év és 30 perc/nap irányértéket jelöli.

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
- A fák magassága gépi becslés légifotóról (átlagos hibája néhány méter), a felvételek 2016–2019-esek; az alacsony bokrok (2,5 m alatt) és a 8 km-nél távolabbi magányos fák nem szerepelnek, ezeket kézzel lehet hozzáadni.
- A számítás tájékoztató jellegű, nem helyettesíti a hivatalos látványtervet.

A kiinduló specifikáció: [`docs/szeleromu-lathatosag-spec.md`](docs/szeleromu-lathatosag-spec.md).
