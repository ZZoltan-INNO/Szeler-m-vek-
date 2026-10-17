// Méretarány-ellenőrzés: a 3D kép a valódi geometriát mutatja-e minden távolságon, látószögön és képernyőn.
// 1. geometria: a turbina térbeli pontjai (talppont, agy, lapátvégek) a megadott méretekkel és távolsággal
// 2. távolság: a program számítása vs. független ellipszoidi (Vincenty) távolság
// 3. vetítés: ismert pontokra tett jelölők képpont-helye vs. független kameramodell
// 4. a valódi turbina képe (közeli távolságokon, ahol a lapát több képpont széles)
// 5. fokbeosztás: a feliratok helye vs. független kameramodell
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const SP = process.env.SP || '.', U = process.env.URL || 'http://127.0.0.1:8840/';   // SP: three.js/leaflet node_modules helye, URL: a webes kiadás
const DS = [300, 500, 1000, 2000, 3000, 5000, 8000, 12000, 20000], FOVS = [65, 40, 15];
const rows = []; let bad = 0;
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const w of [1300, 400]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.route(/three\.min\.js/, r => r.fulfill({ path: process.env.THREE_JS || SP + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.route(/leaflet\.js/, r => r.fulfill({ path: process.env.LEAFLET_JS || SP + '/node_modules/leaflet/dist/leaflet.js', contentType: 'application/javascript' }));
    await p.route(/fonts\.g/, r => r.abort());
    await p.goto(U, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(10000);
    await p.evaluate(() => {
      RV.testColors();
      // független ellipszoidi távolság (Vincenty, WGS84)
      window.vincenty = (la1, lo1, la2, lo2) => {
        const a = 6378137, f = 1 / 298.257223563, b = a * (1 - f), r = Math.PI / 180;
        const L = (lo2 - lo1) * r, U1 = Math.atan((1 - f) * Math.tan(la1 * r)), U2 = Math.atan((1 - f) * Math.tan(la2 * r));
        const sU1 = Math.sin(U1), cU1 = Math.cos(U1), sU2 = Math.sin(U2), cU2 = Math.cos(U2);
        let l = L, lp, sS, cS, sig, sA, c2A, c2m;
        for (let i = 0; i < 200; i++) {
          const sl = Math.sin(l), cl = Math.cos(l);
          sS = Math.sqrt((cU2 * sl) ** 2 + (cU1 * sU2 - sU1 * cU2 * cl) ** 2); cS = sU1 * sU2 + cU1 * cU2 * cl; sig = Math.atan2(sS, cS);
          sA = cU1 * cU2 * sl / sS; c2A = 1 - sA * sA; c2m = cS - 2 * sU1 * sU2 / c2A;
          const C = f / 16 * c2A * (4 + f * (4 - 3 * c2A)); lp = l; l = L + (1 - C) * f * sA * (sig + C * sS * (c2m + C * cS * (-1 + 2 * c2m * c2m)));
          if (Math.abs(l - lp) < 1e-12) break;
        }
        const u2 = c2A * (a * a - b * b) / (b * b), A = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2))), B = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
        const dS = B * sS * (c2m + B / 4 * (cS * (-1 + 2 * c2m * c2m) - B / 6 * c2m * (-3 + 4 * sS * sS) * (-3 + 4 * c2m * c2m)));
        return b * A * (sig - dS);
      };
      // független kameramodell: irány (azimut, emelkedés) → eszköz-képpont
      window.camPx = (az, el, L) => {
        const R = Math.PI / 180, p = L.c * R, a0 = L.az0, f = (L.W / 2) / Math.tan(state.fov * R / 2);
        const d = [Math.sin(az) * Math.cos(el), Math.cos(az) * Math.cos(el), Math.sin(el)];
        const fw = [Math.sin(a0) * Math.cos(p), Math.cos(a0) * Math.cos(p), Math.sin(p)], rt = [Math.cos(a0), -Math.sin(a0), 0], up = [-Math.sin(a0) * Math.sin(p), -Math.cos(a0) * Math.sin(p), Math.cos(p)];
        const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], z = dot(d, fw);
        return [L.W / 2 + f * dot(d, rt) / z, L.H / 2 - f * dot(d, up) / z, f];
      };
      // a WebGL-kép képpontjai (eszköz-képpont)
      window.grab = () => { const c = RV.canvas, g = document.createElement('canvas'); g.width = c.width; g.height = c.height; const x = g.getContext('2d'); x.drawImage(c, 0, 0); return x.getImageData(0, 0, c.width, c.height); };
      window.blob = (test) => { const im = grab(), d = im.data; let n = 0, sx = 0, sy = 0, y0 = 1e9, y1 = -1; for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) { const o = (y * im.width + x) * 4; if (test(d[o], d[o + 1], d[o + 2])) { n++; sx += x + 0.5; sy += y + 0.5; y0 = Math.min(y0, y); y1 = Math.max(y1, y); } } return n ? { n, cx: sx / n, cy: sy / n, y0, y1: y1 + 1 } : null; };
    });
    for (const fov of FOVS) for (const D of DS) {
      const r = await p.evaluate(async ({ fov, D }) => {
        const V = { lat: 47.14105, lon: 16.58072 }, fr = frame(V.lat, V.lon), [la, lo] = fr.toLL(0, D);
        Object.assign(state, { viewer: V, turbines: [{ lat: la, lon: lo }], sel: 0, obstacles: [], bld: false, spin: false, ghost: true, fov, pan: 0, floor: 0 });
        syncControls(); renderObstacles(); buildMarkers(); await update(); renderPano(1);
        const a = AN[0], L = renderPano.last, m = model(), t = RV.debugTurbines()[0];
        const baseY = a.baseApp - a.eyeZ, out = { fov, D, Dprog: a.D, Dvin: vincenty(V.lat, V.lon, la, lo) };
        // 1. geometria
        out.geoBaseDist = Math.hypot(t.base[0], t.base[1]) - a.D; out.geoBaseZ = t.base[2] - baseY;
        out.geoHub = t.hub[2] - t.base[2] - m.hub; out.geoTip = Math.max(...t.tips.map(q => q[2])) - t.base[2] - m.tip;
        out.geoBlade = Math.max(...t.tips.map(q => Math.abs(Math.hypot(q[0] - t.hub[0], q[1] - t.hub[1], q[2] - t.hub[2]) - m.R)));
        // 3. vetítés: jelölők a lapátvég és a talppont magasságában (a turbina tengelyén)
        const elT = Math.atan2(baseY + m.tip, a.D), elB = Math.atan2(baseY, a.D);
        const [, yT, f] = camPx(a.az, elT, L), [, yB] = camPx(a.az, elB, L);
        const rad = Math.max(0.6, 5 * a.D / f), mag = (r, g, b) => r > 200 && g < 70 && b > 200;
        const tx = a.D * Math.sin(a.az), ty = a.D * Math.cos(a.az);
        RV.testMarkers([[tx, ty, baseY + m.tip, rad]]); RV.render(); const bt = blob(mag);
        RV.testMarkers([[tx, ty, baseY, rad]]); RV.render(); const bb = blob(mag);
        RV.testMarkers(null); RV.render();
        out.expH = yB - yT; out.measH = bt && bb ? bb.cy - bt.cy : null;
        out.dTip = bt ? bt.cy - yT : null; out.dBase = bb ? bb.cy - yB : null;
        out.angDeg = (elT - elB) / (Math.PI / 180);
        out.inFrame = yT > 0 && yB < L.H;
        // 4. a valódi turbina képe (zöld: látható, piros: takart rész), ha legalább 120 képpont magas és a lapátvég elég széles
        const chordTipPx = 0.35 * f / a.D;
        if (out.inFrame && yB - yT > 120 && chordTipPx > 1.2) {
          const tb = blob((r, g, b) => (g > 180 && r < 90 && b < 90) || (r > 180 && g < 90 && b < 90));
          out.realTop = tb ? tb.y0 - yT : null;
        }
        // 5. fokbeosztás: projectDir (a feliratok) vs. független modell, CSS-képpontban
        const dpr = L.W / RV.canvas.clientWidth; let lab = 0;
        for (const e of [-2, 0, 2, 5, 10]) { const q = RV.projectDir(a.az / (Math.PI / 180), e, L.W / dpr, L.H / dpr), [, ye] = camPx(a.az, e * Math.PI / 180, L); if (q) lab = Math.max(lab, Math.abs(q[1] * dpr - ye)); }
        out.label = lab; out.f = f; out.W = L.W; out.H = L.H;
        return out;
      }, { fov, D });
      r.w = w; rows.push(r);
    }
    if (errs.length) { console.log('JS-hibák', errs); bad++; }
    await p.context().close();
  }
  await b.close();
  fs.writeFileSync(process.env.OUT || 'scale_result.json', JSON.stringify(rows, null, 1));
  // értékelés
  const fmt = (v, d = 2) => v == null ? '–' : (+v).toFixed(d);
  console.log('kép  látósz.  távolság  szögmagasság  várt mag.  mért mag.  eltérés  lapátvég-hely  valódi turbina teteje  Vincenty-eltérés');
  for (const r of rows) {
    const okGeo = Math.abs(r.geoBaseDist) < 0.05 && Math.abs(r.geoBaseZ) < 0.05 && Math.abs(r.geoHub) < 0.05 && Math.abs(r.geoTip) < 0.05 && r.geoBlade < 0.05;
    const okDist = Math.abs(r.Dprog - r.Dvin) / r.Dvin < 0.001;
    const okProj = r.inFrame ? r.measH != null && Math.abs(r.measH - r.expH) <= 1.0 && Math.abs(r.dTip) <= 1.0 : true;
    const okLab = r.label < 0.6;
    const okReal = r.realTop == null || (r.realTop >= -1.5 && r.realTop <= 4);
    if (!(okGeo && okDist && okProj && okLab && okReal)) bad++;
    console.log(`${r.w}px ${String(r.fov).padStart(3)}°  ${String(r.D).padStart(6)} m   ${fmt(r.angDeg, 3).padStart(7)}°   ${fmt(r.expH, 1).padStart(8)} px ${fmt(r.measH, 1).padStart(8)} px ${fmt(r.measH == null ? null : r.measH - r.expH, 2).padStart(7)} px  ${fmt(r.dTip, 2).padStart(7)} px   ${r.realTop == null ? '      –' : fmt(r.realTop, 1).padStart(7) + ' px'}   ${fmt(r.Dprog - r.Dvin, 3)} m ${okGeo && okDist && okProj && okLab && okReal ? 'OK' : 'HIBA'}${r.inFrame ? '' : ' (nem fér a képbe)'}`);
  }
  // arányosság: a látszó magasság × távolság állandó-e (kis szögeknél), képernyőnként és látószögenként
  console.log('\nArányosság (a szögmagasság a távolsággal fordítottan arányos?):');
  for (const w of [1300, 400]) for (const fov of FOVS) {
    const rs = rows.filter(r => r.w === w && r.fov === fov && r.measH != null && r.inFrame);
    console.log(`${w}px ${fov}°: ` + rs.map(r => `${r.D / 1000} km: ${(r.measH * r.D / r.f).toFixed(1)} m`).join(' | '));
  }
  console.log('\nlegnagyobb geometriai eltérés:', Math.max(...rows.map(r => Math.max(Math.abs(r.geoBaseDist), Math.abs(r.geoBaseZ), Math.abs(r.geoHub), Math.abs(r.geoTip), r.geoBlade))).toFixed(4), 'm;',
    'fokbeosztás legnagyobb eltérése:', Math.max(...rows.map(r => r.label)).toFixed(3), 'px;', 'távolság legnagyobb relatív eltérése:', Math.max(...rows.map(r => Math.abs(r.Dprog - r.Dvin) / r.Dvin * 100)).toFixed(4), '%');
  console.log(bad ? `\n${bad} HIBA` : '\nMINDEN ELLENŐRZÉS RENDBEN');
})();
