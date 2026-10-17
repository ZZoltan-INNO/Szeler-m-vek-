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
