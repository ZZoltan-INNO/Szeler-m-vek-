# Ellenőrzés

Automatikus böngészős tesztekkel (Playwright, Chromium) ellenőrizve.

## Térképes változat (`index.html`)

| Mit | Hogyan | Eredmény |
|---|---|---|
| Rálátás-számítás | 24 véletlen eset 7 magyarországi helyszínen (600 m – 12 km, talaj / árok / emelet, takarásokkal), összevetve egy független Python-implementációval (haversine távolság, gömbi interpoláció) | a terepmagasság azonos, a távolság ≤ 0,04 %, a takart magasság ≤ 2,7 m eltérés 12 km-en |
| Láthatósági térkép | 600 véletlen pont 2 turbina körül, összevetve a pontonkénti számítással | 595/600 egyezik; az eltérések a kategóriahatárokon (< 15 m) vannak |
| Szemmagasságú kép | a turbina takarási vonala a képen vs. a számolt takart magasság | 1–2 képponton belül (≈ 1–2 m) |
| Kezelőelemek | típusválasztó, egyedi méret, nézőpont-magasság, évszak, 7 takarástípus és csúszkáik, oldalirányú eltolás, látószög, kép húzása, térképkattintás, jelölők húzása, felugró ablak, táblázat, keresés (név, koordináta, Google Térkép-link), láthatósági térkép, megosztható link, hibás link | 46/46 rendben |
| Hálózati hibák | teljesen offline; egy domborzati csempe hiányzik; átmeneti hiba | offline: sík terepként számol és jelzi; hiányzó csempénél nem számol hamis adattal; átmeneti hibánál az újrapróbálás után helyes eredmény |
| Megjelenés | 375 px mobil sötét módban, asztali világos módban | nincs vízszintes túlcsordulás |

## Alapváltozat (`alap.html`)

| Mit | Eredmény |
|---|---|
| A specifikáció ellenőrző értékei (1,5 km) | bokor 24 m, fasor 10 m → 126 m, 15 m → 201 m, 20 m → 276 m, lapátvég 9,4°, 15 m-es fa 100 m-ről 7,6° |
| Domb legnagyobb takarási szöge vs. 20 000 pontos mintavételezés | ≤ 0,03 m eltérés a turbinánál |
| Kategóriahatárok (lapátvég / agy / rotor alja) | helyes |
| Kezelőelemek (gyorsgombok, csúszkák, 4 elemtípus, törlés, határértékek, közeli magas épület), kép és oldalnézet feliratai | rendben; az alapváltozat mind a 36 ellenőrzése sikeres, nincs JavaScript-hiba |
| Megjelenés | 360 px sötét és 800 px világos módban nincs túlcsordulás |

## Méretarány: a 3D kép a távolsággal arányosan, torzítás nélkül változik-e

Szkript: `tools/check_scale.cjs` (Playwright, a webes kiadáson). 54 eset: 9 távolság (0,3–20 km) × 3 látószög
(65°, 40°, 15°) × 2 képernyő (1300 és 400 px széles). Minden esetben négy független ellenőrzés:

1. **Geometria:** a 3D modell térbeli pontjai (talppont, agy, lapátvégek) a megadott méretekkel és távolsággal:
   legnagyobb eltérés 2 mm. (Javítva: korábban a rotor középpontja 0,4 m-rel az agymagasság felett volt, és a
   lapát 0,3%-kal hosszabb, így a lapátvég 250,66 m-en járt 250 m helyett.)
2. **Távolság:** a program helyi síkkoordinátás távolsága a WGS84 ellipszoidon számolt (Vincenty) távolsághoz
   képest: legfeljebb 0,02% (20 km-en 3,5 m).
3. **Vetítés:** a lapátvég és a talppont magasságába tett jelölők képpont-helye egy független kameramodellel
   számolt helyhez képest: legfeljebb 0,26 képpont; a turbina képmagassága (a lapátvégtől a talppontig)
   legfeljebb 0,26 képpontra egyezik a várttal (pl. 40°-os látószög, 1300 px: 1 km → 233,8 px, 2 km → 118,3 px,
   5 km → 47,5 px, 20 km → 11,9 px).
4. **Fokbeosztás:** a kép bal szélén lévő emelkedési szögek feliratai pontosan (0,0 px) a független modell szerinti helyen vannak.

Arányosság: a képmagasság × távolság ÷ fókusztávolság szorzat kis szögeknél állandó, 250 m (a lapátvég magassága)
a képpont-kerekítésen belül (±2 m); közeli távolságokon (0,3–1 km) kisebb, mert ott már nem kicsi a szög, és a
helyes összefüggés az arkusz-tangens, nem az 1/távolság (a mért értékek ott is a várttal egyeznek, lásd 3.).
A képernyő méretétől a szögek nem függnek: ugyanaz a jelenet 1300 és 400 px szélesen ugyanakkora szögben látszik.

## Erdők: a 3D kép és a számítás ugyanazt a takarást mutatja-e

A 3D nézet és a takarásszámítás ugyanabból a determinisztikus koronarácsból dolgozik (`forestCrown` az
`index.html`-ben): a nézőpont körüli gyűrűkben, rögzített szögosztással, a WorldCover-térkép alapján kerül
egy-egy korona a fás képpontokra, és a számítás a látóvonal mentén pontosan ezeket a koronákat metszi.
Ellenőrzés: Ják környéki erdők és erdőszélek mögé tett turbinákkal, nyáron és télen; a 3D képen mért
takarási vonal (a pirosan áttűnő rész határa) vs. a számolt takart magasság.

| Eset | Számítás | 3D kép |
|---|---|---|
| nyár, erdőszél/fasor 611 m-re, turbina 1,6 km | 56,6 m | 56,9 m |
| nyár, erdő 351 m-re, turbina 1,6 km | 123,9 m | 124,2 m |
| nyár, erdő 272 m-re, turbina 1,6 km | 121,7 m | 122,1 m |
| tél, erdő 144 m-re, turbina 1,2 km | 139,6 m | 138,0 m |
| tél, erdő 299 m-re, turbina 1,6 km | 129,9 m | 129,6 m |
| tél, erdő 351 m-re, turbina 1,6 km | 123,9 m | 124,2 m |

Legnagyobb eltérés 1,6 m (kb. egy képpont). Az épületeknél ugyanez a próba (nyereg- és kontytetős házak
100–140 m-re) ≤ 2,1 m eltérést ad, és a képre kattintva a szerkesztő mindig az ott látszó házzal nyílik.

## Lakott terület határa és a turbinák távolsága

A határ az épületekből számolt összefüggő beépítés (`tools/build_villages.py`): Ják kb. 1,76 km², Nárai kb. 0,95 km²
(két részből). A turbina távolsága a sokszög legközelebbi élétől (helyi síkkoordinátákban); független
ellenőrzésként a csúcspontokig mért legkisebb távolsággal összevetve (pl. 47,1660 / 16,5850-nél Ják 1125 m,
Nárai 2780 m). A címke a turbina húzásakor frissül, a turbinalistában is megjelenik. Alaphelyzetben nincs
turbina és kézi takarás; az Alaphelyzet gomb a fejlécben van. 400 és 1300 px szélesen: 14/14 rendben.
