/* RealView – fotorealisztikus látkép WebGL-lel (three.js r128).
   Közös motor az index.html és az alap.html számára; a tools/inline_realview.py másolja be őket.
   Koordináták: helyi síkkoordináták (x kelet, y észak, méter) → three.js: X = x, Y = magasság a szemhez képest, Z = −y.
   A kamera a szemmagasságban, az origóban áll. A Föld görbületét a hívó számolja bele a magasságokba. */
window.RealView = (function () {
  'use strict';
  const T = window.THREE;
  if (!T) return null;
  const RAD = Math.PI / 180;
  const rnd = s => { let x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; }
    t.anisotropy = 8; return t;
  }
  // fű (közeli részletesség): zöld zaj, átlaga ~1 körül szorzóként
  const grassTex = () => canvasTex(256, 256, (g, w, h) => {
    const im = g.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const x = i % w, y = (i / w) | 0, n = rnd(i * 1.7) * 0.6 + rnd(((x >> 2) + (y >> 2) * 97) * 3.1) * 0.4;
      const v = 150 + n * 105; im.data[i * 4] = v * 0.92; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v * 0.78; im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }, true);
  // táblás mezőgazdasági táj (ha nincs műholdkép): 4×4 km-es ismétlődő minta
  const fieldTex = () => canvasTex(1024, 1024, (g, w, h) => {
    const cols = ['#7f9b4a', '#9aa956', '#b9aa6a', '#6f8f43', '#c8b47a', '#5f8340', '#a59a5c', '#86a04f'];
    g.fillStyle = '#7d9550'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) {
      const x = rnd(k) * w, y = rnd(k + 300) * h, fw = 40 + rnd(k + 600) * 150, fh = 25 + rnd(k + 900) * 110, a = (rnd(k + 1200) - 0.5) * 0.5;
      g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = cols[(rnd(k + 1500) * cols.length) | 0]; g.fillRect(-fw / 2, -fh / 2, fw, fh);
      g.globalAlpha = 0.18; g.strokeStyle = '#3b4a25'; g.lineWidth = 1.2; g.strokeRect(-fw / 2, -fh / 2, fw, fh); g.restore();
    }
    for (let k = 0; k < 18; k++) { // erdőfoltok
      g.fillStyle = '#3e5a2c'; g.beginPath(); const x = rnd(k + 2000) * w, y = rnd(k + 2100) * h;
      for (let a = 0; a < 6.3; a += 0.5) { const r = 25 + rnd(k * 7 + a) * 40; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.fill();
    }
  }, true);
  const windowTex = () => canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#d9d4c8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9c3b5'; g.fillRect(0, h - 6, w, 6);
    g.fillStyle = '#4d5d70'; g.fillRect(30, 34, 68, 56);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(30, 34, 68, 10);
    g.fillStyle = '#b8b1a2'; g.fillRect(62, 34, 4, 56);
  }, true);
  const roofTex = () => canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#8f4330'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, w, 2); }
  }, true);

  /* ---------- Ég: színátmenet, napkorong, felhők ---------- */
  function skyMaterial() {
    return new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false,
      uniforms: { sunDir: { value: new T.Vector3() }, zen: { value: new T.Color(0x3b74c4) }, hor: { value: new T.Color(0xc4d5e4) }, fogCol: { value: new T.Color(0xc9d6e1) }, clouds: { value: 1 } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }',
      fragmentShader: `
        varying vec3 vDir; uniform vec3 sunDir, zen, hor, fogCol; uniform float clouds;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
          return mix(mix(h(i), h(i+vec2(1,0)), u.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), u.x), u.y); }
        float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a*n(p); p = p*2.03 + 7.1; a *= .5; } return s; }
        void main(){
          vec3 d = normalize(vDir);
          float el = d.y;
          vec3 col = mix(hor, zen, pow(clamp(el, 0., 1.), .5));
          float s = max(dot(d, sunDir), 0.);
          col += vec3(1., .93, .8) * (pow(s, 900.) * 6. + pow(s, 40.) * .25 + pow(s, 6.) * .08);
          if (el > 0.004 && clouds > .5) {
            vec2 p = d.xz / (el + .06) * 1.6;
            float c = fbm(p * .9 + vec2(3.,1.));
            c = smoothstep(.52, .8, c) * smoothstep(.004, .1, el);
            vec3 cc = mix(vec3(.78,.8,.84), vec3(1.), .5 + .5 * s) ;
            col = mix(col, cc, c * .85);
          }
          col = mix(col, fogCol, smoothstep(.06, -.01, el));
          gl_FragColor = vec4(col, 1.);
        }`
    });
  }

  /* ---------- Terep (sugárirányú háló a látómezőben) ---------- */
  function terrainMaterial(tex) {
    return new T.ShaderMaterial({
      uniforms: {
        sat: { value: null }, hasSat: { value: 0 }, grass: { value: tex.grass }, fields: { value: tex.fields },
        sunDir: { value: new T.Vector3() }, fogCol: { value: new T.Color(0xc9d6e1) }, fogDen: { value: 1 / 21000 },
        skyAmb: { value: new T.Color(0x9fb4cf) }, gndAmb: { value: new T.Color(0x6e6a55) }, sunCol: { value: new T.Color(0xfff1d8) }
      },
      vertexShader: `
        varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        void main(){ vN = normal; vW = position; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        uniform sampler2D sat, grass, fields; uniform float hasSat, fogDen; uniform vec3 sunDir, fogCol, skyAmb, gndAmb, sunCol;
        varying vec3 vN; varying vec3 vW; varying vec2 vUv;
        void main(){
          float dist = length(vW.xz);
          vec3 base = hasSat > .5 ? texture2D(sat, vUv).rgb * 1.08 : texture2D(fields, vW.xz / 4200.).rgb;
          vec3 g1 = texture2D(grass, vW.xz / 5.).rgb, g2 = texture2D(grass, vW.xz / 37.).rgb;
          float near = 1. - smoothstep(18., 320., dist);
          vec3 grassCol = vec3(.42,.52,.25) * g1 * 1.25;
          base = mix(base * (.75 + .3 * g2), mix(base, grassCol, .55) * (.7 + .4 * g1), near);
          vec3 N = normalize(vN);
          float diff = max(dot(N, sunDir), 0.);
          vec3 col = base * (diff * .95 * sunCol + mix(gndAmb, skyAmb, N.y * .5 + .5) * .62);
          float f = 1. - exp(-pow(dist * fogDen, 2.));
          gl_FragColor = vec4(mix(col, fogCol, f), 1.);
        }`
    });
  }
  // a: középső irány, half: fél nyílásszög (rad), elev(x,y) → Y (a szemhez képest, görbülettel) vagy NaN
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
    for (let i = 0; i < na - 1; i++) for (let j = 0; j < nr - 1; j++) {
      const p = i * nr + j, q = (i + 1) * nr + j;
      idx.push(p, q, p + 1, q, q + 1, p + 1);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }

  /* ---------- Szélturbina ---------- */
  function bladeGeometry(R) {
    const S = [[0.02, 3.2, .95, 18], [0.06, 3.7, .7, 17], [0.2, 4.6, .32, 13], [0.4, 3.8, .24, 8], [0.6, 2.9, .2, 4.5], [0.8, 1.9, .17, 2], [0.95, 1.0, .14, .5], [1.0, .35, .12, 0]];
    const sc = R / 85, M = 12, pos = [], idx = [];
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
    const R = rotor / 2, grp = new T.Group(), parts = [];
    const add = (geo, mat, setup) => { const m = new T.Mesh(geo, mat); setup(m); grp.add(m); parts.push(m); return m; };
    add(new T.CylinderGeometry(2.0, 3.6, hub - 1, 40, 1), mats.white, m => { m.position.y = (hub - 1) / 2; });
    add(new T.CylinderGeometry(3.7, 3.7, 1.2, 40), mats.grey, m => { m.position.y = 0.6; });
    const L = Math.max(10, rotor * 0.11);
    add(new T.BoxGeometry(6.4, 6.6, L), mats.white, m => { m.position.set(0, hub + 0.6, -L / 2 + 2.5); });
    add(new T.BoxGeometry(6.0, 0.6, L * 0.92), mats.grey, m => { m.position.set(0, hub + 4.1, -L / 2 + 2.5); });
    const rot = new T.Group(); rot.position.set(0, hub + 0.4, 4.2); grp.add(rot);
    const sp = new T.Mesh(new T.SphereGeometry(2.9, 28, 18), mats.white); sp.scale.set(1, 1, 1.45); rot.add(sp); parts.push(sp);
    const bg = bladeGeometry(R);
    for (let k = 0; k < 3; k++) { const b = new T.Mesh(bg, mats.blade); b.rotation.z = -k * 2 * Math.PI / 3; b.position.z = 0.6; rot.add(b); parts.push(b); }
    grp.userData.rotor = rot; grp.userData.parts = parts;
    return grp;
  }

  /* ---------- Takarások ---------- */
  // lombkorona: néhány egymásba nyúló gömb (sima árnyalás), egységnyi befoglaló méretre
  const crownGeo = (() => {
    const blobs = [[0, 0, 0, 0.78], [0.42, -0.18, 0.1, 0.56], [-0.4, -0.12, -0.15, 0.58], [0.05, 0.38, -0.05, 0.55], [0.1, -0.2, 0.42, 0.55], [-0.12, -0.15, -0.44, 0.52]];
    const pos = [], nor = [], uv = [], idx = [];
    for (const [bx, by, bz, br] of blobs) {
      const g = new T.SphereGeometry(br, 14, 10), P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, o = pos.length / 3;
      for (let i = 0; i < P.count; i++) { const f = 0.94 + rnd(i * 3.3 + bx * 50) * 0.12; pos.push(P.getX(i) * f + bx, P.getY(i) * f + by, P.getZ(i) * f + bz); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(U.getX(i) * 3, U.getY(i) * 2); }
      for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + o);
    }
    const g = new T.BufferGeometry(), col = [];
    for (let i = 1; i < pos.length; i += 3) { const v = 0.55 + 0.45 * Math.min(1, Math.max(0, (pos[i] + 0.9) / 1.6)); col.push(v, v, v); }
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    return g;
  })();
  // lágy árnyékfolt a tárgyak alatt
  const blobTex = () => canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(20,28,14,.55)'); gr.addColorStop(1, 'rgba(20,28,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const blobGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const leafTex = () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#5d7f3c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 2600; k++) { const x = rnd(k) * w, y = rnd(k + 7e3) * h, r = 2 + rnd(k + 9e3) * 5, v = rnd(k + 11e3);
      g.fillStyle = v < 0.45 ? 'rgba(38,62,26,.55)' : v < 0.8 ? 'rgba(92,128,58,.5)' : 'rgba(150,175,95,.45)'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, rnd(k) * 3, 0, 6.3); g.fill(); }
  }, true);
  const trunkGeo = new T.CylinderGeometry(0.5, 0.75, 1, 7);
  function rowTrees(o, groundY, mats, winter) {
    // o: { kind: 'trees'|'forest'|'bush', x0,y0 (helyi), ex,ey (egységvektor a sor mentén), len, h, depth }
    const sp = o.kind === 'bush' ? 1.6 : o.kind === 'forest' ? 6.5 : 7.5;
    const rows = o.kind === 'forest' ? Math.max(1, Math.round((o.depth || 40) / 7)) : 1;
    const n = Math.min(4000, Math.max(1, Math.round(o.len / sp)) * rows);
    const crowns = new T.InstancedMesh(crownGeo, winter && o.kind !== 'bush' ? mats.bare : winter ? mats.bareBush : mats.leaf, n);
    const blobs = winter ? null : new T.InstancedMesh(blobGeo, mats.blob, n);
    const trunks = o.kind === 'bush' ? null : new T.InstancedMesh(trunkGeo, mats.trunk, n);
    const m4 = new T.Matrix4(), q = new T.Quaternion(), col = new T.Color(); let c = 0;
    const nx = o.ey, ny = -o.ex;
    // o.phase: a rálátás vonalának helye a sor mentén — ott pontosan egy teljes magasságú fa áll
    const ph = o.phase || 0, k0 = Math.ceil((-o.len / 2 - ph) / sp), k1 = Math.floor((o.len / 2 - ph) / sp);
    for (let r = 0; r < rows && c < n; r++) for (let kk = k0; c < n && kk <= k1; kk++, c++) {
      const onLos = kk === 0 && r === 0;
      const s = ph + (kk + (r % 2) * 0.5) * sp + (onLos ? 0 : (rnd(c * 1.3 + o.seed) - 0.5) * sp * 0.4), off = (r - (rows - 1) / 2) * 7 + (onLos ? 0 : (rnd(c * 2.9 + o.seed) - 0.5) * 2);
      const x = o.x0 + o.ex * s + nx * off, y = o.y0 + o.ey * s + ny * off, g = groundY(x, y);
      const hh = onLos ? o.h : o.h * (0.88 + rnd(c * 5.1 + o.seed) * 0.12);
      if (o.kind === 'bush') {
        const rx = 1.1 + rnd(c) * 0.5;
        m4.compose(new T.Vector3(x, g + hh * 0.45, -y), q, new T.Vector3(rx, hh * 0.55, rx));
      } else {
        const ry = hh * 0.41, rx = Math.min(hh * 0.36, sp * 0.95) * (0.85 + rnd(c * 7.7) * 0.3);
        q.setFromAxisAngle(new T.Vector3(0, 1, 0), rnd(c * 4.3) * 6.28);
        m4.compose(new T.Vector3(x, g + hh - ry, -y), q, new T.Vector3(rx, ry, rx * (0.85 + rnd(c * 6.1) * 0.3)));
        q.identity();
        const tm = new T.Matrix4().compose(new T.Vector3(x, g + (hh - ry) / 2, -y), q, new T.Vector3(hh * 0.025 + 0.12, hh - ry, hh * 0.025 + 0.12));
        trunks.setMatrixAt(c, tm);
      }
      crowns.setMatrixAt(c, m4);
      if (blobs) { const br = o.kind === 'bush' ? 3.2 : Math.min(o.h * 0.75, sp * 1.8); blobs.setMatrixAt(c, new T.Matrix4().compose(new T.Vector3(x + 0.6, g + 0.05, -y + 0.4), q, new T.Vector3(br, 1, br))); }
      const v = rnd(c * 9.1 + o.seed);
      col.setRGB(0.85 + v * 0.3, 0.9 + v * 0.2, 0.8 + v * 0.25); crowns.setColorAt(c, col);
    }
    crowns.count = c; if (trunks) trunks.count = c; if (blobs) blobs.count = c;
    const grp = new T.Group(); if (blobs) grp.add(blobs); grp.add(crowns); if (trunks) grp.add(trunks);
    return grp;
  }
  function building(o, groundY, mats) {
    const grp = new T.Group(), g = o.kind === 'hill' ? 0 : groundY(o.x0, o.y0);
    if (o.kind === 'house') {
      const w = o.w, wall = o.h * 0.6, roofH = o.h - wall;
      // négyzetes alaprajz, az oromfal a néző felé néz (a homlokfal a középponttól w/2-re, a gerinc magassága h)
      const walls = new T.Mesh(new T.BoxGeometry(w, wall, w), mats.wall); walls.position.y = wall / 2; grp.add(walls);
      const sh = new T.Shape(); sh.moveTo(-w / 2 - 0.4, 0); sh.lineTo(0, roofH); sh.lineTo(w / 2 + 0.4, 0); sh.lineTo(-w / 2 - 0.4, 0);
      const rg = new T.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }); rg.translate(0, wall, -w / 2);
      grp.add(new T.Mesh(rg, mats.roof));
      for (const sx of [-0.25, 0.25]) { const win = new T.Mesh(new T.PlaneGeometry(1.3, 1.2), mats.glass); win.position.set(sx * w, wall * 0.55, w / 2 + 0.02); grp.add(win); }
      const door = new T.Mesh(new T.PlaneGeometry(1.0, 2.1), mats.trunk); door.position.set(0, 1.05, w / 2 + 0.02); grp.add(door);
      const plinth = new T.Mesh(new T.BoxGeometry(w + 0.1, 0.5, w + 0.1), mats.grey); plinth.position.y = 0.25; grp.add(plinth);
      const blob = new T.Mesh(blobGeo, mats.blob); blob.scale.set(w * 1.9, 1, w * 1.9); blob.position.y = 0.04; grp.add(blob);
    } else if (o.kind === 'block') {
      const tex = mats.windows.clone(); tex.needsUpdate = true; tex.repeat.set(o.w / 3.6, o.h / 3);
      const m = new T.MeshStandardMaterial({ map: tex, roughness: 0.85 });
      const b = new T.Mesh(new T.BoxGeometry(o.w, o.h - 0.6, 13), m); b.position.y = (o.h - 0.6) / 2; grp.add(b);
      const top = new T.Mesh(new T.BoxGeometry(o.w, 0.6, 13), mats.grey); top.position.y = o.h - 0.3; grp.add(top);
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
      const uv = []; for (let k = 0; k < pos.length; k += 3) uv.push(pos[k] / 6, pos[k + 2] / 6); g2.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g2.setIndex(idx); g2.computeVertexNormals();
      const m = new T.Mesh(g2, mats.hill); grp.add(m);
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
  function create(holder) {
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true }); }
    catch (e) { return null; }
    if (!renderer.getContext()) return null;
    renderer.domElement.className = 'rv-gl';
    holder.prepend(renderer.domElement);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 16 / 9, 1, 42000);
    cam.rotation.order = 'YXZ';
    const tex = { grass: grassTex(), fields: fieldTex() };
    const sunDir = new T.Vector3();
    const sky = new T.Mesh(new T.SphereGeometry(38000, 48, 24), skyMaterial()); sky.renderOrder = -10; scene.add(sky);
    const tMat = terrainMaterial(tex);
    let terrain = null;
    const sun = new T.DirectionalLight(0xfff3df, 1.0), hemi = new T.HemisphereLight(0xbcd0e6, 0x6c6650, 0.62);
    scene.add(sun, sun.target, hemi);
    scene.fog = new T.FogExp2(0xc9d6e1, 1 / 21000);
    const mats = {
      white: new T.MeshStandardMaterial({ color: 0xf3f4f1, roughness: 0.45, metalness: 0.05 }),
      blade: new T.MeshStandardMaterial({ color: 0xf6f6f3, roughness: 0.38, metalness: 0.02 }),
      grey: new T.MeshStandardMaterial({ color: 0xb9bdbb, roughness: 0.6 }),
      leaf: new T.MeshStandardMaterial({ map: leafTex(), color: 0xc8d8b8, roughness: 0.95, vertexColors: true }),
      blob: new T.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
      bare: new T.MeshStandardMaterial({ color: 0x6d5f52, roughness: 1, transparent: true, opacity: 0.3, depthWrite: false }),
      bareBush: new T.MeshStandardMaterial({ color: 0x7a6a55, roughness: 1, transparent: true, opacity: 0.45, depthWrite: false }),
      trunk: new T.MeshStandardMaterial({ color: 0x4f4034, roughness: 1 }),
      wall: new T.MeshStandardMaterial({ color: 0xe8dcc3, roughness: 0.9 }),
      roof: new T.MeshStandardMaterial({ map: roofTex(), color: 0xffffff, roughness: 0.8 }),
      glass: new T.MeshStandardMaterial({ color: 0x3d4c5c, roughness: 0.2, metalness: 0.3 }),
      fence: new T.MeshStandardMaterial({ color: 0xa69a88, roughness: 0.95 }),
      grassObj: new T.MeshStandardMaterial({ map: tex.grass, color: 0x7f9a4e, roughness: 1 }),
      hill: new T.MeshStandardMaterial({ map: tex.grass, color: 0x86a052, roughness: 1, side: T.DoubleSide }),
      windows: windowTex(),
      ghost: new T.MeshBasicMaterial({ color: 0xff4f42, transparent: true, opacity: 0.58, depthWrite: false, depthFunc: T.GreaterDepth, fog: false })
    };
    mats.windows.wrapS = mats.windows.wrapT = T.RepeatWrapping;
    const objGroup = new T.Group(), turbGroup = new T.Group(), ghostGroup = new T.Group();
    scene.add(objGroup, turbGroup, ghostGroup);
    let tKey = '', oKey = '', trKey = '', turbs = [], spin = false, raf = 0, t0 = performance.now(), satKey = '';

    const api = {
      ok: true, canvas: renderer.domElement,
      size(w, h, dpr) { renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); cam.aspect = w / h; renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; },
      // nap: azimut és magasság fokban
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
          turbs.push({ g, gh });
        }
      },
      setObstacles(list, key, groundY, winter) {
        const k = key + (winter ? 'w' : 's'); if (k === oKey) return; oKey = k;
        objGroup.traverse(m => { if (m.isMesh && m.material && m.material.map && m.material.map !== mats.roof.map && m.material.map !== tex.grass) m.material.map.dispose(); });
        objGroup.clear();
        for (const o of list) objGroup.add(o.kind === 'trees' || o.kind === 'forest' || o.kind === 'bush' ? rowTrees(o, groundY, mats, winter) : building(o, groundY, mats));
      },
      setView(az, pitch, fovH, w, h) {
        cam.aspect = w / h;
        cam.fov = 2 * Math.atan(Math.tan(fovH * RAD / 2) / cam.aspect) / RAD;
        cam.rotation.set(pitch * RAD, -az * RAD, 0);
        cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      },
      setGhost(on) { ghostGroup.visible = !!on; },
      setRotor(angle) { for (const t of turbs) { t.g.userData.rotor.rotation.z = angle; t.gh.userData.rotor && (t.gh.userData.rotor.rotation.z = angle); } },
      // 1. táj és takarások, 2. a turbinák takart része áttűnve, 3. a turbinák
      render() {
        renderer.autoClear = false; renderer.clear();
        turbGroup.visible = false; const gv = ghostGroup.visible; ghostGroup.visible = false;
        renderer.render(scene, cam);
        if (gv) { objGroup.visible = sky.visible = false; if (terrain) terrain.visible = false; ghostGroup.visible = true; renderer.render(scene, cam); ghostGroup.visible = false; }
        objGroup.visible = sky.visible = true; if (terrain) terrain.visible = true;
        turbGroup.visible = true; objGroup.visible = false; sky.visible = false; if (terrain) terrain.visible = false;
        renderer.render(scene, cam);
        objGroup.visible = sky.visible = true; if (terrain) terrain.visible = true; ghostGroup.visible = gv;
      },
      // helyi (x, y, magasság) → képernyő-képpont (CSS px); null, ha a kamera mögött van
      project(x, y, z, w, h) {
        const v = new T.Vector3(x, z, -y).project(cam);
        if (v.z > 1) return null;
        return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h];
      },
      // azonos emelkedési szögű ív a képen (SVG-/canvas-útvonalhoz pontlista)
      elevCurve(azC, fovH, el, w, h) { const pts = []; for (let i = 0; i <= 24; i++) { const p = api.projectDir(azC - fovH / 2 - 2 + (fovH + 4) * i / 24, el, w, h); if (p) pts.push(p); } return pts; },
      // irány (azimut, emelkedés fokban) → képpont
      projectDir(az, el, w, h) { const r = 1000; return api.project(Math.sin(az * RAD) * Math.cos(el * RAD) * r, Math.cos(az * RAD) * Math.cos(el * RAD) * r, Math.sin(el * RAD) * r, w, h); },
      animate(on, onFrame) {
        spin = on; cancelAnimationFrame(raf);
        if (!on) return;
        const loop = now => { api.setRotor(-(now - t0) / 1000 * 2 * Math.PI * (9 / 60)); api.render(); if (onFrame) onFrame(); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
      },
      fixRotor() { api.setRotor(0); }
    };
    return api;
  }
  return { create };
})();
