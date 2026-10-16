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
