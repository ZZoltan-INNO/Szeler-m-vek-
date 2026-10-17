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
  const SUN = { x: 0.4, y: 0.6, z: 0.7 };   // a napirány (setSun állítja), a vetett árnyékokhoz
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
        sat2: { value: null }, hasSat2: { value: 0 }, box2: { value: new T.Vector4() },
        sunDir: { value: new T.Vector3() }, fogCol: { value: lin(0xc8d5e0) }, fogDen: { value: 1 / 21000 },
        skyAmb: { value: lin(0xa9bfdb) }, gndAmb: { value: lin(0x6e6a55) }, sunCol: { value: lin(0xfff1d8).multiplyScalar(1.9) }
      },
      vertexShader: `
        varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        void main(){ vN = normal; vW = position; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        uniform sampler2D sat, grass, fields, sat2; uniform float hasSat, hasGrass, hasSat2, fogDen; uniform vec3 sunDir, fogCol, skyAmb, gndAmb, sunCol; uniform vec4 box2;
        varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        vec3 L(vec3 c){ return pow(c, vec3(2.2)); }
        void main(){
          float dist = length(vW.xz);
          vec3 base = hasSat > .5 ? L(texture2D(sat, vUv).rgb) * 1.45 : L(texture2D(fields, vW.xz / 4200.).rgb);
          vec3 g1 = hasGrass > .5 ? L(texture2D(grass, vW.xz / 3.2).rgb) : vec3(.12,.17,.06);
          vec3 g2 = hasGrass > .5 ? L(texture2D(grass, vW.xz / 29.).rgb) : vec3(.12,.17,.06);
          float near = 1. - smoothstep(15., 260., dist), grassMix = .75;
          // légifotó a nézőpont körüli négyzeten (box2: nyugat, dél, kelet, észak, helyi m), a szélén lágy átmenettel
          if (hasSat2 > .5) {
            vec2 q = vec2((vW.x - box2.x) / (box2.z - box2.x), (-vW.z - box2.y) / (box2.w - box2.y));
            float e = smoothstep(0., .08, min(min(q.x, 1. - q.x), min(q.y, 1. - q.y)));
            if (e > 0.) { base = mix(base, L(texture2D(sat2, q).rgb) * 1.08, e); grassMix = mix(.75, .3, e); }
          }
          vec3 grassCol = g1 * (1. + 2.6 * g2);
          base = mix(base, mix(base * 1.15, grassCol, grassMix), near);
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
    const tip = pos.length / 3; pos.push(0, R, 0);
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
    const rot = new T.Group(); rot.position.set(0, hub, 4.2); grp.add(rot);
    const sp = new T.Mesh(new T.SphereGeometry(2.9, 32, 20), mats.white); sp.scale.set(1, 1, 1.45); rot.add(sp);
    const bg = bladeGeometry(R);
    for (let k = 0; k < 3; k++) { const b = new T.Mesh(bg, mats.blade); b.rotation.z = -k * 2 * Math.PI / 3; b.position.z = 0.6; rot.add(b); }
    grp.userData.rotor = rot; grp.userData.R = R; grp.userData.hub = hub;
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
    // megadott fák (a fás területek és a mért fák közeli példányai): magasság (Htop vagy H) és koronaalak fánként (rx, ry, card)
    if (o.trees) o.trees.forEach((q, c) => trees.push({ x: q.x, y: q.y, g: groundY(q.x, q.y), h: q.Htop || q.H, rx: q.rx, ry: q.ry, card: q.card, seed: o.seed * 31 + c * 7.7, dist: Math.hypot(q.x, q.y) }));
    else for (let r = 0; r < rows; r++) for (let kk = k0; kk <= k1 && trees.length < 2500; kk++) {
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
      const card = t.card || Math.min(5, Math.max(2, H * 0.24)) * (t.dist > 500 ? 1.3 : 1);
      // a levélcsokrok legfeljebb kb. 1,05 csokornyit nyúlnak ki a korona burkán túl: így a fa teteje H
      const ry = t.ry || H * 0.4 - card * 0.42, rx = t.rx || H * 0.34 - card * 0.35, cy = t.g + H - ry - card * 1.05;
      const bf = Math.min(1, (rx + card * 0.5) / (H * 0.34 + card * 0.15));   // keskeny koronánál rövidebb ágak
      const nMain = 5 + ((rnd(sd + 1) * 3) | 0);
      for (let b = 0; b < nMain; b++) {
        const a = (b / nMain + rnd(sd + b) * 0.15) * 6.28, tilt = (30 + rnd(sd + b * 2) * 28) * RAD;
        const d = new T.Vector3(Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a)).normalize();
        const hf = b / Math.max(1, nMain - 1), st = P0.clone().add(new T.Vector3(0, th * 0.85 + (H * 0.42) * hf * (0.85 + rnd(sd + b * 3) * 0.3), 0)), len = bf * H * (0.42 - 0.18 * hf + rnd(sd + b * 4) * 0.08);
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
      const cf = t.rx ? 0.96 : 0.8;   // a mért fáknál (megadott korona) a belső lombtömb majdnem a teljes korona
      cores.push(new T.Matrix4().compose(new T.Vector3(t.x, cy, -t.y), new T.Quaternion().setFromAxisAngle(Y, rnd(sd + 2) * 6.28), new T.Vector3(rx * cf, ry * (cf + 0.02), rx * cf)));
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
  const unitHip = (() => {    // sátortető: négy háromszög a csúcsig (0, 1, 0)
    const g = new T.BufferGeometry(), a = [-0.5, 0, -0.5], b = [0.5, 0, -0.5], c = [0.5, 0, 0.5], d = [-0.5, 0, 0.5], t = [0, 1, 0];
    const P = [...d, ...c, ...t, ...c, ...b, ...t, ...b, ...a, ...t, ...a, ...d, ...t];
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(new Array(24).fill(0), 2)); g.computeVertexNormals(); return g;
  })();
  // homlokzat: vakolat, lábazat, 4,2 m-enként egy ablak; egy emelet 3,3 m (családi háznál nem ismétlődik); 512 px = 4,2 m
  const facadeTex = () => canvasTex(512, 402, (g, w, h) => {
    g.fillStyle = '#efe7d6'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(${rnd(k) < 0.5 ? '120,105,80' : '255,255,250'},${0.03 + rnd(k + 9) * 0.03})`; g.beginPath(); g.ellipse(rnd(k + 1e3) * w, rnd(k + 2e3) * h, 30 + rnd(k + 3e3) * 80, 20 + rnd(k + 4e3) * 60, rnd(k) * 3, 0, 6.3); g.fill(); }
    for (let k = 0; k < 16000; k++) { g.fillStyle = rnd(k) < 0.5 ? 'rgba(100,88,64,.07)' : 'rgba(255,255,255,.09)'; g.fillRect(rnd(k + 1e4) * w, rnd(k + 2e4) * h, 1 + rnd(k + 3e4) * 2, 1 + rnd(k + 4e4) * 2); }
    const x0 = 188, ww = 140, y0 = 118, wh = 158;                        // kb. 1,15 × 1,3 m-es ablak, 0,95 m-es parapet
    // esővíz-csíkok a párkány alatt, kosz a lábazat felett
    for (let k = 0; k < 14; k++) { const x = x0 + rnd(k + 70) * ww, gr = g.createLinearGradient(0, y0 + wh, 0, y0 + wh + 60 + rnd(k) * 60); gr.addColorStop(0, 'rgba(90,80,62,.16)'); gr.addColorStop(1, 'rgba(90,80,62,0)'); g.fillStyle = gr; g.fillRect(x, y0 + wh, 2 + rnd(k + 5) * 4, 130); }
    const dirt = g.createLinearGradient(0, h - 120, 0, h - 52); dirt.addColorStop(0, 'rgba(95,85,65,0)'); dirt.addColorStop(1, 'rgba(95,85,65,.22)'); g.fillStyle = dirt; g.fillRect(0, h - 120, w, 68);
    // keret (vakolatkeret), redőnytok, tok, üveg az ég tükörképével, osztók
    g.fillStyle = 'rgba(70,60,45,.22)'; g.fillRect(x0 - 16, y0 - 22, ww + 34, wh + 44);
    g.fillStyle = '#f7f4ec'; g.fillRect(x0 - 14, y0 - 24, ww + 28, wh + 40);
    g.fillStyle = '#d9d4ca'; g.fillRect(x0 - 2, y0 - 20, ww + 4, 18);
    g.fillStyle = '#c9c4b8'; for (let y = y0 - 18; y < y0 - 4; y += 4) g.fillRect(x0, y, ww, 1);
    g.fillStyle = '#fbfaf6'; g.fillRect(x0, y0, ww, wh);
    const fx = 7, gx0 = x0 + fx, gw = (ww - 3 * fx) / 2, gy0 = y0 + fx, gh = wh - 2 * fx;
    for (const xx of [gx0, gx0 + gw + fx]) {
      const gr = g.createLinearGradient(0, gy0, 0, gy0 + gh); gr.addColorStop(0, '#b9cbdc'); gr.addColorStop(0.45, '#6f879c'); gr.addColorStop(0.5, '#3b4956'); gr.addColorStop(1, '#222a31');
      g.fillStyle = gr; g.fillRect(xx, gy0, gw, gh);
      g.fillStyle = 'rgba(235,228,210,.35)'; g.fillRect(xx + 3, gy0 + gh * 0.52, gw * 0.42, gh * 0.46);   // függöny
      g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(xx + gw * 0.2, gy0); g.lineTo(xx + gw * 0.55, gy0); g.lineTo(xx + gw * 0.15, gy0 + gh); g.lineTo(xx, gy0 + gh); g.lineTo(xx, gy0 + gh * 0.6); g.closePath(); g.fill();
    }
    g.fillStyle = '#e4e0d6'; g.fillRect(x0 - 10, y0 + wh, ww + 20, 9);   // párkány
    g.fillStyle = 'rgba(60,52,40,.35)'; g.fillRect(x0 - 10, y0 + wh + 9, ww + 20, 5);
    // lábazat (kb. 0,45 m): kőporos, foltos
    g.fillStyle = '#8f8574'; g.fillRect(0, h - 54, w, 54);
    for (let k = 0; k < 3000; k++) { g.fillStyle = rnd(k + 7e4) < 0.5 ? 'rgba(40,35,28,.18)' : 'rgba(200,190,170,.15)'; g.fillRect(rnd(k + 8e4) * w, h - 54 + rnd(k + 9e4) * 54, 2, 2); }
    g.fillStyle = 'rgba(40,35,28,.35)'; g.fillRect(0, h - 56, w, 3);
  }, true);
  // cserép (semleges: a színt a példányszín adja): hullámos profilú, átfedő sorok; 512 px = 3,2 m széltében, 1,1 m magasságban
  const roofTexNeutral = () => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#6a6460'; g.fillRect(0, 0, w, h);
    const nx = 11, ny = 5, tw = w / nx, th = h / ny;
    for (let r = 0; r <= ny; r++) for (let c = -1; c <= nx; c++) {
      const x = c * tw + (r % 2) * tw * 0.5, y = r * th - th * 0.08, v = 0.82 + rnd(r * 97 + c * 13) * 0.3, age = rnd(r * 31 + c * 7);
      for (let i = 0; i < tw; i += 2) {   // hullámprofil: a napfény a hullám egyik oldalát éri
        const ph = Math.sin(i / tw * Math.PI * 2) * 0.16 + 0.92, lv = Math.min(255, 228 * v * ph) | 0;
        const gr = g.createLinearGradient(0, y, 0, y + th * 1.08); gr.addColorStop(0, `rgb(${lv * 0.7 | 0},${lv * 0.7 | 0},${lv * 0.7 | 0})`); gr.addColorStop(0.25, `rgb(${lv},${lv},${lv})`); gr.addColorStop(1, `rgb(${lv * 0.88 | 0},${lv * 0.88 | 0},${lv * 0.88 | 0})`);
        g.fillStyle = gr; g.fillRect(x + i, y, 2.2, th * 1.08);
      }
      if (age > 0.7) { g.fillStyle = `rgba(70,75,50,${(age - 0.7) * 0.5})`; g.fillRect(x, y + th * 0.6, tw, th * 0.5); }   // moha, kosz
      g.fillStyle = 'rgba(25,20,18,.55)'; g.fillRect(x, y + th * 1.02, tw, th * 0.07);   // a következő sor alsó élének árnyéka
      g.fillStyle = 'rgba(25,20,18,.35)'; g.fillRect(x + tw - 1.5, y, 1.5, th);
    }
  }, true);
  // lombtalan ágszövet (télen): fa-ágrajz átlátszó háttéren; dense: az erdő belseje (sűrűbb), különben ritkább
  const twigTex = dense => canvasTex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.lineCap = 'round';
    if (dense) { g.fillStyle = '#8f857c'; g.fillRect(0, 0, w, h); for (let k = 0; k < 400; k++) { g.fillStyle = rnd(k + 3) < 0.5 ? 'rgba(80,70,64,.3)' : 'rgba(175,165,155,.25)'; g.beginPath(); g.ellipse(rnd(k) * w, rnd(k + 1) * h, 8 + rnd(k + 2) * 20, 5 + rnd(k + 4) * 14, rnd(k) * 3, 0, 6.3); g.fill(); } }
    const br = (x, y, a, len, wd, d, k) => {
      if (d > 6 || len < 5) return;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.strokeStyle = `rgba(${78 + d * 9},${68 + d * 8},${58 + d * 7},${0.95 - d * 0.06})`; g.lineWidth = wd;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (rnd(k) - 0.5) * len * 0.3, (y + y2) / 2 + (rnd(k + 1) - 0.5) * len * 0.3, x2, y2); g.stroke();
      const n = 2 + (rnd(k + 2) * 2 | 0);
      for (let i = 0; i < n; i++) br(x2, y2, a + (rnd(k + 3 + i) - 0.5) * 1.5, len * (0.62 + rnd(k + 7 + i) * 0.15), wd * 0.66, d + 1, k * 3.7 + i * 11.3);
    };
    const N = dense ? 60 : 26;
    for (let j = 0; j < N; j++) for (const [dx, dy] of [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]]) br(rnd(j) * w + dx, rnd(j + 50) * h + dy, rnd(j + 99) * 6.28, 40 + rnd(j + 7) * 50, dense ? 5 : 4, 0, j * 17.1);
  }, true);
  // az instanced épületeken méterarányos UV: a példány méretarányából számolva (nem nyúlik a textúra)
  const metricUV = (mat, roof) => {
    mat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
        #ifdef USE_INSTANCING
          vec3 isc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
          ${roof ? 'vUv = vec2(abs(normal.x) > abs(normal.z) ? position.z * isc.z : position.x * isc.x, position.y * isc.y) / vec2(3.2, 1.1);'
                 : 'vUv = vec2((position.x * isc.x + position.z * isc.z) / 4.2, position.y * isc.y / 3.3);'}
        #endif`);
    };
    mat.customProgramCacheKey = () => roof ? 'bld-roof' : 'bld-wall';
    return mat;
  };
  const WALLC = [0xf3eee2, 0xece4d0, 0xf4eac6, 0xe8e8e3, 0xefdcc0, 0xe2ddd0, 0xf0e2d6, 0xdfe3d6];
  const ROOFC = [0xb4553c, 0xa04a34, 0xc0643f, 0x8a4f3c, 0x6e4a3e, 0x55545a, 0x6d6b69, 0xa85a44];   // terrakotta, vörös, barna, antracit, szürke
  const HILITE = 0x7fb8ff;
  function realBuildings(list, groundY, mats) {
    const grp = new T.Group(), n = list.length; if (!n) return grp;
    const ng = list.filter(b => b.roof === 'gable').length, nh = list.filter(b => b.roof === 'hip').length;
    // ablakos homlokzat a lakóház méretű vagy magas (többszintes) épületeken; csűr, csarnok: sima vakolat
    const win = b => b.L * b.W < 380 || b.h > 9.5, nw = list.filter(win).length;
    const mk = (geo, mat, cnt) => { const im = new T.InstancedMesh(geo, mat, Math.max(1, cnt)); im.count = cnt; im.userData.ids = []; im.frustumCulled = false; grp.add(im); return im; };
    const nc = list.filter(b => b.chim != null).length;
    const walls = mk(unitBox, mats.bWall, nw), plain = mk(unitBox, mats.bGable, n - nw), roofs = mk(unitRoof, mats.bRoof, ng),
          gables = mk(unitGable, mats.bGable, ng), hips = mk(unitHip, mats.bRoof, nh), ridges = mk(unitBox, mats.bRidge, ng),
          fascias = mk(unitBox, mats.bFascia, ng + nh), chims = mk(unitBox, mats.bChim, nc), caps = mk(unitBox, mats.bFascia, nc);
    // vetett árnyék a nap felőli oldallal szemben (lágy folt a talajon) és egy kisebb, sötétebb folt a ház tövében
    const blobs = new T.InstancedMesh(blobGeo, mats.blob, 2 * n); blobs.frustumCulled = false; grp.add(blobs);
    const sh = Math.hypot(SUN.x, SUN.z) || 1, sdx = -SUN.x / sh, sdz = -SUN.z / sh, cot = Math.min(3, sh / Math.max(0.2, SUN.y));
    const m = new T.Matrix4(), q = new T.Quaternion(), c = new T.Color();
    const parts = grp.userData.parts = new Map();   // épület-azonosító → [[mesh, példány, eredeti szín], ...]
    const put = (im, b, mat, col) => { const k = im.userData.ids.length; im.setMatrixAt(k, mat); c.set(col).convertSRGBToLinear(); im.setColorAt(k, c); im.userData.ids.push(b); if (!parts.has(b.id)) parts.set(b.id, []); parts.get(b.id).push([im, k, col]); };
    list.forEach((b, i) => {
      // talaj: a sarkoknál a legalacsonyabb pont alá nyúlik a fal, így lejtőn sem lebeg
      const ex = Math.sin(b.a), ey = Math.cos(b.a), hx = b.L / 2, hw = b.W / 2;
      const gc = groundY(b.x, b.y);
      let g0 = gc; for (const [s, u] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g0 = Math.min(g0, groundY(b.x + ex * hx * s + ey * hw * u, b.y + ey * hx * s - ex * hw * u));
      const base = g0 - 0.3, eave = gc + b.eave, wc = WALLC[(b.seed * 7) % WALLC.length], rc = ROOFC[(b.seed * 13) % ROOFC.length], rh = b.h - b.eave;
      q.setFromAxisAngle(Y, Math.PI - b.a);
      m.compose(new T.Vector3(b.x, base, -b.y), q, new T.Vector3(b.W, eave - base, b.L));
      put(win(b) ? walls : plain, b, m, wc);
      m.compose(new T.Vector3(b.x, gc + 0.04, -b.y), q, new T.Vector3(b.W * 1.25 + 1.5, 1, b.L * 1.15 + 1.5)); blobs.setMatrixAt(2 * i, m);
      const sl = b.h * 0.6 * cot, sz = Math.max(b.L, b.W) + 2;
      m.compose(new T.Vector3(b.x + sdx * sl * 0.6, gc + 0.05, -b.y + sdz * sl * 0.6), new T.Quaternion().setFromAxisAngle(Y, Math.atan2(sdx, sdz)), new T.Vector3(sz, 1, sl + sz * 0.8)); blobs.setMatrixAt(2 * i + 1, m);
      // az eresz 0,45 m-rel nyúlik ki, a tetősík meghosszabbításában (így a tető felülete pontosan a számításé)
      const dz = 0.45 * rh / hw;
      if (b.roof === 'gable') {
        m.compose(new T.Vector3(b.x, eave - dz, -b.y), q, new T.Vector3(b.W + 0.9, rh + dz, b.L + 0.6)); put(roofs, b, m, rc);
        m.compose(new T.Vector3(b.x, eave, -b.y), q, new T.Vector3(b.W, rh, b.L)); put(gables, b, m, wc);
        m.compose(new T.Vector3(b.x, gc + b.h - 0.2, -b.y), q, new T.Vector3(0.34, 0.2, b.L + 0.6)); put(ridges, b, m, rc);   // gerinccserép (teteje = gerincmagasság)
        m.compose(new T.Vector3(b.x, eave - dz - 0.2, -b.y), q, new T.Vector3(b.W + 0.95, 0.2, b.L + 0.62)); put(fascias, b, m, 0x5b5148);   // eresz, csatorna
      } else if (b.roof === 'hip') {
        const ol = 0.9 * b.L / b.W;   // a kontyolt végeken is ugyanabban a síkban
        m.compose(new T.Vector3(b.x, eave - dz, -b.y), q, new T.Vector3(b.W + 0.9, rh + dz, b.L + ol)); put(hips, b, m, rc);
        m.compose(new T.Vector3(b.x, eave - dz - 0.2, -b.y), q, new T.Vector3(b.W + 0.95, 0.2, b.L + ol + 0.05)); put(fascias, b, m, 0x5b5148);
      }
      if (b.chim != null) {   // kémény a gerincen (a számításban is: CHIM_W széles, a gerinc fölé CHIM_UP-pal nyúlik)
        const cx = b.x + ex * b.chim, cy = b.y + ey * b.chim;
        m.compose(new T.Vector3(cx, eave, -cy), q, new T.Vector3(b.chimW, gc + b.h + b.chimUp - 0.12 - eave, b.chimW)); put(chims, b, m, 0xa4746a);
        m.compose(new T.Vector3(cx, gc + b.h + b.chimUp - 0.12, -cy), q, new T.Vector3(b.chimW, 0.12, b.chimW)); put(caps, b, m, 0x6a6560);
      }
    });
    return grp;
  }
  /* ---------- Fás területek: instanced koronák (közel: törzs + korona, távolabb: a talajig záródó lombtömb) ---------- */
  // lombtömb: függőleges oldal a talajtól a magasság 55%-áig, felül lekerekítve; teteje pontosan 1 (= famagasság)
  const canopyGeo = new T.LatheGeometry([[0, 0], [1, 0], [1, 0.55], [0.92, 0.74], [0.68, 0.9], [0.32, 0.985], [0, 1]].map(([x, y]) => new T.Vector2(x, y)), 9);
  // enyhén csomós korona: alacsony frekvenciájú dudorok, a burok 95–100%-a (a számítás ellipszoidja a teljes burok)
  const crownGeo = (() => {
    const g = new T.SphereGeometry(1, 18, 13), p = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      const f = 0.95 + 0.05 * (0.5 + 0.5 * Math.sin(v.x * 4.1 + 1.3) * Math.sin(v.y * 3.7 + 0.4) * Math.sin(v.z * 4.6 + 2.1)) * (0.85 + rnd(i * 1.7) * 0.15);
      p.setXYZ(i, v.x * f, v.y * f, v.z * f);
    }
    g.computeVertexNormals(); return g;
  })();
  const FORC = [0x4f6d33, 0x587a38, 0x46632e, 0x62803f, 0x3f5a2a], BAREC = [0x7a6c5c, 0x6e6152, 0x837464];
  // fák: [{ x, y, H, R, ry, card, seed, kind: 'photo' | 'crown' | 'canopy', solid }] — a lap állítja elő (forestCrown,
  // treeItem), az alakok egyeznek a takarás számításában használt koronákkal (crownHeight)
  function forestTrees(list, groundY, winter, mats) {
    const grp = new T.Group(), m = new T.Matrix4(), q = new T.Quaternion(), c = new T.Color(), pal = winter ? BAREC : FORC;
    const photo = list.filter(t => t.kind === 'photo');
    if (photo.length) grp.add(rowTrees({ kind: 'trees', trees: photo, seed: 17 }, groundY, mats, winter, 12000));
    for (const solid of [true, false]) {
      const mat = !winter ? mats.forest : solid ? mats.bare : mats.bareThin;
      const cs = list.filter(t => t.kind === 'crown' && t.solid === solid), fs = list.filter(t => t.kind === 'canopy' && t.solid === solid);
      if (fs.length) {
        const im = new T.InstancedMesh(canopyGeo, mat, fs.length);
        fs.forEach((t, i) => { m.compose(new T.Vector3(t.x, groundY(t.x, t.y) - 0.5, -t.y), q.setFromAxisAngle(Y, t.seed * 6.28), new T.Vector3(t.R, t.H + 0.5, t.R)); im.setMatrixAt(i, m); c.set(pal[Math.floor(t.seed * 997) % pal.length]).convertSRGBToLinear(); im.setColorAt(i, c); });
        im.frustumCulled = false; grp.add(im);
      }
      if (cs.length) {
        const cr = new T.InstancedMesh(crownGeo, mat, cs.length), tr = new T.InstancedMesh(unitCyl, mats.trunk, cs.length);
        cs.forEach((t, i) => {
          const g = groundY(t.x, t.y);
          m.compose(new T.Vector3(t.x, g + t.H - t.ry, -t.y), q.setFromAxisAngle(Y, t.seed * 6.28), new T.Vector3(t.R, t.ry, t.R)); cr.setMatrixAt(i, m);
          c.set(pal[Math.floor(t.seed * 997) % pal.length]).convertSRGBToLinear(); cr.setColorAt(i, c);
          m.compose(new T.Vector3(t.x, g - 0.3, -t.y), q.identity(), new T.Vector3(0.12 + t.H * 0.012, Math.max(0.5, t.H - 2 * t.ry + 1.5), 0.12 + t.H * 0.012)); tr.setMatrixAt(i, m);
        });
        cr.frustumCulled = tr.frustumCulled = false; grp.add(cr, tr);
      }
    }
    // vetett árnyék a talajon (nyáron a lomb, télen halványan) a közeli fák és erdőszélek mögött
    const sh = list.filter(t => t.kind !== 'photo' && t.x * t.x + t.y * t.y < 2500 * 2500);
    if (sh.length) {
      const bl = new T.InstancedMesh(blobGeo, winter ? mats.blobThin : mats.blob, sh.length), hs = Math.hypot(SUN.x, SUN.z) || 1, cot = Math.min(3, hs / Math.max(0.2, SUN.y));
      const dx = -SUN.x / hs, dz = -SUN.z / hs, rot = new T.Quaternion().setFromAxisAngle(Y, Math.atan2(dx, dz));
      sh.forEach((t, i) => { const L = (t.H - (t.ry || t.H * 0.4)) * cot; m.compose(new T.Vector3(t.x + dx * L, groundY(t.x, t.y) + 0.06, -t.y + dz * L), rot, new T.Vector3(t.R * 2.3, 1, t.R * 2.3 + (t.ry || t.H * 0.4) * cot * 1.6)); bl.setMatrixAt(i, m); });
      bl.frustumCulled = false; grp.add(bl);
    }
    return grp;
  }
  /* ---------- Műemlék (a jáki templom és a Szent Jakab-kápolna) a lap által megadott részekből ----------
     A részek alakja (falmagasság, tetőformák) pontosan a lap magasságmezője; a díszítés (párkányok, frízek, ablakok,
     a kapuzat) legfeljebb néhány centiméterrel áll ki a falsíkból. */
  // kváderkő: soronként változó magasságú, egyenként árnyalt kőtömbök; 512 px = 4 m
  const stoneTex = (base, dark) => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = dark; g.fillRect(0, 0, w, h);
    let y = 0, row = 0;
    while (y < h) {
      const ch = 34 + ((rnd(row * 7.1) * 14) | 0); let x = -rnd(row * 3.3) * 60;
      while (x < w) {
        const bw = 60 + rnd(row * 31 + x) * 80, v = 0.86 + rnd(row * 13 + x * 0.7) * 0.2, wt = rnd(row * 5 + x * 0.3) > 0.88 ? 0.86 : 1;
        const c = base.map(k => Math.min(255, k * v * wt) | 0);
        const gr = g.createLinearGradient(0, y, 0, y + ch); gr.addColorStop(0, `rgb(${c.map(k => Math.min(255, k + 14)).join(',')})`); gr.addColorStop(1, `rgb(${c.map(k => k - 12).join(',')})`);
        g.fillStyle = gr; g.fillRect(x + 1.5, y + 1.5, bw - 3, ch - 3);
        for (let k = 0; k < bw * ch / 60; k++) { g.fillStyle = rnd(k + x + row * 99) < 0.5 ? 'rgba(80,70,55,.12)' : 'rgba(255,250,235,.12)'; g.fillRect(x + rnd(k * 1.3 + row) * bw, y + rnd(k * 2.7 + x) * ch, 2, 2); }
        x += bw;
      }
      y += ch; row++;
    }
    // esőcsíkok
    for (let k = 0; k < 30; k++) { const x = rnd(k + 500) * w, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(70,62,50,0)'); gr.addColorStop(rnd(k + 9), 'rgba(70,62,50,.10)'); gr.addColorStop(1, 'rgba(70,62,50,0)'); g.fillStyle = gr; g.fillRect(x, 0, 3 + rnd(k) * 8, h); }
  }, true);
  // román kori ívsoros fríz (konzolos kis ívek a párkány alatt); 512 px = 4 m széles, a sáv teljes magassága
  const friezeTex = () => canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = '#d6cab0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const x = i * 64; g.fillStyle = 'rgba(60,50,38,.45)';
      g.beginPath(); g.moveTo(x + 6, h); g.lineTo(x + 6, 30); g.arc(x + 32, 30, 26, Math.PI, 0); g.lineTo(x + 58, h); g.closePath(); g.fill();
      g.fillStyle = '#e4d9c0'; g.fillRect(x - 3, 40, 6, 24);
    }
    g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, 6); g.fillStyle = 'rgba(60,50,38,.35)'; g.fillRect(0, 6, w, 3);
  }, true);
  // a nyugati kapuzat homlokzata: lépcsőzetes, oszlopos bélletű kapu, timpanon, fölötte apostolszobrok fülkéi és orom;
  // a kép 5,4 m széles és 15,5 m magas (a kapuépítmény homlokzata az oromcsúcsig)
  const portalTex = () => canvasTex(512, 1024, (g, w, h) => {
    const X = m => m / 5.4 * w, Yz = z => h - z / 15.5 * h, sx = w / 5.4, sy = h / 15.5;
    const st = stoneTex([214, 200, 172], '#a89c86').image;   // 4 × 4 m-es kőminta, méretarányosan ismételve
    for (let y = 0; y < h; y += 4 * sy) for (let x = 0; x < w; x += 4 * sx) g.drawImage(st, x, y, 4 * sx, 4 * sy);
    g.save(); g.translate(0, 0);
    const cx = X(2.7), zs = 5.9;   // az ív indítása
    // lépcsőzetes béllet: kívülről befelé váltakozó világos oszlopok és árnyékos sávok
    for (let k = 0; k < 8; k++) {
      const r = 2.5 - k * 0.24, light = k % 2 === 0;
      g.fillStyle = light ? `rgb(${226 - k * 6},${214 - k * 6},${188 - k * 6})` : `rgb(${132 - k * 6},${118 - k * 6},${96 - k * 6})`;
      g.beginPath(); g.moveTo(cx - r * sx, Yz(0.35)); g.lineTo(cx - r * sx, Yz(zs)); g.ellipse(cx, Yz(zs), r * sx, r * sy, 0, Math.PI, 0); g.lineTo(cx + r * sx, Yz(0.35)); g.closePath(); g.fill();
      if (light) { g.fillStyle = 'rgba(70,58,42,.35)'; for (const sg of [-1, 1]) g.fillRect(cx + sg * r * sx - (sg > 0 ? 3 : 0), Yz(zs), 3, Yz(0.35) - Yz(zs)); }
    }
    // ajtó és timpanon
    g.fillStyle = '#cbbd9e'; g.beginPath(); g.ellipse(cx, Yz(4.5), 0.78 * sx, 0.78 * sy, 0, Math.PI, 0); g.closePath(); g.fill();
    g.fillStyle = 'rgba(90,78,60,.5)'; g.beginPath(); g.arc(cx, Yz(4.85), 0.22 * sx, 0, 6.3); g.fill();
    g.fillStyle = '#4b3424'; g.fillRect(cx - 0.78 * sx, Yz(4.5), 1.56 * sx, Yz(0.35) - Yz(4.5));
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(cx - 1, Yz(4.5), 2, Yz(0.35) - Yz(4.5));
    // lábazat, párkány a kapu fölött
    g.fillStyle = '#9a8e78'; g.fillRect(0, Yz(0.35), w, h - Yz(0.35));
    g.fillStyle = '#efe5cf'; g.fillRect(0, Yz(9.95), w, 0.18 * sy); g.fillStyle = 'rgba(60,50,38,.4)'; g.fillRect(0, Yz(9.77), w, 0.1 * sy);
    // fülkesor apostolszobrokkal
    for (let i = 0; i < 9; i++) {
      const x = X(0.35 + i * 0.52), nw = 0.4 * sx;
      g.fillStyle = '#7d705c'; g.beginPath(); g.moveTo(x, Yz(10.1)); g.lineTo(x, Yz(11.0)); g.ellipse(x + nw / 2, Yz(11.0), nw / 2, nw / 2 * sy / sx, 0, Math.PI, 0); g.lineTo(x + nw, Yz(10.1)); g.closePath(); g.fill();
      g.fillStyle = '#e6dcc6'; g.beginPath(); g.ellipse(x + nw / 2, Yz(10.55), nw * 0.28, 0.42 * sy, 0, 0, 6.3); g.fill();
      g.beginPath(); g.arc(x + nw / 2, Yz(11.08), nw * 0.15, 0, 6.3); g.fill();
    }
    g.fillStyle = '#efe5cf'; g.fillRect(0, Yz(11.5), w, 0.16 * sy);
    // orom: középen Krisztus fülkéje, mellette két angyal
    g.fillStyle = '#7d705c'; g.beginPath(); g.moveTo(X(2.35), Yz(11.8)); g.lineTo(X(2.35), Yz(13.2)); g.ellipse(cx, Yz(13.2), 0.35 * sx, 0.35 * sy, 0, Math.PI, 0); g.lineTo(X(3.05), Yz(11.8)); g.closePath(); g.fill();
    g.fillStyle = '#e8dec8'; g.beginPath(); g.ellipse(cx, Yz(12.4), 0.2 * sx, 0.55 * sy, 0, 0, 6.3); g.fill(); g.beginPath(); g.arc(cx, Yz(13.15), 0.11 * sx, 0, 6.3); g.fill();
    for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(cx + sg * 1.0 * sx, Yz(12.2), 0.14 * sx, 0.38 * sy, 0, 0, 6.3); g.fill(); g.beginPath(); g.arc(cx + sg * 1.0 * sx, Yz(12.7), 0.09 * sx, 0, 6.3); g.fill(); }
    g.restore();
  }, true);
  function landmarkMesh(L, Y0, mats) {
    if (!mats.lm) {
      const mk = (tex, rep, color, extra) => { if (tex) { tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.anisotropy = 8; } const m = new T.MeshStandardMaterial({ map: tex || null, color: color != null ? color : 0xffffff, roughness: 0.92, side: T.DoubleSide, envMapIntensity: 0.5, ...(extra || {}) }); m.userData.rep = rep; return m; };
      const stone = stoneTex([214, 201, 174], '#9c907a');
      mats.lm = {
        stone: mk(stone, [1 / 4, 1 / 4]), ledge: mk(stone, [1 / 4, 1 / 4], 0xd6cfc2),
        light: mk(stoneTex([226, 218, 198], '#a99f8c'), [1 / 4, 1 / 4]),
        spire: mk(stoneTex([222, 188, 153], '#9c8462'), [1 / 2.5, 1 / 2.5]),
        tiles: mk(roofTexNeutral(), [1 / 3.2, 1 / 1.4], lin(0xa4613f)), chapTiles: mk(roofTexNeutral(), [1 / 3.2, 1 / 1.4], lin(0x8b4513)),
        frieze: mk(friezeTex(), [1 / 4, 1]), portal: mk(portalTex(), [1, 1]), plaster: mk(plasterTex(), [1 / 3, 1 / 3], 0xf2eee6),
        win: mk(null, [1, 1], lin(0x2a2420), { roughness: 0.7 }), cross: mk(null, [1, 1], lin(0x6c5a38), { metalness: 0.6, roughness: 0.4 })
      };
      mats.lm.portal.map.wrapS = mats.lm.portal.map.wrapT = T.ClampToEdgeWrapping;
    }
    const M = mats.lm, buf = new Map(), grp = new T.Group();
    const P = (s, t, z) => [L.x0 + s * L.u[0] + t * L.v[0], Y0 + z, -(L.y0 + s * L.u[1] + t * L.v[1])];
    const tri = (m, a, b, c, ua, ub, uc) => { if (!buf.has(m)) buf.set(m, { p: [], uv: [] }); const B = buf.get(m), [ru, rv] = m.userData.rep; B.p.push(...a, ...b, ...c); for (const q of [ua, ub, uc]) B.uv.push(q[0] * ru, q[1] * rv); };
    const quad = (m, a, b, c, d, ua, ub, uc, ud) => { tri(m, a, b, c, ua, ub, uc); tri(m, a, c, d, ua, uc, ud); };
    // függőleges fal a templom (s, t) pontjai között, z0 és z1 között (n: kifelé tolás méterben)
    const wall = (m, s0, t0, s1, t1, z0, z1, n = 0, ns = 0, nt = 0) => {
      const Lw = Math.hypot(s1 - s0, t1 - t0);
      quad(m, P(s0 + ns * n, t0 + nt * n, z0), P(s1 + ns * n, t1 + nt * n, z0), P(s1 + ns * n, t1 + nt * n, z1), P(s0 + ns * n, t0 + nt * n, z1), [0, z0], [Lw, z0], [Lw, z1], [0, z1]);
    };
    // íves ablak (vagy ikerablak) a fal síkjában: a fal egy pontja (s, t), iránya (ws, wt), kifelé mutató normálisa (ns, nt)
    const arch = (s, t, ws, wt, ns, nt, z, wdt, hgt) => {
      const r = wdt / 2, pts = [[-r, 0], [r, 0]];
      for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; pts.push([r * Math.cos(a), hgt - r + r * Math.sin(a)]); }
      const at = ([x, y]) => P(s + ws * x + ns * 0.04, t + wt * x + nt * 0.04, z + y), c = at([0, (hgt - r) / 2]);
      const ring = [[-r, 0], [r, 0], ...pts.slice(2)].concat([[-r, 0]]);
      const ord = [[r, 0], ...pts.slice(2), [-r, 0]];
      for (let i = 0; i < ord.length - 1; i++) tri(M.win, c, at(ord[i]), at(ord[i + 1]), [0, 0], [0, 0], [0, 0]);
      tri(M.win, c, at([-r, 0]), at([r, 0]), [0, 0], [0, 0], [0, 0]);
      void ring;
    };
    const faces = p => [   // [kezdő s, t, záró s, t, a fal iránya, kifelé mutató normális]
      [p.s0, p.t0, p.s1, p.t0, 1, 0, 0, -1], [p.s1, p.t1, p.s0, p.t1, -1, 0, 0, 1], [p.s0, p.t1, p.s0, p.t0, 0, -1, -1, 0], [p.s1, p.t0, p.s1, p.t1, 0, 1, 1, 0]];
    const ZB = -4;   // a falak a talaj alá nyúlnak (lejtős terep)
    for (const p of L.lm.parts) {
      if (p.k === 'box') {
        const wm = p.mat === 'sacristy' ? M.light : M.stone, rm = p.mat === 'tower' ? M.spire : p.mat === 'portal' ? M.spire : M.tiles;
        const sm = (p.s0 + p.s1) / 2, tm = (p.t0 + p.t1) / 2, hz = (s, t) => { let h = p.eave; const hw = (p.t1 - p.t0) / 2, hs = (p.s1 - p.s0) / 2, rh = p.top - p.eave;
          if (p.roof === 'lean1') h = p.eave + rh * (t - p.t0) / (2 * hw); else if (p.roof === 'lean0') h = p.eave + rh * (p.t1 - t) / (2 * hw); return h; };
        for (const [s0, t0, s1, t1, ws, wt, ns, nt] of faces(p)) {
          const z0 = hz(s0, t0), z1 = hz(s1, t1);
          if (p.mat === 'portal' && ns === -1) {   // a kapuzat homlokzata (ötszög) a kapuzat képével
            const U = (t, z) => [(t - p.t0) / 5.4, Math.max(0, z) / 15.5];
            quad(M.portal, P(s0, t0, ZB), P(s1, t1, ZB), P(s1, t1, p.eave), P(s0, t0, p.eave), U(t0, 0), U(t1, 0), U(t1, p.eave), U(t0, p.eave));
            tri(M.portal, P(s0, t0, p.eave), P(s1, t1, p.eave), P(sm, tm, p.top), U(t0, p.eave), U(t1, p.eave), U(tm, p.top));
            continue;
          }
          const Lw = Math.hypot(s1 - s0, t1 - t0);
          quad(wm, P(s0, t0, ZB), P(s1, t1, ZB), P(s1, t1, z1), P(s0, t0, z0), [0, ZB], [Lw, ZB], [Lw, z1], [0, z0]);
          if (p.roof === 'gable' && ns !== 0) tri(wm, P(s0, t0, p.eave), P(s1, t1, p.eave), P(sm, tm, p.top), [0, p.eave], [Lw, p.eave], [Lw / 2, p.top]);
          // díszítés
          if (p.mat === 'tower') {
            for (const zc of [7.5, 13.5, 19]) wall(M.ledge, s0, t0, s1, t1, zc, zc + 0.35, 0.12, ns, nt);
            wall(M.frieze, s0, t0, s1, t1, 22.9, 23.75, 0.06, ns, nt); wall(M.ledge, s0, t0, s1, t1, 23.75, 24, 0.22, ns, nt);
            const ms = (s0 + s1) / 2, mt = (t0 + t1) / 2;
            arch(ms, mt, ws, wt, ns, nt, 9.6, 0.32, 1.6); arch(ms, mt, ws, wt, ns, nt, 15.2, 0.4, 1.9);
            for (const sg of [-1, 1]) arch(ms + ws * sg * 0.55, mt + wt * sg * 0.55, ws, wt, ns, nt, 20.1, 0.62, 2.1);
          } else if (p.mat === 'nave' && nt !== 0) {
            for (let s = 9; s < 28; s += 4) arch(s, nt > 0 ? p.t1 : p.t0, ws, wt, ns, nt, 12.1, 0.7, 1.7);
            wall(M.frieze, s0, t0, s1, t1, 13.9, 14.5, 0.05, ns, nt);
          } else if (p.mat === 'nave' && ns === 1) {
            wall(M.frieze, s0, t0, s1, t1, 13.9, 14.5, 0.05, ns, nt);
          } else if (p.mat === 'aisle' && ((p.roof === 'lean1' && nt === -1) || (p.roof === 'lean0' && nt === 1))) {
            for (let s = 9.5; s < 28; s += 4) arch(s, nt > 0 ? p.t1 : p.t0, ws, wt, ns, nt, 3.6, 0.6, 1.7);
            wall(M.frieze, s0, t0, s1, t1, 7.45, 8, 0.05, ns, nt);
          } else if (p.mat === 'sacristy') arch((s0 + s1) / 2, (t0 + t1) / 2, ws, wt, ns, nt, 2.6, 0.6, 1.4);
        }
        // tető
        const c = [P(p.s0, p.t0, hz(p.s0, p.t0)), P(p.s1, p.t0, hz(p.s1, p.t0)), P(p.s1, p.t1, hz(p.s1, p.t1)), P(p.s0, p.t1, hz(p.s0, p.t1))];
        const Ls = p.s1 - p.s0, Lt = p.t1 - p.t0;
        if (p.roof === 'pyr') {
          const apex = P(sm, tm, p.top), sl = Math.hypot(Math.max(Ls, Lt) / 2, p.top - p.eave);
          for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4], e = i % 2 ? Lt : Ls; tri(rm, a, b, apex, [0, 0], [e, 0], [e / 2, sl]); }
          if (p.mat === 'tower') {   // kereszt a sisak csúcsán
            const k = (s0, s1, t0, t1, z0, z1) => { for (const [a0, b0, a1, b1] of [[s0, t0, s1, t0], [s1, t0, s1, t1], [s1, t1, s0, t1], [s0, t1, s0, t0]]) wall(M.cross, a0, b0, a1, b1, z0, z1); };
            k(sm - 0.06, sm + 0.06, tm - 0.06, tm + 0.06, p.top - 0.2, p.top + 1.6); k(sm - 0.06, sm + 0.06, tm - 0.45, tm + 0.45, p.top + 0.95, p.top + 1.1);
          }
        } else if (p.roof === 'gable') {
          const r0 = P(p.s0, tm, p.top), r1 = P(p.s1, tm, p.top), sl = Math.hypot(Lt / 2, p.top - p.eave);
          quad(rm, c[0], c[1], r1, r0, [0, 0], [Ls, 0], [Ls, sl], [0, sl]); quad(rm, c[3], c[2], r1, r0, [0, 0], [Ls, 0], [Ls, sl], [0, sl]);
        } else {
          const sl = Math.hypot(Lt, p.top - p.eave);
          quad(rm, c[0], c[1], c[2], c[3], [0, 0], [Ls, 0], [Ls, sl], [0, sl]);
        }
        if (p.mat === 'nave') { const rs = P(1.75, tm, 17.6); void rs; arch(1.78, tm, 0, 1, -1, 0, 16.6, 1.3, 1.6); }   // kerek ablak a nyugati oromfalon
      } else if (p.k === 'apse') {
        const N = 18, rim = [];
        for (let i = 0; i <= N; i++) { const a = -Math.PI / 2 + i / N * Math.PI; rim.push([p.sc + p.r * Math.cos(a), p.tc + p.r * Math.sin(a)]); }
        if (p.sc > p.s0) { wall(M.stone, p.s0, p.tc - p.r, p.sc, p.tc - p.r, ZB, p.eave); wall(M.stone, p.sc, p.tc + p.r, p.s0, p.tc + p.r, ZB, p.eave); }
        let along = 0;
        for (let i = 0; i < N; i++) {
          const [a0, b0] = rim[i], [a1, b1] = rim[i + 1], Lw = Math.hypot(a1 - a0, b1 - b0);
          quad(M.stone, P(a0, b0, ZB), P(a1, b1, ZB), P(a1, b1, p.eave), P(a0, b0, p.eave), [along, ZB], [along + Lw, ZB], [along + Lw, p.eave], [along, p.eave]);
          const ns = (a0 + a1) / 2 - p.sc, nt = (b0 + b1) / 2 - p.tc, nl = Math.hypot(ns, nt);
          wall(M.frieze, a0, b0, a1, b1, p.eave - (p.r > 3 ? 0.7 : 0.45), p.eave, 0.05, ns / nl, nt / nl);
          if (p.r > 3 && i % 3 === 1) wall(M.ledge, a0 + (a1 - a0) * 0.42, b0 + (b1 - b0) * 0.42, a0 + (a1 - a0) * 0.58, b0 + (b1 - b0) * 0.58, 0.6, p.eave - 0.7, 0.1, ns / nl, nt / nl);   // féloszlopok
          if (p.r > 3 && (i === 4 || i === 9 || i === 13)) arch((a0 + a1) / 2, (b0 + b1) / 2, (a1 - a0) / Lw, (b1 - b0) / Lw, ns / nl, nt / nl, 5.2, 0.7, 2.0);
          along += Lw;
        }
        // tető: az egyenes szakaszon kétoldalt lejt, a félkörön félkúp
        const ap = P(p.sc, p.tc, p.top), sl = Math.hypot(p.r, p.top - p.eave);
        if (p.sc > p.s0) { const r0 = P(p.s0, p.tc, p.top), l = p.sc - p.s0; quad(M.tiles, P(p.s0, p.tc - p.r, p.eave), P(p.sc, p.tc - p.r, p.eave), ap, r0, [0, 0], [l, 0], [l, sl], [0, sl]); quad(M.tiles, P(p.s0, p.tc + p.r, p.eave), P(p.sc, p.tc + p.r, p.eave), ap, r0, [0, 0], [l, 0], [l, sl], [0, sl]); }
        for (let i = 0; i < N; i++) { const [a0, b0] = rim[i], [a1, b1] = rim[i + 1], u0 = i / N * Math.PI * p.r, u1 = (i + 1) / N * Math.PI * p.r; tri(M.tiles, P(a0, b0, p.eave), P(a1, b1, p.eave), ap, [u0, 0], [u1, 0], [(u0 + u1) / 2, sl]); }
      } else if (p.k === 'quatre') {
        const N = 64; let along = 0;
        for (let i = 0; i < N; i++) {
          const th0 = i / N * 2 * Math.PI, th1 = (i + 1) / N * 2 * Math.PI, R0 = quatreR(p, th0), R1 = quatreR(p, th1);
          const a0 = p.sc + R0 * Math.cos(th0), b0 = p.tc + R0 * Math.sin(th0), a1 = p.sc + R1 * Math.cos(th1), b1 = p.tc + R1 * Math.sin(th1), Lw = Math.hypot(a1 - a0, b1 - b0);
          quad(M.light, P(a0, b0, ZB), P(a1, b1, ZB), P(a1, b1, p.eave), P(a0, b0, p.eave), [along, ZB], [along + Lw, ZB], [along + Lw, p.eave], [along, p.eave]);
          const ns = Math.cos((th0 + th1) / 2), nt = Math.sin((th0 + th1) / 2);
          wall(M.frieze, a0, b0, a1, b1, p.eave - 0.5, p.eave, 0.04, ns, nt);
          if (i % 16 === 0) arch((a0 + a1) / 2, (b0 + b1) / 2, (a1 - a0) / Lw, (b1 - b0) / Lw, ns, nt, 4.6, 0.55, 1.5);
          along += Lw;
        }
      } else if (p.k === 'cone') {
        const N = 32, ap = P(p.sc, p.tc, p.z1), sl = Math.hypot(p.r, p.z1 - p.z0), m = M.chapTiles;
        for (let i = 0; i < N; i++) { const a0 = i / N * 2 * Math.PI, a1 = (i + 1) / N * 2 * Math.PI, u0 = a0 * p.r, u1 = a1 * p.r; tri(m, P(p.sc + p.r * Math.cos(a0), p.tc + p.r * Math.sin(a0), p.z0), P(p.sc + p.r * Math.cos(a1), p.tc + p.r * Math.sin(a1), p.z0), ap, [u0, 0], [u1, 0], [(u0 + u1) / 2, sl]); }
      } else if (p.k === 'cyl') {   // a kápolna lámpása: nyolcszögű, vakolt, kis ablakokkal; a kúpos tetőből indul
        const N = 8, z0 = 12.5;
        for (let i = 0; i < N; i++) {
          const a0 = (i + 0.5) / N * 2 * Math.PI, a1 = (i + 1.5) / N * 2 * Math.PI, A = [p.sc + p.r * Math.cos(a0), p.tc + p.r * Math.sin(a0)], B = [p.sc + p.r * Math.cos(a1), p.tc + p.r * Math.sin(a1)];
          wall(M.plaster, A[0], A[1], B[0], B[1], z0, p.z1);
          if (i % 2 === 0) { const ns = Math.cos((a0 + a1) / 2), nt = Math.sin((a0 + a1) / 2), Lw = Math.hypot(B[0] - A[0], B[1] - A[1]); arch((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (B[0] - A[0]) / Lw, (B[1] - A[1]) / Lw, ns, nt, 14.8, 0.35, 0.9); }
        }
        tri(M.plaster, P(p.sc, p.tc, p.z1), P(p.sc, p.tc, p.z1), P(p.sc, p.tc, p.z1), [0, 0], [0, 0], [0, 0]);
      } else if (p.k === 'onion') {   // hagymasisak (forgástest; a felső fele a magasságmező), rajta kereszt
        const prof = [[0, 0], [0.5, 0], [0.55, 0.05], [0.9, 0.2], ...ONION_TOP.slice().reverse()], N = 16, Hh = p.z1 - p.z0;
        for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < N; i++) {
          const a0 = i / N * 2 * Math.PI, a1 = (i + 1) / N * 2 * Math.PI, [q0, y0] = prof[j], [q1, y1] = prof[j + 1];
          const pt = (q, y, a) => P(p.sc + p.r * q * Math.cos(a), p.tc + p.r * q * Math.sin(a), p.z0 + Hh * y);
          quad(M.chapTiles, pt(q0, y0, a0), pt(q0, y0, a1), pt(q1, y1, a1), pt(q1, y1, a0), [i / N, y0], [(i + 1) / N, y0], [(i + 1) / N, y1], [i / N, y1]);
        }
        const k = (s0, s1, t0, t1, z0, z1) => { for (const [a0, b0, a1, b1] of [[s0, t0, s1, t0], [s1, t0, s1, t1], [s1, t1, s0, t1], [s0, t1, s0, t0]]) wall(M.cross, a0, b0, a1, b1, z0, z1); };
        k(p.sc - 0.04, p.sc + 0.04, p.tc - 0.04, p.tc + 0.04, p.z1 - 0.1, p.z1 + 1.0); k(p.sc - 0.04, p.sc + 0.04, p.tc - 0.3, p.tc + 0.3, p.z1 + 0.6, p.z1 + 0.7);
      }
    }
    for (const [m, B] of buf) {
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(B.p, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(B.uv, 2)); geo.computeVertexNormals();
      const mesh = new T.Mesh(geo, m); mesh.frustumCulled = false; grp.add(mesh);
    }
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
    // fás területek anyagai: foltos lomb (nyár), lombtalan ágszövet (tél): az erdő belseje sűrű, a magányos fák,
    // fasorok és erdőszélek ritkás ágai között átlátszik (a számításban ezek télen nem takarnak)
    mats.forest = new T.MeshStandardMaterial({ map: mats.core.map, roughness: 1, envMapIntensity: 0.4 });
    const tw1 = twigTex(true), tw2 = twigTex(false); tw1.wrapS = tw1.wrapT = tw2.wrapS = tw2.wrapT = T.RepeatWrapping; tw1.repeat.set(4, 2); tw2.repeat.set(3, 2);
    mats.bare = new T.MeshStandardMaterial({ map: tw1, color: 0xe2dcd6, roughness: 1, envMapIntensity: 0.35 });
    // a ritkás ágak messziről lágy, szürkésbarna fátyolnak látszanak (a textúra kicsinyített szintjei átlagolják)
    mats.bareThin = new T.MeshStandardMaterial({ map: tw2, color: 0xe2dcd6, roughness: 1, envMapIntensity: 0.35, transparent: true, alphaTest: 0.02, side: T.DoubleSide, depthWrite: false });
    // valós épületek anyagai (méterarányos UV-vel)
    mats.bWall = metricUV(new T.MeshStandardMaterial({ map: facadeTex(), roughness: 0.92 }), false);
    mats.bGable = metricUV(new T.MeshStandardMaterial({ map: plasterTex(), roughness: 0.92 }), false);
    mats.bRoof = metricUV(new T.MeshStandardMaterial({ map: roofTexNeutral(), roughness: 0.75 }), true);
    mats.bRidge = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    mats.bFascia = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    mats.bChim = new T.MeshStandardMaterial({ map: plasterTex(), color: 0xffffff, roughness: 0.95 });
    mats.trunk = new T.MeshStandardMaterial({ color: lin(0x5f554c), roughness: 0.95 });   // távoli törzsek: árnyékos, sötét kéreg
    mats.blob.map = canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(20,28,14,.5)'); gr.addColorStop(1, 'rgba(20,28,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    mats.blobThin = mats.blob.clone(); mats.blobThin.opacity = 0.35;
    const objGroup = new T.Group(), turbGroup = new T.Group(), ghostGroup = new T.Group(), bldGroup = new T.Group(), forGroup = new T.Group(), lmGroup = new T.Group();
    scene.add(objGroup, bldGroup, forGroup, lmGroup, turbGroup, ghostGroup);
    let bKey = '', hlId = null, nKey = '', fKey = '', lKey = '';
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
        sun.position.copy(sunDir).multiplyScalar(1000); SUN.x = sunDir.x; SUN.y = sunDir.y; SUN.z = sunDir.z;
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
      // közeli légifotó a terepen: canvas (észak felül) és a lefedett négyzet helyi méterben [nyugat, dél, kelet, észak]; null: nincs
      setNearSat(canvas, box, key) {
        if (key === nKey) return; nKey = key;
        if (tMat.uniforms.sat2.value) { tMat.uniforms.sat2.value.dispose(); tMat.uniforms.sat2.value = null; }
        tMat.uniforms.hasSat2.value = canvas ? 1 : 0;
        if (!canvas) return;
        const t = new T.CanvasTexture(canvas); t.anisotropy = 8; t.minFilter = T.LinearMipmapLinearFilter;
        tMat.uniforms.sat2.value = t; tMat.uniforms.box2.value.set(box[0], box[1], box[2], box[3]);
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
        const h = hlId; hlId = null; api.highlightBuilding(h);
      },
      // műemlékek: [{ lm (részek), x0, y0, u, v (a templom helye és tengelyei helyi méterben), Y0 (talajszint a szemhez képest) }]
      setLandmarks(list, key) {
        if (key === lKey) return; lKey = key;
        lmGroup.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); lmGroup.clear();
        for (const L of list) lmGroup.add(landmarkMesh(L, L.Y0, mats));
      },
      // fák és erdők: [{ x, y (helyi m), H, R, ry, card, seed, kind, solid }] (lásd forestTrees)
      setForest(list, key, groundY, winter) {
        if (key === fKey) return; fKey = key;
        forGroup.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
        forGroup.clear();
        if (list.length) forGroup.add(forestTrees(list, groundY, winter, mats));
      },
      // a képre kattintva: melyik valós épületet találja (CSS-képpont a kép bal felső sarkától), vagy null
      pickBuilding(x, y, w, h) {
        const rc = new T.Raycaster(); rc.setFromCamera(new T.Vector2(x / w * 2 - 1, 1 - y / h * 2), cam);
        const meshes = []; bldGroup.traverse(o => { if (o.isInstancedMesh && o.userData.ids) meshes.push(o); });
        const hit = rc.intersectObjects(meshes, false).find(i => i.instanceId != null && i.instanceId < i.object.count);
        return hit ? hit.object.userData.ids[hit.instanceId] : null;
      },
      // a kiválasztott épület kiemelése (világoskék), null: nincs kiemelés
      highlightBuilding(id) {
        const parts = bldGroup.children[0] && bldGroup.children[0].userData.parts, c = new T.Color(), touched = new Set();
        if (!parts) { hlId = id; return; }
        const paint = (pid, on) => (parts.get(pid) || []).forEach(([im, k, col]) => { c.set(on ? HILITE : col).convertSRGBToLinear(); im.setColorAt(k, c); touched.add(im); });
        if (hlId != null) paint(hlId, false);
        hlId = id; if (id != null) paint(id, true);
        touched.forEach(im => { im.instanceColor.needsUpdate = true; });
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
        const gv = ghostGroup.visible, vis = v => { objGroup.visible = bldGroup.visible = forGroup.visible = lmGroup.visible = sky.visible = v; if (terrain) terrain.visible = v; };
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
      // ellenőrzéshez: a turbinák valódi térbeli pontjai (helyi m: x kelet, y észak, z a szem fölött)
      debugTurbines() {
        const v = new T.Vector3(), w = p => [+p.x.toFixed(3), +(-p.z).toFixed(3), +p.y.toFixed(3)];
        scene.updateMatrixWorld(true);
        return turbs.map(t => {
          const g = t.g, rot = g.userData.rotor, R = g.userData.R;
          const blades = rot.children.filter(c => c.geometry && c.geometry.attributes.position.count > 60);
          return { base: w(g.getWorldPosition(new T.Vector3())), hub: w(rot.getWorldPosition(new T.Vector3())), R, hubH: g.userData.hub,
                   tips: blades.map(b => w(b.localToWorld(v.set(0, R, 0)).clone())) };
        });
      },
      // ellenőrzéshez: mindig látszó, tiszta bíbor gömbök ismert helyeken (helyi m), null: törlés
      testMarkers(list) {
        if (api._mk) { scene.remove(api._mk); api._mk = null; }
        if (!list) return;
        const g = new T.Group(), mat = new T.MeshBasicMaterial({ color: 0xff00ff, depthTest: false, toneMapped: false, fog: false });
        for (const [x, y, z, r] of list) { const s = new T.Mesh(new T.SphereGeometry(r, 24, 16), mat); s.position.set(x, z, -y); s.renderOrder = 99; g.add(s); }
        scene.add(g); api._mk = g;
      },
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
    loadTex('level_tolgy.png', true, false, t => {
      mats.leaf.map = t; mats.leaf.needsUpdate = true;
      // távoli lombtömb: a levélfotóból összerakott, tömör (lyukmentes) lombminta
      if (t.image && t.image.width) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
        g.fillStyle = '#34502a'; g.fillRect(0, 0, 512, 512);
        for (let k = 0; k < 90; k++) {
          const s = 70 + rnd(k + 300) * 70, x = rnd(k + 100) * 512, y = rnd(k + 200) * 512;
          g.save(); g.translate(x, y); g.rotate(rnd(k + 400) * 6.28); g.globalAlpha = 0.75 + rnd(k) * 0.25;
          for (const [dx, dy] of [[0, 0], [-512, 0], [512, 0], [0, -512], [0, 512]]) g.drawImage(t.image, dx - s / 2, dy - s / 2, s, s);
          g.restore();
        }
        const ct = new T.CanvasTexture(cv); ct.encoding = T.sRGBEncoding; ct.wrapS = ct.wrapT = T.RepeatWrapping; ct.repeat.set(5, 2); ct.anisotropy = 8;
        mats.forest.map = ct; mats.forest.color = lin(0xd6dccb); mats.forest.needsUpdate = true;
      }
    });
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
