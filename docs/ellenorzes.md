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

## Fák és erdők: a 3D kép és a számítás ugyanazt a takarást mutatja-e

Adat: a Meta / WRI lombkorona-magasság térképe (kb. 1 m-es rács), ebből `tools/build_canopy.py` összefüggő erdőket
(6,5 m-es rács, mért átlagos famagasság) és egyes fákat (hely, magasság, koronasugár) készít. A 3D nézet és a
takarásszámítás ugyanazokat a koronákat használja (`forestCrown`, `treeItem`, `crownShape`, `crownHeight` az
`index.html`-ben; a 3D motor csak kirajzolja a megadott alakot). Ellenőrzés: Ják környéki fák, erdők és erdőszélek
mögé tett turbinákkal, nyáron és télen; a 3D képen mért takarási vonal (a pirosan áttűnő rész határa) vs. a
számolt takart magasság.

| Eset | Számítás | 3D kép |
|---|---|---|
| nyár, erdő (25 m magas) 377 m-re, turbina 1,2 km | 81,4 m | 81,2 m |
| nyár, erdőszél (17 m) 144 m-re, turbina 1,2 km | 131,3 m | 129,2 m |
| nyár, egyes fa (5 m) 101 m-re, turbina 2,4 km | 72,9 m | 67,9 m |
| nyár, egyes fa (7 m) 400 m-re, turbina 2,8 km | 43,0 m | 42,5 m |
| nyár, egyes fa (9 m) 157 m-re, turbina 3,2 km | 115,5 m | 113,7 m |
| tél, erdő (25 m) 377 m-re, turbina 1,2 km | 81,4 m | 81,2 m |
| tél, erdő (21 m) 716 m-re, turbina 1,2 km | 45,0 m | 45,3 m |
| tél, erdő (22 m) 389 m-re, turbina 1,2 km | 70,2 m | 70,9 m |

A 3D képen a határ az a legalsó sor, ahol a torony középső öt képpontoszlopából legalább három látszik (egy-egy
levélrés nem számít). Az erdőknél és a gömbkoronás fáknál az eltérés legfeljebb 2 m. A közeli, levélcsokros fáknál
a korona széle ritkás: ott a számítás a csokrok peremének kb. felénél–kétharmadánál húzza meg a takarás határát, a
kép ettől néhány méterrel (a fánál néhány centiméterrel) eltérhet. A tesztből kimaradnak a súroló esetek, ahol a
korona széle épp a torony tengelyén megy át (ott a turbinát 1–2 m-rel oldalra tolva teljesen más a takarás, és a
torony egyik fele látszik, a másik nem).

Javítva a próba során: (1) a 3D gömbkorona csomóssága 20%-ról 5%-ra csökkent, mert a peremen a számítás teljes
ellipszoidja és a behúzott 3D felület között nagy volt a különbség; (2) a házak ereszkinyúlása eddig laposabban
indult, mint a tetősík, így az eresz közelében a 3D tető legfeljebb 0,2 m-rel magasabb volt a számításnál (134 m-es
háznál, 2,75 km-es turbinánál ez 2,3 m-t jelentett); most a kinyúlás a tetősík meghosszabbítása.

## Utak: a nézőpont az úton szabadon áll

Utak: OpenStreetMap (Overture transportation). A kocsiutak (autópálya … lakóutca) mentén az úttest fele + 3 m-en belül
nincs fa (a lombkorona-térképből törölve, mielőtt a fákat kiemeli) és épület; a földutakon, járdákon, bejárókon
(service) magán az úton nincs fa. Az épületeknél `tools/clear_roads_buildings.py` a belelógó oldalt vágja vissza:
a régió 201 081 épületéből 17 801 rövidült (többnyire néhány tized métert), 1 692 maradt el (3 m-nél keskenyebb
vagy 12 m²-nél kisebb maradt volna). A „service” utakat szándékosan nem vettük a kocsiutak közé: ezek gyakran a
házak mellett futó bejárók, és 3 m-es sávjuk sok valós házat megcsonkított volna (így 26 042 rövidült volna).

## Házak: kémény, gerinccserép, eresz

A lakóház méretű, magastetős épületeken egy kémény áll a gerincen (0,55 m széles, 0,7 m-rel a gerinc fölé nyúlik);
ez a számításban is szerepel (`bldHit`), így a 3D kép és a számítás itt is egyezik. A gerinccserép teteje pontosan
a gerincmagasság, az eresz az ereszmagasság alatt van, ezek a takarást nem változtatják. A ház-próba (nyereg- és
kontytetős házak 270–530 m-re) a kéményekkel: 11/11 rendben, legnagyobb eltérés 0,9 m.

## Lakott terület határa és a turbinák távolsága

A határ az épületekből számolt összefüggő beépítés (`tools/build_villages.py`): Ják kb. 1,76 km², Nárai kb. 0,95 km²
(két részből). A turbina távolsága a sokszög legközelebbi élétől (helyi síkkoordinátákban); független
ellenőrzésként a csúcspontokig mért legkisebb távolsággal összevetve (pl. 47,1660 / 16,5850-nél Ják 1125 m,
Nárai 2780 m). A címke a turbina húzásakor frissül, a turbinalistában is megjelenik. Alaphelyzetben nincs
turbina és kézi takarás; az Alaphelyzet gomb a fejlécben van. 400 és 1300 px szélesen: 14/14 rendben.
