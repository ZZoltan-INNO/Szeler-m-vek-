# Szélerőmű láthatósági kalkulátor – méretarányos takarásszámítás

## Cél

Egy önálló HTML oldal (egy fájl, külső függőség nélkül), amely méretarányosan megmutatja,
mennyi látszik egy nagy szélturbinából adott távolságról, ha a néző előtt bokorsor
és fasor áll. Lakossági fórumon, laptopon és telefonon is használható legyen.

## Alapadatok (alapértékek)

| Paraméter | Érték | Megjegyzés |
|---|---|---|
| Szemmagasság | 1,7 m | fix |
| Turbina agymagassága | 165 m | SG 7.0-170 jellegű gép |
| Rotorsugár | 85 m | 170 m-es rotor |
| Lapátvég magassága | 250 m | agy + sugár |
| Torony talpszélessége | kb. 7 m | csak a rajzhoz |
| Távolság a turbinától | 1500 m | csúszka: 500–3000 m, lépés 100 |
| Fasor magassága | 15 m | csúszka: 0–25 m, lépés 1 |
| Fasor távolsága | 100 m | csúszka: 30–400 m, lépés 10 |
| Bokorsor magassága | 2 m | csúszka: 0–4 m, lépés 0,5 |
| Bokorsor távolsága | 20 m | fix |

Feltételezések: sík terep, lombos (átlátszatlan) fák, a fa- és a bokorsor a teljes
látómezőn végighúzódik, a lapát a legmagasabb állásban, a Föld görbülete elhanyagolva
(1,5 km-en kb. 0,18 m).

## Számítás

Minden takaró elem a szemmagasság feletti magasságával egy emelkedési szöget takar el:

```
α_fa    = atan( max(H_fa − 1,7 ; 0) / d_fa )
α_bokor = atan( max(H_bokor − 1,7 ; 0) / d_bokor )
α_max   = max(α_fa, α_bokor)
```

A turbinánál ez a szög ekkora magasságig takar:

```
h_takart = 1,7 + D · tan(α_max)
```

A turbina részeinek látószöge:

```
α_lapátvég = atan((250 − 1,7) / D)
α_agy      = atan((165 − 1,7) / D)
α_rotor    = atan(85 / D)          (a rotorsugár szögmérete)
```

Szöveges kiértékelés `h_takart` alapján:

- `h_takart ≥ 250` → „Semmi nem látszik a turbinából: a fasor teljesen eltakarja.”
- `165 ≤ h_takart < 250` → „Csak a lapátok felső része látszik, X m felett. A torony és a gondola takarásban van.”
- `80 ≤ h_takart < 165` → „A gondola és a lapátok látszanak, a torony alsó X méterét takarja az előtér.”
- `h_takart < 80` → „Szinte az egész turbina látszik, csak az alsó X m van takarásban.”

Ellenőrző értékek az alapadatokkal (D = 1500 m):

| Eset | Takart magasság a turbinánál |
|---|---|
| Csak a 2 m-es bokor 20 m-re | kb. 24 m |
| 10 m-es fasor 100 m-re | kb. 126 m |
| 15 m-es fasor 100 m-re | kb. 201 m (csak a lapátvég látszik) |
| 20 m-es fasor 100 m-re | kb. 276 m (teljesen takarva) |
| Lapátvég látószöge | kb. 9,4° |
| 15 m-es fa látószöge 100 m-ről | kb. 7,6° |

## Megjelenítés

1. **Szemmagasságból látott kép (SVG, 360×250 viewBox):**
   - Függőleges tengely: emelkedési szög fokban, lineárisan (`px = szög · k`).
     A skála felső határa `max(12°, 1,15 · α_lapátvég, 1,15 · α_max)`.
   - Bal szélen fokbeosztás kétfokonként.
   - Rajzolási sorrend: ég, talaj, turbina (torony trapézként, gondola, 3 lapát: −90°, 30°, 150°),
     majd erre a fasor, végül a bokorsor kitöltött, enyhén hullámos felső élű sávként,
     hogy valóban eltakarják a turbinát.
   - A turbina szögméreteit a fenti képletekből számolja, így a távolság csúszkára zsugorodik.
2. **Eredményszöveg** a kép alatt: takart magasság és a szöveges kiértékelés, plusz egy
   viszonyítás: kinyújtott karral a hüvelykujj kb. 2° széles, az ököl kb. 10° magas.
3. **Oldalnézet valódi méretarányban (SVG):** néző bal oldalon, turbina jobb oldalon,
   azonos vízszintes és függőleges léptékkel; bokor- és fasor vékony téglalapként;
   piros szaggatott rálátási vonal a szemtől a turbinánál számolt `h_takart` magasságig.
4. **Csúszkák** a fenti tartományokkal, élő frissítéssel, kiírt értékekkel.

## Stílus

- Világos és sötét mód (`prefers-color-scheme`), egyszerű, lapos színek (ég kékes, talaj zöld,
  fasor sötétzöld, bokor világosabb zöld, turbina fehér szürke körvonallal).
- Mobilon is olvasható, 16 px oldalmargó, vízszintes görgetés nélkül.
- Magyar nyelvű feliratok.
- A kép alatt apró betűs megjegyzés a feltételezésekről, és figyelmeztetés: télen,
  lombhullás után a fasor áttetsző; magasabb nézőpontról (emelet, domb) a takarás erősen csökken.

## Referencia-implementáció

Az alábbi kód a beszélgetésben elkészült működő változat (beágyazott widgetként írva,
CSS-változókkal). Önálló oldallá alakításhoz add hozzá a `<!doctype html>` vázat,
a `viewport` metát, és cseréld le a `var(--text-…)` változókat saját színtokenekre.

```html
<style>
.row{display:flex;align-items:center;gap:10px;margin:6px 0;font-size:13px;color:var(--text-secondary)}
.row label{min-width:150px}.row input{flex:1}.row span{min-width:52px;text-align:right;font-weight:500;color:var(--text-primary)}
.cap{font-size:12px;color:var(--text-muted);margin:2px 0 10px}
</style>
<div style="font-size:13px;color:var(--text-secondary);margin:.5rem 0 4px">Szemmagasságból nézve (1,7 m), torzítás nélkül</div>
<svg id="view" viewBox="0 0 360 250" width="100%" role="img" aria-label="A néző által látott kép a szélerőműről, előtérben bokor- és fasorral"></svg>
<div id="res" style="font-size:14px;margin:6px 0 12px;line-height:1.6"></div>
<div style="font-size:13px;color:var(--text-secondary);margin:4px 0">Oldalnézet, valódi méretarányban</div>
<svg id="side" viewBox="0 0 360 120" width="100%" role="img" aria-label="Oldalnézet a rálátás vonalával"></svg>
<div class="cap">A szaggatott vonal a rálátás határa: ami alatta van, azt a fák vagy a bokrok takarják.</div>
<div class="row"><label>Távolság a turbinától</label><input type="range" id="D" min="500" max="3000" step="100" value="1500"><span id="Do"></span></div>
<div class="row"><label>Fasor magassága (100 m-re)</label><input type="range" id="T" min="0" max="25" step="1" value="15"><span id="To"></span></div>
<div class="row"><label>Fasor távolsága</label><input type="range" id="Td" min="30" max="400" step="10" value="100"><span id="Tdo"></span></div>
<div class="row"><label>Bokorsor magassága (20 m-re)</label><input type="range" id="B" min="0" max="4" step="0.5" value="2"><span id="Bo"></span></div>
<div class="cap">Turbina: 165 m agymagasság, 170 m rotor (SG 7.0-170 jellegű), lapátvég 250 m. Sík terep, lombos fák, a lapát a legmagasabb állásban.</div>
<script>
const $=i=>document.getElementById(i);
const dark=matchMedia('(prefers-color-scheme: dark)').matches;
const C={sky:dark?'#1d2a36':'#e6f1fb',ground:dark?'#2b3a1f':'#c0dd97',turb:dark?'#e8e6df':'#ffffff',edge:dark?'#b4b2a9':'#5f5e5a',tree:dark?'#27500a':'#3b6d11',bush:dark?'#3b6d11':'#639922',txt:dark?'#c3c2b7':'#52514e',line:'#e24b4a'};
const EYE=1.7,HUB=165,R=85,TIP=HUB+R;
const deg=r=>r*180/Math.PI;
function draw(){
 const D=+$('D').value,T=+$('T').value,Td=+$('Td').value,B=+$('B').value,Bd=20;
 $('Do').textContent=(D/1000).toFixed(1)+' km';$('To').textContent=T+' m';$('Tdo').textContent=Td+' m';$('Bo').textContent=B+' m';
 const aT=Math.atan(Math.max(T-EYE,0)/Td),aB=Math.atan(Math.max(B-EYE,0)/Bd),aMax=Math.max(aT,aB);
 const hidden=EYE+D*Math.tan(aMax);
 const aTip=Math.atan((TIP-EYE)/D),aHub=Math.atan((HUB-EYE)/D),aR=Math.atan(R/D);
 const top=Math.max(12,deg(aTip)*1.15,deg(aMax)*1.15);const k=230/top,gy=240,cx=180;
 const Y=a=>gy-deg(a)*k;
 let s=`<rect width="360" height="250" fill="${C.sky}"/><rect y="${gy}" width="360" height="10" fill="${C.ground}"/>`;
 for(let g=2;g<top;g+=2){s+=`<line x1="0" x2="8" y1="${gy-g*k}" y2="${gy-g*k}" stroke="${C.txt}" stroke-width=".6"/><text x="11" y="${gy-g*k+3}" font-size="9" fill="${C.txt}">${g}°</text>`}
 const hx=cx,hy=Y(aHub),rl=deg(aR)*k,tw=Math.max(deg(Math.atan(3.5/D))*k,1.2);
 s+=`<polygon points="${hx-tw},${gy} ${hx+tw},${gy} ${hx+tw*.6},${hy} ${hx-tw*.6},${hy}" fill="${C.turb}" stroke="${C.edge}" stroke-width=".7"/>`;
 [-90,30,150].forEach(a=>{const r=a*Math.PI/180,ex=hx+rl*Math.cos(r),ey=hy+rl*Math.sin(r),w=Math.max(rl*.035,.8),nx=-Math.sin(r)*w,ny=Math.cos(r)*w;
  s+=`<polygon points="${hx+nx},${hy+ny} ${ex},${ey} ${hx-nx},${hy-ny}" fill="${C.turb}" stroke="${C.edge}" stroke-width=".7"/>`});
 s+=`<rect x="${hx-tw*2.2}" y="${hy-tw*.9}" width="${tw*3.6}" height="${tw*1.8}" fill="${C.turb}" stroke="${C.edge}" stroke-width=".7"/>`;
 if(T>EYE){let p=`M0,${gy}`;for(let x=0;x<=360;x+=6){const v=1+.07*Math.sin(x*.21)+.05*Math.sin(x*.53+1);p+=` L${x},${gy-deg(Math.atan((T-EYE)*v/Td))*k}`}s+=`<path d="${p} L360,${gy} Z" fill="${C.tree}"/>`}
 if(B>EYE){let p=`M0,${gy}`;for(let x=0;x<=360;x+=4){const v=1+.15*Math.sin(x*.4)+.1*Math.sin(x*1.3);p+=` L${x},${gy-deg(Math.atan((B-EYE)*v/Bd))*k}`}s+=`<path d="${p} L360,${gy} Z" fill="${C.bush}"/>`}
 $('view').innerHTML=s;
 let vis;
 if(hidden>=TIP) vis='Semmi nem látszik a turbinából: a fasor teljesen eltakarja.';
 else if(hidden>=HUB) vis=`Csak a lapátok felső része látszik, ${Math.round(hidden)} m felett. A torony és a gondola takarásban van.`;
 else if(hidden>=HUB-R) vis=`A gondola és a lapátok látszanak, a torony alsó ${Math.round(hidden)} méterét takarja az előtér.`;
 else vis=`Szinte az egész turbina látszik, csak az alsó ${Math.round(hidden)} m van takarásban.`;
 $('res').innerHTML=`<b style="font-weight:500">Takarva a talajtól kb. ${Math.round(Math.min(hidden,TIP))} m-ig.</b> ${vis}<br><span style="font-size:12px;color:var(--text-muted)">A lapátvég ${deg(aTip).toFixed(1)}°-ban látszik a látóhatár felett. Összehasonlításul: kinyújtott karral a hüvelykujj kb. 2° széles, az ököl kb. 10° magas.</span>`;
 const W=340,ks=W/D,kv=ks,x0=10,g2=110,yy=h=>g2-h*kv;let ss=`<rect y="${g2}" width="360" height="10" fill="${C.ground}"/>`;
 const xt=x0+D*ks;ss+=`<line x1="${xt}" y1="${g2}" x2="${xt}" y2="${yy(HUB)}" stroke="${C.edge}" stroke-width="1.2"/><line x1="${xt}" y1="${yy(HUB-R)}" x2="${xt}" y2="${yy(TIP)}" stroke="${C.edge}" stroke-width=".8"/>`;
 if(T>0)ss+=`<rect x="${x0+Td*ks-1}" y="${yy(T)}" width="2.5" height="${T*kv}" fill="${C.tree}"/>`;
 if(B>0)ss+=`<rect x="${x0+Bd*ks-1}" y="${yy(B)}" width="2" height="${Math.max(B*kv,.6)}" fill="${C.bush}"/>`;
 ss+=`<line x1="${x0}" y1="${yy(EYE)}" x2="${xt}" y2="${yy(Math.min(hidden,300))}" stroke="${C.line}" stroke-width=".8" stroke-dasharray="3 2"/>`;
 ss+=`<text x="${x0}" y="${g2-4}" font-size="9" fill="${C.txt}">néző</text><text x="${xt-4}" y="${Math.max(yy(TIP)-3,9)}" font-size="9" text-anchor="end" fill="${C.txt}">250 m</text>`;
 $('side').setAttribute('viewBox',`0 ${Math.min(0,yy(TIP)-12)} 360 ${g2+12-Math.min(0,yy(TIP)-12)}`);$('side').innerHTML=ss;
}
['D','T','Td','B'].forEach(i=>$(i).addEventListener('input',draw));draw();
</script>
```

## Lehetséges bővítések

- Nézőpont magassága csúszka (földszint, emelet, domb), mert ez erősen csökkenti a takarást.
- Téli mód: a fasor félig áttetsző (pl. 40% átlátszatlanság).
- Több turbina egymás mellett, valós elrendezéssel.
- Turbinatípus választó (pl. V150: 169 m agy, 150 m rotor; V172: 175–199 m agy, 172 m rotor).
