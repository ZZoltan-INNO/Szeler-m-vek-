/* RealView – fotorealisztikus látkép WebGL-lel (three.js r128).
   Közös motor az index.html és az alap.html számára; a tools/inline_realview.py másolja be őket.
   Fotó alapú anyagok az assets/ mappából: levél- és kéregtextúrák, fű (ez-tree, MIT), égbolt-panoráma a fényhez (Poly Haven, CC0).
   Koordináták: helyi síkkoordináták (x kelet, y észak, méter) → three.js: X = x, Y = magasság a szemhez képest, Z = −y.
   A kamera a szemmagasságban, az origóban áll. A Föld görbületét a hívó számolja bele a magasságokba. */
window.RealView = (function () {
  'use strict';
  const T = window.THREE;
  if (!T) return null;
  const RAD = Math.PI / 180;
  const rnd = s => { const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const lin = c => new T.Color(c).convertSRGBToLinear();

  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
    if (repeat) t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = 8; return t;
  }
  // táblás mezőgazdasági táj (ha nincs műholdkép): 4×4 km-es ismétlődő minta
  const fieldTex = () => canvasTex(1024, 1024, (g, w, h) => {
    const cols = ['#7f9b4a', '#9aa956', '#b9aa6a', '#6f8f43', '#c8b47a', '#5f8340', '#a59a5c', '#86a04f'];
    g.fillStyle = '#7d9550'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) {
      const x = rnd(k) * w, y = rnd(k + 300) * h, fw = 40 + rnd(k + 600) * 150, fh = 25 + rnd(k + 900) * 110, a = (rnd(k + 1200) - 0.5) * 0.5;
      g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = cols[(rnd(k + 1500) * cols.length) | 0]; g.fillRect(-fw / 2, -fh / 2, fw, fh);
      g.globalAlpha = 0.18; g.strokeStyle = '#3b4a25'; g.lineWidth = 1.2; g.strokeRect(-fw / 2, -fh / 2, fw, fh); g.restore();
    }
    for (let k = 0; k < 18; k++) {
      g.fillStyle = '#3e5a2c'; g.beginPath(); const x = rnd(k + 2000) * w, y = rnd(k + 2100) * h;
      for (let a = 0; a < 6.3; a += 0.5) { const r = 25 + rnd(k * 7 + a) * 40; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.fill();
    }
  }, true);
  // vakolat: finom foltos zaj
  const plasterTex = () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#e9dfc9'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 9000; k++) { const v = rnd(k); g.fillStyle = v < 0.5 ? 'rgba(120,100,70,.05)' : 'rgba(255,255,255,.07)'; g.fillRect(rnd(k + 1e4) * w, rnd(k + 2e4) * h, 1 + rnd(k + 3e4) * 3, 1 + rnd(k + 4e4) * 3); }
    for (let k = 0; k < 40; k++) { g.fillStyle = 'rgba(90,80,60,.04)'; g.beginPath(); g.ellipse(rnd(k + 5e4) * w, rnd(k + 6e4) * h, 20 + rnd(k) * 40, 10 + rnd(k + 1) * 30, 0, 0, 6.3); g.fill(); }
  }, true);
  // hódfarkú cserép: soronként eltolt, egyenként árnyalt cserepek
  const roofTex = () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#7a3523'; g.fillRect(0, 0, w, h);
    const tw = 16, th = 18;
    for (let r = 0; r < h / th + 1; r++) for (let c = -1; c < w / tw + 1; c++) {
      const x = c * tw + (r % 2) * tw / 2, y = r * th, v = rnd(r * 97 + c * 13), base = [150 + v * 35, 62 + v * 20, 42 + v * 12];
      const gr = g.createLinearGradient(0, y, 0, y + th);
      gr.addColorStop(0, `rgb(${base[0] * 0.75 | 0},${base[1] * 0.75 | 0},${base[2] * 0.75 | 0})`); gr.addColorStop(0.7, `rgb(${base[0] | 0},${base[1] | 0},${base[2] | 0})`); gr.addColorStop(1, `rgb(${base[0] * 0.85 | 0},${base[1] * 0.85 | 0},${base[2] * 0.85 | 0})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x + 1, y); g.lineTo(x + tw - 1, y); g.lineTo(x + tw - 1, y + th * 0.7); g.quadraticCurveTo(x + tw / 2, y + th + 2, x + 1, y + th * 0.7); g.closePath(); g.fill();
    }
  }, true);
  const windowTex = () => canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#d6d0c2'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1500; k++) { g.fillStyle = rnd(k) < 0.5 ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.06)'; g.fillRect(rnd(k + 9) * w, rnd(k + 19) * h, 2, 2); }
    g.fillStyle = '#c2bbab'; g.fillRect(0, h - 7, w, 7);
    g.fillStyle = '#e8e4da'; g.fillRect(26, 30, 76, 64);
    const gr = g.createLinearGradient(0, 34, 0, 90); gr.addColorStop(0, '#9fb3c6'); gr.addColorStop(1, '#3f4f60');
    g.fillStyle = gr; g.fillRect(30, 34, 68, 56);
    g.fillStyle = '#e8e4da'; g.fillRect(62, 34, 4, 56); g.fillRect(30, 58, 68, 3);
  }, true);

  /* ---------- Ég: lineáris színtérben, a tónusleképzés a többi anyaggal közös ---------- */
  function skyMaterial() {
    return new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false,
      uniforms: { sunDir: { value: new T.Vector3() }, zen: { value: lin(0x1d58ad) }, hor: { value: lin(0xa9c3de) }, fogCol: { value: lin(0xbfcfdd) } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }',
      fragmentShader: `
        varying vec3 vDir; uniform vec3 sunDir, zen, hor, fogCol;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
          return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
        float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 6; i++){ s += a*n(p); p = p*2.03 + 7.1; a *= .5; } return s; }
        void main(){
          vec3 d = normalize(vDir); float el = d.y;
          vec3 col = mix(hor, zen, pow(clamp(el, 0., 1.), .45));
          float s = max(dot(d, sunDir), 0.);
          col += vec3(1., .9, .75) * (pow(s, 1200.) * 40. + pow(s, 60.) * .5 + pow(s, 6.) * .12);
          if (el > 0.003) {
            vec2 p = d.xz / (el + .05) * 1.4;
            float c = fbm(p * .8 + vec2(3.,1.)), c2 = fbm(p * 2.7 + 11.);
            float cov = smoothstep(.56, .82, c) * smoothstep(.003, .09, el);
            float shade = .55 + .45 * smoothstep(.45, .9, c2) + .25 * s;
            col = mix(col, vec3(.92, .93, .95) * shade, cov * .9);
          }
          col = mix(col, fogCol, smoothstep(.07, -.01, el));
          gl_FragColor = vec4(col, 1.);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`
    });
  }

  /* ---------- Terep: műholdfotó vagy táblás textúra, közelről fűfotó ---------- */
  function terrainMaterial(tex) {
    return new T.ShaderMaterial({
      uniforms: {
        sat: { value: null }, hasSat: { value: 0 }, grass: { value: null }, hasGrass: { value: 0 }, fields: { value: tex.fields },
        sunDir: { value: new T.Vector3() }, fogCol: { value: lin(0xc8d5e0) }, fogDen: { value: 1 / 21000 },
        skyAmb: { value: lin(0xa9bfdb) }, gndAmb: { value: lin(0x6e6a55) }, sunCol: { value: lin(0xfff1d8).multiplyScalar(1.9) }
      },
      vertexShader: `
        varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        void main(){ vN = normal; vW = position; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        uniform sampler2D sat, grass, fields; uniform float hasSat, hasGrass, fogDen; uniform vec3 sunDir, fogCol, skyAmb, gndAmb, sunCol;
        varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        vec3 L(vec3 c){ return pow(c, vec3(2.2)); }
        void main(){
          float dist = length(vW.xz);
          vec3 base = hasSat > .5 ? L(texture2D(sat, vUv).rgb) * 1.45 : L(texture2D(fields, vW.xz / 4200.).rgb);
          vec3 g1 = hasGrass > .5 ? L(texture2D(grass, vW.xz / 3.2).rgb) : vec3(.12,.17,.06);
          vec3 g2 = hasGrass > .5 ? L(texture2D(grass, vW.xz / 29.).rgb) : vec3(.12,.17,.06);
          float near = 1. - smoothstep(15., 260., dist);
          vec3 grassCol = g1 * (1. + 2.6 * g2);
          base = mix(base, mix(base * 1.15, grassCol, .75), near);
          vec3 N = normalize(vN);
          float diff = max(dot(N, sunDir), 0.);
          vec3 col = base * (diff * sunCol + mix(gndAmb, skyAmb, N.y * .5 + .5) * .95);
          float f = 1. - exp(-pow(dist * fogDen, 2.));
          gl_FragColor = vec4(mix(col, fogCol, f), 1.);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`
    });
  }
  function buildTerrain(az, half, dMax, elev, uvOf) {
    const na = Math.max(60, Math.min(420, Math.round(half * 2 / RAD * 4))), r0 = 0.6, k = Math.pow(dMax / r0, 1 / 230);
    const radii = []; for (let r = r0; r < dMax * 1.0001; r *= k) radii.push(r);
    const nr = radii.length, pos = new Float32Array(na * nr * 3), uv = new Float32Array(na * nr * 2);
    let last = 0;
    for (let i = 0; i < na; i++) {
      const a = az - half + 2 * half * i / (na - 1), sx = Math.sin(a), sy = Math.cos(a);
      for (let j = 0; j < nr; j++) {
        const r = radii[j], x = sx * r, y = sy * r; let z = elev(x, y, r);
        if (z !== z) z = last; else last = z;
        const o = (i * nr + j) * 3; pos[o] = x; pos[o + 1] = z; pos[o + 2] = -y;
        if (uvOf) { const q = uvOf(x, y); uv[(i * nr + j) * 2] = q[0]; uv[(i * nr + j) * 2 + 1] = q[1]; }
      }
    }
    const idx = [];
    for (let i = 0; i < na - 1; i++) for (let j = 0; j < nr - 1; j++) { const p = i * nr + j, q = (i + 1) * nr + j; idx.push(p, q, p + 1, q, q + 1, p + 1); }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }

  /* ---------- Szélturbina ---------- */
  function bladeGeometry(R) {
    const S = [[0.02, 3.2, .95, 18], [0.06, 3.7, .7, 17], [0.2, 4.6, .32, 13], [0.4, 3.8, .24, 8], [0.6, 2.9, .2, 4.5], [0.8, 1.9, .17, 2], [0.95, 1.0, .14, .5], [1.0, .35, .12, 0]];
    const sc = R / 85, M = 14, pos = [], idx = [];
    S.forEach(([s, c, t, tw], j) => {
      const ch = c * sc, th = ch * t, ca = Math.cos(tw * RAD), sa = Math.sin(tw * RAD);
      for (let i = 0; i < M; i++) {
        const u = i / M * 2 * Math.PI, px = Math.cos(u) * ch / 2 - ch * .12, pz = Math.sin(u) * th / 2 * (Math.cos(u) > 0 ? .8 : 1.2);
        pos.push(px * ca - pz * sa, s * R, px * sa + pz * ca);
      }
      if (j > 0) for (let i = 0; i < M; i++) { const a = (j - 1) * M + i, b = (j - 1) * M + (i + 1) % M, c2 = j * M + i, d = j * M + (i + 1) % M; idx.push(a, c2, b, b, c2, d); }
    });
    const tip = pos.length / 3; pos.push(0, R * 1.003, 0);
    for (let i = 0; i < M; i++) idx.push((S.length - 1) * M + i, tip, (S.length - 1) * M + (i + 1) % M);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  function buildTurbine(hub, rotor, mats) {
    const R = rotor / 2, grp = new T.Group();
    const add = (geo, mat, setup) => { const m = new T.Mesh(geo, mat); setup(m); grp.add(m); return m; };
    add(new T.CylinderGeometry(2.0, 3.6, hub - 1, 48, 1), mats.white, m => { m.position.y = (hub - 1) / 2; });
    for (const f of [0.28, 0.52, 0.74]) add(new T.CylinderGeometry(3.6 - 1.6 * f + 0.05, 3.6 - 1.6 * f + 0.05, 0.25, 48), mats.seam, m => { m.position.y = (hub - 1) * f; });
    add(new T.CylinderGeometry(3.75, 3.75, 1.2, 48), mats.grey, m => { m.position.y = 0.6; });
    const L = Math.max(10, rotor * 0.11);
    add(new T.BoxGeometry(6.4, 6.6, L), mats.white, m => { m.position.set(0, hub + 0.6, -L / 2 + 2.5); });
    add(new T.CylinderGeometry(3.3, 3.3, L * 0.9, 24, 1, false, 0, Math.PI), mats.white, m => { m.rotation.x = Math.PI / 2; m.rotation.z = Math.PI / 2; m.position.set(0, hub + 3.9, -L / 2 + 2.5); });
    const rot = new T.Group(); rot.position.set(0, hub + 0.4, 4.2); grp.add(rot);
    const sp = new T.Mesh(new T.SphereGeometry(2.9, 32, 20), mats.white); sp.scale.set(1, 1, 1.45); rot.add(sp);
    const bg = bladeGeometry(R);
    for (let k = 0; k < 3; k++) { const b = new T.Mesh(bg, mats.blade); b.rotation.z = -k * 2 * Math.PI / 3; b.position.z = 0.6; rot.add(b); }
    grp.userData.rotor = rot;
    return grp;
  }

  /* ---------- Fák: kéreggel bevont ágszerkezet + fotós levélcsokrok ---------- */
  const unitCyl = new T.CylinderGeometry(0.62, 1, 1, 7, 1, true).translate(0, 0.5, 0);
  const cardGeo = new T.PlaneGeometry(1, 1).translate(0, 0.5, 0);
  const blobGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const coreGeo = new T.SphereGeometry(1, 28, 18);
  const Y = new T.Vector3(0, 1, 0), tmpQ = new T.Quaternion();
  function cylM(p, dir, len, r) { tmpQ.setFromUnitVectors(Y, dir); return new T.Matrix4().compose(p, tmpQ, new T.Vector3(r, len, r)); }
  function cardM(pos, dir, sz, spin) {
    const q = new T.Quaternion().setFromUnitVectors(Y, dir.clone().lerp(Y, 0.35).normalize());
    q.multiply(new T.Quaternion().setFromAxisAngle(Y, spin));
    return new T.Matrix4().compose(pos, q, new T.Vector3(sz, sz, sz));
  }
  function rowTrees(o, groundY, mats, winter, budget) {
    const bush = o.kind === 'bush', forest = o.kind === 'forest';
    const sp = bush ? 1.6 : forest ? 6.5 : 7.5, rows = forest ? Math.max(1, Math.round((o.depth || 40) / 7)) : 1;
    const ph = o.phase || 0, k0 = Math.ceil((-o.len / 2 - ph) / sp), k1 = Math.floor((o.len / 2 - ph) / sp);
    const nx = o.ey, ny = -o.ex, trees = [];
    for (let r = 0; r < rows; r++) for (let kk = k0; kk <= k1 && trees.length < 2500; kk++) {
      const c = trees.length, onLos = kk === 0 && r === 0;
      const s = ph + (kk + (r % 2) * 0.5) * sp + (onLos ? 0 : (rnd(c * 1.3 + o.seed) - 0.5) * sp * 0.4), off = (r - (rows - 1) / 2) * 7 + (onLos ? 0 : (rnd(c * 2.9 + o.seed) - 0.5) * 2);
      const x = o.x0 + o.ex * s + nx * off, y = o.y0 + o.ey * s + ny * off;
      trees.push({ x, y, g: groundY(x, y), h: onLos ? o.h : o.h * (0.88 + rnd(c * 5.1 + o.seed) * 0.12), seed: o.seed * 31 + c * 7.7, dist: Math.hypot(x, y) });
    }
    const grp = new T.Group(), branches = [], cards = [], blobs = [], cores = [];
    const perTree = Math.max(14, Math.min(bush ? 90 : 230, Math.round(budget / Math.max(1, trees.length))));
    for (const t of trees) {
      const P0 = new T.Vector3(t.x, t.g, -t.y), H = t.h, sd = t.seed;
      if (bush) {
        const rx = 1.15 + rnd(sd) * 0.4, ry = H / 2, cy = t.g + ry * 0.95;
        if (winter) { for (let i = 0; i < 9; i++) { const a = rnd(sd + i) * 6.28, d = new T.Vector3(Math.cos(a) * 0.55, 1, Math.sin(a) * 0.55).normalize(); branches.push(cylM(P0.clone(), d, H * (0.8 + rnd(sd + i * 3) * 0.3), 0.025)); } continue; }
        const n = Math.max(10, Math.round(perTree * Math.min(1, 160 / Math.max(t.dist, 1))));
        for (let i = 0; i < n; i++) {
          const a = rnd(sd + i * 1.7) * 6.28, e = (rnd(sd + i * 2.3) - 0.35) * 2.2, u = 0.15 + 0.85 * Math.sqrt(rnd(sd + i * 3.1));
          const dir = new T.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).normalize();
          cards.push(cardM(new T.Vector3(t.x + dir.x * rx * u * 0.6, t.g + 0.1 + (cy - t.g) * (0.35 + 0.65 * u) * (dir.y > 0 ? 1 : 0.6), -t.y + dir.z * rx * u * 0.6), dir, (0.8 + rnd(sd + i) * 0.5) * Math.min(1.3, H / 2), rnd(sd + i * 5) * 6.28));
        }
        blobs.push(new T.Matrix4().compose(new T.Vector3(t.x + 0.4, t.g + 0.05, -t.y + 0.3), new T.Quaternion(), new T.Vector3(3.4, 1, 3.4)));
        continue;
      }
      // törzs és főágak
      const th = H * (0.34 + rnd(sd) * 0.06), rT = 0.12 + H * 0.013;
      branches.push(cylM(P0.clone(), Y, th * 1.08, rT));
      branches.push(cylM(P0.clone().add(new T.Vector3(0, th, 0)), new T.Vector3((rnd(sd + 5) - 0.5) * 0.2, 1, (rnd(sd + 6) - 0.5) * 0.2).normalize(), H * 0.5, rT * 0.55));
      const card = Math.min(5, Math.max(2, H * 0.24)) * (t.dist > 500 ? 1.3 : 1);
      // a levélcsokrok legfeljebb kb. 1,05 csokornyit nyúlnak ki a korona burkán túl: így a fa teteje H
      const ry = H * 0.4 - card * 0.42, rx = H * 0.34 - card * 0.35, cy = t.g + H - ry - card * 1.05;
      const nMain = 5 + ((rnd(sd + 1) * 3) | 0);
      for (let b = 0; b < nMain; b++) {
        const a = (b / nMain + rnd(sd + b) * 0.15) * 6.28, tilt = (30 + rnd(sd + b * 2) * 28) * RAD;
        const d = new T.Vector3(Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a)).normalize();
        const hf = b / Math.max(1, nMain - 1), st = P0.clone().add(new T.Vector3(0, th * 0.85 + (H * 0.42) * hf * (0.85 + rnd(sd + b * 3) * 0.3), 0)), len = H * (0.42 - 0.18 * hf + rnd(sd + b * 4) * 0.08);
        branches.push(cylM(st, d, len, rT * 0.5));
        if (winter || t.dist < 250) {
          for (let k = 0; k < (winter ? 3 : 2); k++) {
            const sp2 = st.clone().addScaledVector(d, len * (0.45 + k * 0.2)), a2 = a + (rnd(sd + b * 7 + k) - 0.5) * 2.2;
            const d2 = new T.Vector3(Math.cos(a2) * 0.8, 0.75 + rnd(sd + k * 9) * 0.4, Math.sin(a2) * 0.8).normalize(), l2 = len * 0.5;
            branches.push(cylM(sp2, d2, l2, rT * 0.24));
            if (winter) for (let q = 0; q < 2; q++) { const a3 = a2 + (rnd(sd + b * 11 + k * 3 + q) - 0.5) * 2.4, d3 = new T.Vector3(Math.cos(a3) * 0.7, 0.9, Math.sin(a3) * 0.7).normalize(); branches.push(cylM(sp2.clone().addScaledVector(d2, l2 * (0.5 + q * 0.3)), d3, l2 * 0.55, rT * 0.1)); }
          }
        }
      }
      if (winter) continue;
      cores.push(new T.Matrix4().compose(new T.Vector3(t.x, cy, -t.y), new T.Quaternion().setFromAxisAngle(Y, rnd(sd + 2) * 6.28), new T.Vector3(rx * 0.8, ry * 0.82, rx * 0.8)));
      // levélcsokrok a korona burkán; a rálátás vonalán álló fa teteje pontosan H
      const n = Math.max(12, Math.round(perTree * Math.min(1, 260 / Math.max(t.dist, 1)) + (t.dist > 500 ? 0 : 6)));
      for (let i = 0; i < n; i++) {
        const a = rnd(sd + i * 1.7) * 6.28, e = (rnd(sd + i * 2.3) * 2 - 0.7) * 1.3, u = 0.5 + 0.5 * Math.sqrt(rnd(sd + i * 3.1));
        const dir = new T.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).normalize();
        cards.push(cardM(new T.Vector3(t.x + dir.x * rx * u, cy + dir.y * ry * u, -t.y + dir.z * rx * u), dir, card * (0.8 + rnd(sd + i * 4.1) * 0.4), rnd(sd + i * 5) * 6.28));
      }
      blobs.push(new T.Matrix4().compose(new T.Vector3(t.x + H * 0.08, t.g + 0.05, -t.y + H * 0.05), new T.Quaternion(), new T.Vector3(H * 0.8, 1, H * 0.8)));
    }
    const inst = (geo, mat, list, colorFn) => {
      if (!list.length) return;
      const m = new T.InstancedMesh(geo, mat, list.length); const col = new T.Color();
      list.forEach((M, i) => { m.setMatrixAt(i, M); if (colorFn) { colorFn(i, col); m.setColorAt(i, col); } });
      grp.add(m);
    };
    inst(blobGeo, mats.blob, blobs);
    inst(unitCyl, mats.bark, branches);
    inst(coreGeo, mats.core, cores, (i, c) => { const v = rnd(i * 4.7 + o.seed); c.setRGB(0.85 + v * 0.3, 0.9 + v * 0.2, 0.85 + v * 0.2); });
    inst(cardGeo, bush ? mats.bushLeaf : mats.leaf, cards, (i, c) => { const v = rnd(i * 9.1 + o.seed); c.setRGB(0.5 + v * 0.22, 0.6 + v * 0.18, 0.42 + v * 0.14); });
    return grp;
  }
  /* ---------- Valós épületek (alaprajz-adatból): instanced falak, nyeregtetők, oromfalak ---------- */
  // egység-geometriák: x a szélesség, z a hosszabb oldal (gerinc iránya), y felfelé
  const unitBox = new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const unitRoof = (() => {   // két tetősík: (-0.5,0)→(0,1)→(0.5,0), z: -0.5..0.5
    const g = new T.BufferGeometry(), P = [], U = [];
    const quad = (a, b, c, d) => { P.push(...a, ...c, ...b, ...a, ...d, ...c); U.push(0, 0, 3, 2, 3, 0, 0, 0, 0, 2, 3, 2); };   // kifelé néző oldal
    quad([-0.5, 0, 0.5], [-0.5, 0, -0.5], [0, 1, -0.5], [0, 1, 0.5]);
    quad([0.5, 0, -0.5], [0.5, 0, 0.5], [0, 1, 0.5], [0, 1, -0.5]);
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(U, 2)); g.computeVertexNormals(); return g;
  })();
  const unitGable = (() => {  // a két oromfal háromszöge
    const g = new T.BufferGeometry(), P = [-0.5, 0, 0.5, 0.5, 0, 0.5, 0, 1, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, 0, 1, -0.5];
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 0, 0.5, 0.6, 0, 0, 1, 0, 0.5, 0.6], 2)); g.computeVertexNormals(); return g;
  })();
  // homlokzat: vakolat, 4,2 m-enként egy ablak, emeletenként (3 m) ismétlődve
  const facadeTex = () => canvasTex(256, 192, (g, w, h) => {
    g.fillStyle = '#ece4d2'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 2500; k++) { g.fillStyle = rnd(k) < 0.5 ? 'rgba(110,95,70,.05)' : 'rgba(255,255,255,.07)'; g.fillRect(rnd(k + 1e4) * w, rnd(k + 2e4) * h, 1 + rnd(k + 3e4) * 2, 1 + rnd(k + 4e4) * 2); }
    const x0 = 92, ww = 72, y0 = 54, wh = 80;                            // kb. 1,2 × 1,25 m-es ablak, 0,9 m-es parapet
    g.fillStyle = 'rgba(70,60,45,.18)'; g.fillRect(x0 - 6, y0 + wh, ww + 12, 6);   // párkány árnyéka
    g.fillStyle = '#f4f1ea'; g.fillRect(x0 - 5, y0 - 5, ww + 10, wh + 10);
    const gr = g.createLinearGradient(0, y0, 0, y0 + wh); gr.addColorStop(0, '#8ea3b6'); gr.addColorStop(1, '#2e3a46');
    g.fillStyle = gr; g.fillRect(x0, y0, ww, wh);
    g.fillStyle = '#f4f1ea'; g.fillRect(x0 + ww / 2 - 2, y0, 4, wh); g.fillRect(x0, y0 + wh * 0.38, ww, 3);
  }, true);
  // az instanced épületeken méterarányos UV: a példány méretarányából számolva (nem nyúlik a textúra)
  const metricUV = (mat, roof) => {
    mat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
        #ifdef USE_INSTANCING
          vec3 isc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
          ${roof ? 'vUv = vec2(position.z * isc.z / 3.2, (position.y * isc.y + abs(position.x) * isc.x) / 1.6);'
                 : 'vUv = vec2((position.x * isc.x + position.z * isc.z) / 4.2, position.y * isc.y / 3.0);'}
        #endif`);
    };
    mat.customProgramCacheKey = () => roof ? 'bld-roof' : 'bld-wall';
    return mat;
  };
  const WALLC = [0xf1ebdd, 0xe9e2d2, 0xf3e9c8, 0xe6e6e1, 0xeadcc4, 0xdcd8cc], ROOFC = [0xffffff, 0xf2e2da, 0xe4cfc4, 0xd6c2b8, 0xfff2ea, 0xc9b6ae];   // a cseréptextúra árnyalásai
  function realBuildings(list, groundY, mats) {
    const grp = new T.Group(), n = list.length; if (!n) return grp;
    const ng = list.filter(b => b.gable).length;
    // ablakos homlokzat a lakóház méretű vagy magas (többszintes) épületeken; csűr, csarnok: sima vakolat
    const win = b => b.L * b.W < 380 || b.h > 9.5, nw = list.filter(win).length;
    const walls = new T.InstancedMesh(unitBox, mats.bWall, Math.max(1, nw)), plain = new T.InstancedMesh(unitBox, mats.bGable, Math.max(1, n - nw)), roofs = new T.InstancedMesh(unitRoof, mats.bRoof, Math.max(1, ng)), gables = new T.InstancedMesh(unitGable, mats.bGable, Math.max(1, ng));
    const blobs = new T.InstancedMesh(blobGeo, mats.blob, n);
    const m = new T.Matrix4(), q = new T.Quaternion(), c = new T.Color(); let k = 0, kw = 0, kp = 0;
    list.forEach((b, i) => {
      // talaj: a sarkoknál a legalacsonyabb pont alá nyúlik a fal, így lejtőn sem lebeg
      const ex = Math.sin(b.a), ey = Math.cos(b.a), hx = b.L / 2, hw = b.W / 2;
      const gc = groundY(b.x, b.y);
      let g0 = gc; for (const [s, u] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g0 = Math.min(g0, groundY(b.x + ex * hx * s + ey * hw * u, b.y + ey * hx * s - ex * hw * u));
      const base = g0 - 0.3, eave = gc + b.eave;
      q.setFromAxisAngle(Y, Math.PI - b.a);
      m.compose(new T.Vector3(b.x, base, -b.y), q, new T.Vector3(b.W, eave - base, b.L));
      c.set(WALLC[(b.seed * 7) % WALLC.length]).convertSRGBToLinear();
      if (win(b)) { walls.setMatrixAt(kw, m); walls.setColorAt(kw++, c); } else { plain.setMatrixAt(kp, m); plain.setColorAt(kp++, c); }
      m.compose(new T.Vector3(b.x, gc + 0.04, -b.y), q, new T.Vector3(b.W * 1.7 + 4, 1, b.L * 1.4 + 4)); blobs.setMatrixAt(i, m);
      if (b.gable) {
        const rh = b.h - b.eave;
        m.compose(new T.Vector3(b.x, eave - 0.12, -b.y), q, new T.Vector3(b.W + 0.9, rh + 0.12, b.L + 0.6)); roofs.setMatrixAt(k, m);
        c.set(ROOFC[(b.seed * 13) % ROOFC.length]).convertSRGBToLinear(); roofs.setColorAt(k, c);
        m.compose(new T.Vector3(b.x, eave, -b.y), q, new T.Vector3(b.W, rh, b.L)); gables.setMatrixAt(k, m);
        c.set(WALLC[(b.seed * 7) % WALLC.length]).convertSRGBToLinear(); gables.setColorAt(k, c);
        k++;
      }
    });
    for (const im of [walls, plain, roofs, gables, blobs]) { im.frustumCulled = false; grp.add(im); }
    if (!ng) { roofs.count = 0; gables.count = 0; }
    walls.count = nw; plain.count = n - nw;
    return grp;
  }
  function building(o, groundY, mats) {
    const grp = new T.Group(), g = o.kind === 'hill' ? 0 : groundY(o.x0, o.y0);
    if (o.kind === 'house') {
      // négyzetes alaprajz, az oromfal a néző felé (homlokfal a középponttól w/2-re, gerinc magassága h)
      const w = o.w, wall = o.h * 0.6, roofH = o.h - wall;
      const wallMat = mats.wall.clone(); wallMat.map = mats.wall.map.clone(); wallMat.map.needsUpdate = true; wallMat.map.repeat.set(w / 4, wall / 4); wallMat.userData.own = true;
      const walls = new T.Mesh(new T.BoxGeometry(w, wall, w), wallMat); walls.position.y = wall / 2; grp.add(walls);
      const sh = new T.Shape(); sh.moveTo(-w / 2 - 0.45, -0.15); sh.lineTo(0, roofH); sh.lineTo(w / 2 + 0.45, -0.15); sh.lineTo(-w / 2 - 0.45, -0.15);
      const rg = new T.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); rg.translate(0, wall, -w / 2);
      const uv = rg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.5, uv.getY(i) / 2.5);
      grp.add(new T.Mesh(rg, mats.roof));
      for (const sx of [-0.25, 0.25]) {
        const fr = new T.Mesh(new T.PlaneGeometry(1.5, 1.45), mats.frame); fr.position.set(sx * w, wall * 0.55, w / 2 + 0.02); grp.add(fr);
        const win = new T.Mesh(new T.PlaneGeometry(1.3, 1.25), mats.glass); win.position.set(sx * w, wall * 0.55, w / 2 + 0.03); grp.add(win);
      }
      const door = new T.Mesh(new T.PlaneGeometry(1.0, 2.1), mats.door); door.position.set(0, 1.05, w / 2 + 0.02); grp.add(door);
      const plinth = new T.Mesh(new T.BoxGeometry(w + 0.1, 0.5, w + 0.1), mats.grey); plinth.position.y = 0.25; grp.add(plinth);
      const blob = new T.Mesh(blobGeo, mats.blob); blob.scale.set(w * 1.9, 1, w * 1.9); blob.position.y = 0.04; grp.add(blob);
    } else if (o.kind === 'block') {
      const tex = mats.windows.clone(); tex.needsUpdate = true; tex.repeat.set(o.w / 3.6, (o.h - 0.6) / 3);
      const bm = new T.MeshStandardMaterial({ map: tex, roughness: 0.85 }); bm.userData.own = true; const b = new T.Mesh(new T.BoxGeometry(o.w, o.h - 0.6, 13), bm); b.position.y = (o.h - 0.6) / 2; grp.add(b);
      const top = new T.Mesh(new T.BoxGeometry(o.w, 0.6, 13), mats.grey); top.position.y = o.h - 0.3; grp.add(top);
      const blob = new T.Mesh(blobGeo, mats.blob); blob.scale.set(o.w * 1.3, 1, 30); blob.position.y = 0.04; grp.add(blob);
    } else if (o.kind === 'fence') {
      const f = new T.Mesh(new T.BoxGeometry(o.len, o.h, 0.22), mats.fence); f.position.y = o.h / 2; grp.add(f);
    } else if (o.kind === 'hill') {
      // o.prof(s): magasság a domb közepétől s méterre (a nézés irányában), o.L fél hossz, o.width keresztben
      const ns = 48, nu = 64, pos = [], idx = [];
      for (let i = 0; i <= ns; i++) for (let j = 0; j <= nu; j++) {
        const s = -o.L + 2 * o.L * i / ns, u = -o.width / 2 + o.width * j / nu, e = Math.min(1, (o.width / 2 - Math.abs(u)) / (o.width * 0.12));
        const f = 1 - 0.1 * (1 - Math.cos(u / 70)) - 0.04 * (1 - Math.cos(u / 23));
        pos.push(u, o.prof(s) * f * Math.max(0, e) + o.groundAt(s), -s);
      }
      for (let i = 0; i < ns; i++) for (let j = 0; j < nu; j++) { const a = i * (nu + 1) + j, b = a + nu + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      const g2 = new T.BufferGeometry(); g2.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      const uv = []; for (let k = 0; k < pos.length; k += 3) uv.push(pos[k] / 3.2, pos[k + 2] / 3.2); g2.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g2.setIndex(idx); g2.computeVertexNormals();
      grp.add(new T.Mesh(g2, mats.hill));
      grp.position.set(0, 0, -o.y0); return grp;
    } else if (o.kind === 'mound') {
      const m = new T.Mesh(new T.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.grassObj);
      m.scale.set(o.len / 2, o.h, Math.max(4, o.h * 3)); grp.add(m);
    }
    grp.position.set(o.x0, g, -o.y0);
    // épület: a homlokzat a néző felé; vonalas elem: a megadott irányban
    grp.rotation.y = o.kind === 'house' || o.kind === 'block' ? Math.atan2(-o.x0, o.y0) : -Math.atan2(o.ex, o.ey) + Math.PI / 2;
    return grp;
  }

  /* ---------- Példány ---------- */
  function create(holder, opts) {
    opts = opts || {};
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true }); }
    catch (e) { return null; }
    if (!renderer.getContext()) return null;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.88;
    renderer.domElement.className = 'rv-gl';
    holder.prepend(renderer.domElement);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 16 / 9, 1, 42000);
    cam.rotation.order = 'YXZ';
    const sunDir = new T.Vector3();
    const sky = new T.Mesh(new T.SphereGeometry(38000, 48, 24), skyMaterial()); sky.renderOrder = -10; scene.add(sky);
    const tMat = terrainMaterial({ fields: fieldTex() });
    let terrain = null;
    const sun = new T.DirectionalLight(lin(0xfff2dc), 2.0), hemi = new T.HemisphereLight(lin(0xbfd3ea), lin(0x5f5a46), 0.25);
    scene.add(sun, sun.target, hemi);
    scene.fog = new T.FogExp2(lin(0xc8d5e0), 1 / 21000);
    const mats = {
      white: new T.MeshStandardMaterial({ color: lin(0xeef0ed), roughness: 0.32, metalness: 0.0, envMapIntensity: 0.9 }),
      seam: new T.MeshStandardMaterial({ color: lin(0xd5d8d5), roughness: 0.5 }),
      blade: new T.MeshStandardMaterial({ color: lin(0xf2f3f0), roughness: 0.28, metalness: 0.0, envMapIntensity: 0.9 }),
      grey: new T.MeshStandardMaterial({ color: lin(0xa8adab), roughness: 0.65 }),
      bark: new T.MeshStandardMaterial({ color: lin(0xd8d0c4), roughness: 0.95 }),
      leaf: new T.MeshStandardMaterial({ color: 0xffffff, alphaTest: 0.5, side: T.DoubleSide, roughness: 0.8, envMapIntensity: 0.5 }),
      core: new T.MeshStandardMaterial({ roughness: 1, envMapIntensity: 0.4, map: canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#2d4620'; g.fillRect(0, 0, w, h);
        for (let k = 0; k < 2200; k++) { const v = rnd(k + 7); g.fillStyle = v < 0.5 ? 'rgba(18,30,12,.6)' : v < 0.85 ? 'rgba(62,92,38,.55)' : 'rgba(105,135,62,.45)'; g.beginPath(); g.ellipse(rnd(k) * w, rnd(k + 3e3) * h, 3 + rnd(k + 5e3) * 7, 2 + rnd(k + 6e3) * 5, rnd(k) * 3, 0, 6.3); g.fill(); }
      }, true) }),
      bushLeaf: new T.MeshStandardMaterial({ color: 0xffffff, alphaTest: 0.5, side: T.DoubleSide, roughness: 0.85, envMapIntensity: 0.5 }),
      wall: new T.MeshStandardMaterial({ map: plasterTex(), color: lin(0xdcd4c4), roughness: 0.92 }),
      roof: new T.MeshStandardMaterial({ map: roofTex(), color: lin(0xc9b8b0), roughness: 0.75 }),
      glass: new T.MeshStandardMaterial({ color: lin(0x2a3540), roughness: 0.08, metalness: 0.6, envMapIntensity: 1.2 }),
      frame: new T.MeshStandardMaterial({ color: lin(0xf0eee8), roughness: 0.6 }),
      door: new T.MeshStandardMaterial({ color: lin(0x5a3f2c), roughness: 0.7 }),
      fence: new T.MeshStandardMaterial({ color: lin(0xb1a796), roughness: 0.95 }),
      grassObj: new T.MeshStandardMaterial({ color: lin(0x7f9a4e), roughness: 1 }),
      hill: new T.MeshStandardMaterial({ color: lin(0x8aa356), roughness: 1, side: T.DoubleSide }),
      blob: new T.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false }),
      windows: windowTex(),
      ghost: new T.MeshBasicMaterial({ color: lin(0xff4f42), transparent: true, opacity: 0.58, depthWrite: false, depthFunc: T.GreaterDepth, fog: false })
    };
    // valós épületek anyagai (méterarányos UV-vel)
    mats.bWall = metricUV(new T.MeshStandardMaterial({ map: facadeTex(), roughness: 0.92 }), false);
    mats.bGable = metricUV(new T.MeshStandardMaterial({ map: plasterTex(), roughness: 0.92 }), false);
    mats.bRoof = metricUV(new T.MeshStandardMaterial({ map: roofTex(), roughness: 0.75 }), true);
    mats.blob.map = canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(20,28,14,.5)'); gr.addColorStop(1, 'rgba(20,28,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    const objGroup = new T.Group(), turbGroup = new T.Group(), ghostGroup = new T.Group(), bldGroup = new T.Group();
    scene.add(objGroup, bldGroup, turbGroup, ghostGroup);
    let bKey = '';
    let tKey = '', oKey = '', trKey = '', turbs = [], raf = 0, satKey = '', lastObs = null;
    const t0 = performance.now();
    // a forgatás csak akkor rajzol, ha a kép látszik (telefonon kíméli az akkut)
    let onScreen = true, lastFrame = 0, cssW = 1, cssH = 1;
    if (window.IntersectionObserver) new IntersectionObserver(e => { onScreen = e[e.length - 1].isIntersecting; }).observe(renderer.domElement);

    const api = {
      ok: true, ready: false, canvas: renderer.domElement, onReady: null,
      size(w, h, dpr) { cssW = w; cssH = h; renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); cam.aspect = w / h; renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; },
      setSun(az, el) {
        sunDir.set(Math.sin(az * RAD) * Math.cos(el * RAD), Math.sin(el * RAD), -Math.cos(az * RAD) * Math.cos(el * RAD));
        sky.material.uniforms.sunDir.value.copy(sunDir); tMat.uniforms.sunDir.value.copy(sunDir);
        sun.position.copy(sunDir).multiplyScalar(1000);
      },
      setTerrain(key, az, half, dMax, elev, sat) {
        const k = key + '|' + (sat ? sat.key : '');
        if (k === tKey) return; tKey = k;
        if (terrain) { scene.remove(terrain); terrain.geometry.dispose(); }
        terrain = new T.Mesh(buildTerrain(az, half, dMax, elev, sat ? sat.uvOf : null), tMat);
        if (sat && sat.key !== satKey) {
          satKey = sat.key;
          if (tMat.uniforms.sat.value) tMat.uniforms.sat.value.dispose();
          const st = new T.CanvasTexture(sat.canvas); st.anisotropy = 8; st.minFilter = T.LinearMipmapLinearFilter;
          tMat.uniforms.sat.value = st;
        }
        tMat.uniforms.hasSat.value = sat ? 1 : 0;
        scene.add(terrain);
      },
      setTurbines(list, key) {
        if (key === trKey) return;
        trKey = key;
        turbGroup.clear(); ghostGroup.clear(); turbs = [];
        for (const t of list) {
          const g = buildTurbine(t.hub, t.rotor, mats);
          g.position.set(t.x, t.baseY, -t.y);
          g.rotation.y = Math.atan2(-t.x, t.y);
          turbGroup.add(g);
          const gh = g.clone(true);
          gh.traverse(m => { if (m.isMesh) m.material = mats.ghost; });
          gh.userData = { rotor: gh.children[g.children.indexOf(g.userData.rotor)] };
          ghostGroup.add(gh);
          turbs.push({ g, gh, R: t.rotor / 2 });
        }
      },
      setObstacles(list, key, groundY, winter) {
        lastObs = [list, key, groundY, winter];
        if (!api.ready) return;              // a fotós anyagok még töltődnek
        const k = key + (winter ? 'w' : 's'); if (k === oKey) return; oKey = k;
        objGroup.traverse(m => { if (m.isMesh && m.material && m.material.map && m.material.userData.own) m.material.map.dispose(); });
        objGroup.clear();
        for (const o of list) objGroup.add(o.kind === 'trees' || o.kind === 'forest' || o.kind === 'bush' ? rowTrees(o, groundY, mats, winter, o.kind === 'bush' ? 12000 : 40000) : building(o, groundY, mats));
      },
      // valós épületek: [{ x, y (helyi m), L, W (m), a (a hosszabb oldal iránya északtól, rad), h (gerinc), eave, gable, seed }]
      setBuildings(list, key, groundY) {
        if (key === bKey) return; bKey = key;
        bldGroup.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
        bldGroup.clear();
        bldGroup.add(realBuildings(list, groundY, mats));
      },
      setView(az, pitch, fovH, w, h) {
        cam.aspect = w / h;
        cam.fov = 2 * Math.atan(Math.tan(fovH * RAD / 2) / cam.aspect) / RAD;
        cam.rotation.set(pitch * RAD, -az * RAD, 0);
        cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      },
      setGhost(on) { ghostGroup.visible = !!on; },
      setRotor(angle) { for (const t of turbs) { t.g.userData.rotor.rotation.z = angle; if (t.gh.userData.rotor) t.gh.userData.rotor.rotation.z = angle; } },
      // 1. táj és takarások, 2. a turbinák takart része áttűnve, 3. a turbinák
      render() {
        renderer.autoClear = false; renderer.clear();
        const gv = ghostGroup.visible, vis = v => { objGroup.visible = bldGroup.visible = sky.visible = v; if (terrain) terrain.visible = v; };
        turbGroup.visible = false; ghostGroup.visible = false;
        renderer.render(scene, cam);
        vis(false);
        if (gv) { ghostGroup.visible = true; renderer.render(scene, cam); ghostGroup.visible = false; }
        turbGroup.visible = true; renderer.render(scene, cam);
        vis(true); ghostGroup.visible = gv;
      },
      // forgás közben csak a rotorok körüli téglalap rajzolódik újra (a kép többi része változatlan)
      renderRotors() {
        const hub = new T.Vector3(), top = new T.Vector3();
        renderer.setScissorTest(true);
        for (const t of turbs) {
          t.g.userData.rotor.getWorldPosition(hub); top.copy(hub).y += t.R;
          hub.project(cam); top.project(cam);
          if (hub.z > 1) continue;
          const cx = (hub.x + 1) / 2 * cssW, cy = (1 - hub.y) / 2 * cssH;
          const r = Math.hypot((top.x - hub.x) / 2 * cssW, (top.y - hub.y) / 2 * cssH) * 1.1 + 4;
          const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(cssW, Math.ceil(cx + r));
          const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(cssH, Math.ceil(cy + r));
          if (x1 <= x0 || y1 <= y0) continue;
          renderer.setScissor(x0, cssH - y1, x1 - x0, y1 - y0);
          api.render();
        }
        renderer.setScissorTest(false);
      },
      // helyi (x, y, magasság) → képernyő-képpont (CSS px); null, ha a kamera mögött van
      project(x, y, z, w, h) {
        const v = new T.Vector3(x, z, -y).project(cam);
        if (v.z > 1) return null;
        return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h];
      },
      // azonos emelkedési szögű ív a képen (pontlista)
      elevCurve(azC, fovH, el, w, h) { const pts = []; for (let i = 0; i <= 24; i++) { const p = api.projectDir(azC - fovH / 2 - 2 + (fovH + 4) * i / 24, el, w, h); if (p) pts.push(p); } return pts; },
      // irány (azimut, emelkedés fokban) → képpont
      projectDir(az, el, w, h) { const r = 1000; return api.project(Math.sin(az * RAD) * Math.cos(el * RAD) * r, Math.cos(az * RAD) * Math.cos(el * RAD) * r, Math.sin(el * RAD) * r, w, h); },
      animate(on, onFrame) {
        cancelAnimationFrame(raf);
        if (!on) return;
        // kb. 9 fordulat/perc (SG 7.0-170 névleges), szemből nézve az óramutató járásával egyezően; legfeljebb 30 kép/s
        const ang = now => -(now - t0) / 1000 * 2 * Math.PI * (9 / 60);
        api.setRotor(ang(performance.now())); api.render();   // teljes kép most, utána csak a rotorok
        const loop = now => {
          raf = requestAnimationFrame(loop);
          if (!onScreen || now - lastFrame < 32) return;
          lastFrame = now; api.setRotor(ang(now)); api.renderRotors();
          if (onFrame) onFrame();
        };
        raf = requestAnimationFrame(loop);
      },
      fixRotor() { api.setRotor(0); },
      // ellenőrzéshez: a turbina és a takart rész tiszta színnel (tónusleképzés nélkül)
      testColors() { mats.white.toneMapped = mats.blade.toneMapped = false; mats.white.color.setRGB(0, 1, 0); mats.blade.color.setRGB(0, 1, 0); mats.white.envMapIntensity = mats.blade.envMapIntensity = 0; mats.white.emissive.setRGB(0, 1, 0); mats.blade.emissive.setRGB(0, 1, 0); mats.ghost.color.setRGB(1, 0, 0); mats.ghost.opacity = 1; mats.ghost.toneMapped = false; mats.white.needsUpdate = mats.blade.needsUpdate = mats.ghost.needsUpdate = true; }
    };

    /* fotó alapú anyagok betöltése; amíg töltődnek, a takarások még nem rajzolódnak.
       Helyi fájlként (file://) a böngésző nem engedi a fotókat WebGL-be: ilyenkor rajzolt tartalék-textúrák. */
    const base = opts.assets || 'assets/', tl = new T.TextureLoader(), local = location.protocol === 'file:';
    const leafFallback = () => canvasTex(256, 256, (g, w, h) => {
      for (let k = 0; k < 70; k++) { const x = 40 + rnd(k) * 176, y = 20 + rnd(k + 99) * 210, r = 9 + rnd(k + 7) * 9, v = rnd(k + 3);
        g.fillStyle = v < 0.4 ? '#3e6a2a' : v < 0.8 ? '#5a8a36' : '#86ad52'; g.beginPath(); g.ellipse(x, y, r, r * 0.55, rnd(k + 5) * 3, 0, 6.3); g.fill(); }
      g.strokeStyle = '#4a3a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 256); g.lineTo(128, 60); g.stroke();
    });
    const barkFallback = () => canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#6b5a48'; g.fillRect(0, 0, w, h); for (let k = 0; k < 120; k++) { g.fillStyle = rnd(k) < 0.5 ? 'rgba(40,30,20,.35)' : 'rgba(150,135,115,.25)'; g.fillRect(rnd(k + 1) * w, rnd(k + 2) * h, 2 + rnd(k + 3) * 3, 10 + rnd(k + 4) * 40); } }, true);
    const fallbacks = { 'level_tolgy.png': leafFallback, 'level_koris.png': leafFallback, 'kereg_tolgy.jpg': barkFallback };
    let pending = 1;
    const loaded = () => { if (--pending > 0) return; api.ready = true; oKey = ''; if (lastObs) api.setObstacles(...lastObs); if (api.onReady) api.onReady(); };
    const loadTex = (file, srgb, rep, apply) => {
      const fb = () => { if (fallbacks[file]) { const t = fallbacks[file](); if (rep) t.wrapS = t.wrapT = T.RepeatWrapping; apply(t); } };
      if (local) { fb(); return; }
      pending++;
      tl.load(base + file, t => { if (srgb) t.encoding = T.sRGBEncoding; if (rep) t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; apply(t); loaded(); }, undefined, () => { fb(); loaded(); });
    };
    loadTex('level_tolgy.png', true, false, t => { mats.leaf.map = t; mats.leaf.needsUpdate = true; });
    loadTex('level_koris.png', true, false, t => { mats.bushLeaf.map = t; mats.bushLeaf.needsUpdate = true; });
    loadTex('kereg_tolgy.jpg', true, true, t => { t.repeat.set(1, 3); mats.bark.map = t; mats.bark.needsUpdate = true; });
    loadTex('kereg_tolgy_normal.jpg', false, true, t => { t.repeat.set(1, 3); mats.bark.normalMap = t; mats.bark.needsUpdate = true; });
    loadTex('fu.jpg', true, true, t => { tMat.uniforms.grass.value = t; tMat.uniforms.hasGrass.value = 1; mats.grassObj.map = mats.hill.map = t; mats.grassObj.color = lin(0xb9c4a0); mats.hill.color = lin(0xc4cfa8); mats.grassObj.needsUpdate = mats.hill.needsUpdate = true; });
    if (!local) {
      // égbolt-fény (Poly Haven HDRI): RGBE bájtok veszteségmentes PNG-ben, A = közös kitevő
      pending++;
      tl.load(base + 'egbolt_quarry_01_1k_rgbe.png', h => {
        h.encoding = T.RGBEEncoding; h.minFilter = h.magFilter = T.NearestFilter; h.generateMipmaps = false; h.premultiplyAlpha = false;
        const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(h).texture; h.dispose(); pm.dispose(); loaded();
      }, undefined, () => loaded());
    }
    setTimeout(loaded, 0);
    return api;
  }
  return { create };
})();
