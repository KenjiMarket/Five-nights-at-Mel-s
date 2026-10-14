// MIDNIGHT AT MEL'S v2 — fan-made survival horror. No game engine: Canvas 2D + WebAudio only.
const W = 960, H = 540;
const cv = document.getElementById('c'), g = cv.getContext('2d');
cv.width = W * RS; cv.height = H * RS; g.scale(RS, RS);
function fit() { const s = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; }
addEventListener('resize', fit); fit();

// ---------- input ----------
const mouse = { x: 480, y: 270, down: false, target: null }, keys = {};
let HR = { door: null, light: null, win: null, mon: null, drawer: null };
const hit = (r, x, y) => r && x > r[0] && x < r[0] + r[2] && y > r[1] && y < r[1] + r[3];
function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
cv.addEventListener('pointermove', e => { Object.assign(mouse, pos(e)); });
cv.addEventListener('pointerdown', e => { e.preventDefault(); Object.assign(mouse, pos(e)); mouse.down = true; ac(); onDown(mouse.x, mouse.y); });
addEventListener('pointerup', () => { mouse.down = false; mouse.target = null; });
addEventListener('pointercancel', () => { mouse.down = false; mouse.target = null; });
addEventListener('keydown', e => {
  if (st !== 'play') return; const k = e.key.toLowerCase();
  if (k === 'f' && !keys.f) tryFlash(); keys[k] = true;
  if (k === 'c') toggleCam(); if (k === 's') toggleDrawer(); if (k === 'e' || k === 'enter') giveBat();
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ---------- audio (all synthesized) ----------
let AC, humOn = false;
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type = 'sine', v = .15, f2) {
  try { const a = ac(), o = a.createOscillator(), gn = a.createGain(), n = a.currentTime; o.type = type; o.frequency.setValueAtTime(f, n); if (f2) o.frequency.exponentialRampToValueAtTime(f2, n + d); gn.gain.setValueAtTime(v, n); gn.gain.exponentialRampToValueAtTime(.0001, n + d); o.connect(gn).connect(a.destination); o.start(); o.stop(n + d); } catch (e) {}
}
function noise(d, v = .3, lp) {
  try { const a = ac(), b = a.createBuffer(1, Math.max(1, a.sampleRate * d | 0), a.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length); const s = a.createBufferSource(), gn = a.createGain(); gn.gain.value = v; s.buffer = b; if (lp) { const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; s.connect(f).connect(gn); } else s.connect(gn); gn.connect(a.destination); s.start(); } catch (e) {}
}
function hum() {
  if (humOn) return; humOn = true;
  try {
    const a = ac(), o = a.createOscillator(), o2 = a.createOscillator(), gn = a.createGain(); o.frequency.value = 50; o2.frequency.value = 100.6; o2.type = 'sawtooth'; gn.gain.value = .018; o.connect(gn); o2.connect(gn); gn.connect(a.destination); o.start(); o2.start();
    const b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g2 = a.createGain(); s.buffer = b; s.loop = true; f.type = 'lowpass'; f.frequency.value = 220; g2.gain.value = .05; s.connect(f).connect(g2).connect(a.destination); s.start();
  } catch (e) {}
}
const steps = n => { for (let i = 0; i < n; i++) setTimeout(() => { tone(75 + i * 4, .13, 'square', .13); noise(.08, .12, 400); }, i * 230); };
const TUNE = [659, 587, 523, 587, 659, 659, 659, 587, 587, 587, 659, 784, 784];
function jingle() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, .5, 'triangle', .14), i * 420)); }

// ---------- state ----------
let st = 'title', night = +(function () { try { return localStorage.mmNight; } catch (e) { return 1; } })() || 1, tips = 0, T = 0, G = null, M = null, D = null, SX = 0, CAM = 480, VY = 0, GP = null, SCAN = null;
const SHIFT = 300;
const rand = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const inR = (x, y, a, b, w, h) => x > a && x < a + w && y > b && y < b + h;
function clockStr(t) { let m = Math.floor(t / SHIFT * 450 / 10) * 10, h = Math.floor(m / 60), mm = m % 60; return (h === 0 ? 12 : h) + ':' + (mm < 10 ? '0' : '') + mm + ' AM'; }
function save() { try { localStorage.mmNight = night; } catch (e) {} }
function say(t) { if (G) { G.note = t; G.noteT = 3; } }

function newShift() {
  G = { t: 0, power: 100, door: 0, doorHeld: false, lightOff: false, flashOn: false, flashT: 0, lastFlash: -1, dr: false, cam: false, camId: 1, camSw: 0, camOff: 0, rb: 0, out: 0, flash: 0, note: '', noteT: 0, intro: 3.4, drain: tips ? .85 : 1, pdoor: false, plight: false,
    e: {
      sal: { loc: 'kitchen', tm: rand(8, 12), at: false, hold: 0, expo: 0 },
      rusty: { loc: 'parts', tm: rand(10, 16), at: false, flashes: 0, timer: 0, rec: 0 },
      gumbo: { s: 0, tm: rand(10, 16), pat: 0, max: 1, cl: 0 },
      nib: { here: false, tm: rand(14, 22), dark: 0, stay: 0, px: 700, dir: 1 },
      tin: { wind: 100, dead: 0, acc: 0, ni: 0 } } };
  tips = 0; st = 'intro';
}
function toggleDoorKey() {}
function toggleCam() { if (!G || st !== 'play' || G.rb > 0 || G.power <= 0) return; G.cam = !G.cam; G.dr = false; G.camSw = .3; noise(.2, .2); tone(G.cam ? 500 : 300, .1, 'square', .08); }
function toggleDrawer() { if (!G || G.rb > 0 || G.cam || G.power <= 0) return; G.dr = !G.dr; tone(150, .1, 'triangle', .1); noise(.12, .12, 800); }
function giveBat() {
  if (!G.dr || G.cam) return; const gm = G.e.gumbo;
  if (gm.s === 1) { gm.s = 0; gm.tm = rand(14, 22) - night; G.dr = false; tone(880, .1, 'square', .1); setTimeout(() => tone(1175, .2, 'square', .1), 100); setTimeout(() => tone(1568, .25, 'sine', .08), 220); say('Gumbo giggles and crawls away...'); }
  else { tone(200, .1, 'triangle', .08); say('Nobody to give one to.'); }
}
function tryFlash() {
  if (st !== 'play' || G.cam || G.rb > 0 || G.power <= 0) return;
  G.flashT = .22; G.power = Math.max(0, G.power - .12 * G.drain); tone(1600, .03, 'square', .05); noise(.05, .1);
  const r = G.e.rusty;
  if (r.at && G.t - G.lastFlash > .13) {
    r.flashes++; r.rec = .25; r.timer = Math.min(r.timer + .9, 9); noise(.12, .22); tone(900, .1, 'sawtooth', .1, 300);
    if (r.flashes >= 5) { r.at = false; r.loc = 'parts'; r.tm = rand(12, 18); say('The skeleton retreated.'); tone(150, .4, 'sawtooth', .15, 40); }
  }
  G.lastFlash = G.t;
}
function die(who) { st = 'dead'; D = { t: 0, who }; G.cam = false; noise(1.4, .6); tone(110, 1.3, 'sawtooth', .3, 28); setTimeout(() => noise(.8, .5), 300); }

// ---------- gameplay update ----------
function updPlay(dt) {
  const e = G.e; G.t += dt; G.flash = Math.max(0, G.flash - dt); G.noteT -= dt; G.flashT = Math.max(0, G.flashT - dt); G.camSw = Math.max(0, G.camSw - dt); G.camOff = Math.max(0, G.camOff - dt);
  if (G.t >= SHIFT) { st = 'six'; SX = 0; tone(880, 1.5, 'sine', .2); setTimeout(() => tone(1320, 2, 'sine', .2), 300); return; }
  const rebooting = G.rb > 0, dead = G.power <= 0, ctl = !rebooting && !dead && !G.cam;
  G.doorHeld = ctl && ((mouse.down && mouse.target === 'door') || !!keys.a);
  G.lightOff = ctl && ((mouse.down && mouse.target === 'light') || !!keys.l);
  G.flashOn = ctl && ((mouse.down && mouse.target === 'win') || !!keys.f);
  if (G.doorHeld !== G.pdoor) { G.pdoor = G.doorHeld; noise(.25, .25, 700); tone(G.doorHeld ? 90 : 120, .25, 'square', .1); }
  if (G.lightOff !== G.plight) { G.plight = G.lightOff; tone(G.lightOff ? 180 : 260, .06, 'square', .1); noise(.06, .15); }
  G.door += ((G.doorHeld ? 1 : 0) - G.door) * Math.min(1, dt * (G.doorHeld ? 10 : 6));
  if (rebooting) { // Gumbo is in the office: everything is dead
    G.rb -= dt; G.dr = false; G.cam = false;
    if (G.rb <= 0) { G.rb = 0; e.gumbo.s = 0; e.gumbo.tm = rand(15, 22); G.flash = 1; tone(440, .3); say('System rebooted.'); }
    return;
  }
  if (G.power > 0) {
    const u = .06 + (G.lightOff ? 0 : .035) + (G.doorHeld ? .3 : 0) + (G.cam ? .1 : 0) + (G.flashOn ? .22 : 0);
    G.power = Math.max(0, G.power - u * dt * G.drain * (1 + (night - 1) * .3));
    if (G.power <= 0) { G.cam = false; G.dr = false; say('POWER OUT!'); noise(.8, .4); tone(60, 1, 'sawtooth', .2, 20); setTimeout(jingle, 3500); }
  } else { G.out += dt; if (G.out > 11) { die('sal'); return; } }
  const a = 3 + night * 2;
  // --- Sal (door) ---
  const s = e.sal;
  if (!s.at) {
    s.tm -= dt;
    if (s.tm <= 0) { s.tm = rand(6, 10); if (Math.random() * 20 < a) { if (s.loc === 'kitchen') s.loc = 'hall'; else if (s.loc === 'hall') { s.loc = 'door'; s.at = true; s.hold = 0; s.expo = 0; steps(4); say('Footsteps... he is at the door!'); } } }
  } else if (G.door > .9) { s.hold += dt; s.expo = Math.max(0, s.expo - dt * .5); if (s.hold >= 2.4) { s.at = false; s.loc = 'kitchen'; s.tm = rand(9, 15); noise(.25, .35, 500); tone(55, .4, 'square', .2); } }
  else { s.expo += dt; if (s.expo >= 2.3) { die('sal'); return; } }
  // --- Rusty (window) ---
  const r = e.rusty;
  if (!r.at) {
    r.tm -= dt;
    if (r.tm <= 0) { r.tm = rand(7, 12); if (Math.random() * 20 < a) { if (r.loc === 'parts') r.loc = 'dining'; else if (r.loc === 'dining') { r.loc = 'window'; r.at = true; r.flashes = 0; r.timer = Math.max(4.5, 8 - night * .6); tone(300, .5, 'sawtooth', .12, 180); noise(.3, .2); say('Something is at the window! FLASH it!'); } } }
  } else { r.timer -= dt; r.rec = Math.max(0, r.rec - dt); if (r.timer <= 0) { die('rusty'); return; } }
  // --- Gumbo (vent) ---
  const p = e.gumbo;
  if (p.s === 0) { p.tm -= dt; if (p.tm <= 0) { p.s = 1; p.pat = p.max = Math.max(5.5, 10 - night * .7); noise(.4, .25, 900); tone(200, .4, 'square', .1, 100); say('Something is in the vent...'); } }
  else if (p.s === 1) { p.pat -= dt; const f = p.pat / p.max; if (Math.random() < dt * (1.2 + (1 - f) * 3)) tone(rand(450, 750), .08, 'sine', .05 + (1 - f) * .05); if (p.pat <= 0) { p.s = 2; p.cl = 0; G.dr = false; noise(.5, .35, 700); } }
  else if (p.s === 2) { p.cl += dt; if (p.cl >= 2.2) { p.s = 3; G.rb = 15; G.dr = false; G.cam = false; noise(1, .5); tone(60, 1, 'sawtooth', .25, 20); } }
  // --- Nibbles the rat (office) ---
  const n = e.nib;
  if (!n.here) { n.tm -= dt; if (n.tm <= 0) { n.tm = rand(8, 12); if (Math.random() * 20 < a) { n.here = true; n.dark = 0; n.stay = 0; n.px = rand(500, 1700); n.dir = Math.random() < .5 ? -1 : 1; tone(1800, .08, 'sine', .08); say('Squeaking... a rat is in the office! Lights OFF!'); } } }
  else {
    n.stay += dt; if (!G.lightOff) { n.px += n.dir * 110 * dt; if (n.px < 300) n.dir = 1; if (n.px > 1900) n.dir = -1; if (Math.random() < dt * .8) tone(rand(1500, 2400), .05, 'sine', .05); }
    if (G.lightOff) n.dark += dt; else n.dark = Math.max(0, n.dark - dt * .5);
    if (n.dark >= 2.4) { n.here = false; n.tm = rand(18, 28); say('The rat scurried off.'); tone(2400, .15, 'sine', .08, 800); }
    else if (n.stay >= 14) { n.here = false; n.tm = rand(20, 30); G.power = Math.max(1, G.power - 18); G.camOff = 22; say('The rat chewed the camera cables!'); noise(.5, .4); tone(120, .5, 'sawtooth', .15, 40); }
  }
  // --- Tinsel (music box) ---
  const t = e.tin, winding = G.cam && G.camId === 4 && G.camOff <= 0 && ((mouse.down && mouse.target === 'wind') || keys.w);
  if (winding) t.wind = Math.min(100, t.wind + 30 * dt); else t.wind = Math.max(0, t.wind - (.7 + night * .14) * dt);
  if (t.wind <= 0) { t.dead += dt; if (t.dead >= 6) { die('tin'); return; } } else t.dead = 0;
  t.acc += dt; const iv = .5 / (.25 + t.wind / 100);
  if (t.wind > 0 && t.acc >= iv) { t.acc = 0; tone(TUNE[t.ni++ % TUNE.length] * (t.wind < 25 ? .94 : 1), .35, 'triangle', G.cam && G.camId === 4 ? .09 : .028); }
}

// ---------- drawing: office ----------
function NX(nx) { return nx - CAM * 1.12 - 20; }
function glow(cx, cy, r, col) { g.fillStyle = rg(g, cx, cy, 1, r, [[0, col], [1, col.replace(/[\d.]+\)$/, '0)')]]); g.fillRect(cx - r, cy - r, r * 2, r * 2); }
function drawOffice() {
  const e = G.e, t = T, cam = CAM, rb = G.rb > 0, dark = G.power <= 0 || rb;
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.save(); g.translate(0, VY);
  const dx = 140 - cam, wx = 1340 - cam;
  g.drawImage(OF.hall.c, dx, 60, 260, 360);
  if (e.sal.at && G.door < .97) { g.save(); g.beginPath(); g.rect(dx, 60, 260, 360); g.clip(); drawSal(dx + 130 + Math.sin(t * 2) * 4, 205, 1.35, t, { swing: Math.sin(t * 3) * 4 }); g.restore(); }
  const dh = 360 * G.door;
  if (dh > 1) {
    g.save(); g.beginPath(); g.rect(dx, 60, 260, dh); g.clip(); g.drawImage(OF.slab.c, dx, 60 + dh - 360, 260, 360);
    if (e.sal.at && G.door > .5) { const sy = 60 + dh - 360 + 80; glow(dx + 130 + Math.sin(t * 3) * 6, sy, 30, 'rgba(255,40,30,.7)'); g.fillStyle = '#f33'; g.beginPath(); g.arc(dx + 130 + Math.sin(t * 3) * 6, sy, 5, 0, 6.3); g.fill(); }
    g.restore(); g.fillStyle = lg(g, 0, 60 + dh, 0, 60 + dh + 30, [[0, 'rgba(0,0,0,.55)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(dx, 60 + dh, 260, 30);
  }
  g.drawImage(OF.far.c, wx, 100, 400, 240);
  const R = e.rusty;
  if (R.at) { g.save(); g.beginPath(); g.rect(wx, 100, 400, 240); g.clip(); const sh = R.rec > 0 ? (Math.random() - .5) * 14 : 0, lean = 1 - R.timer / 8; drawRusty(wx + 200 + sh, 168 + Math.sin(t * 2) * 3, 1.18 + lean * .25, t, { reach: lean }); g.restore(); }
  g.drawImage(OF.main.c, cam * RS, 0, W * RS, H * RS, 0, 0, W, H);
  g.fillStyle = lg(g, wx, 100, wx + 400, 340, [[0, 'rgba(255,255,255,.10)'], [.35, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,.04)']]); g.fillRect(wx, 100, 400, 240);
  // neon sign
  const on = Math.sin(t * 3.1) > -.75 || Math.random() < .4; g.save(); g.shadowColor = '#ff2e63'; g.shadowBlur = on ? 18 : 0; g.font = 'bold 30px "Brush Script MT", cursive, sans-serif'; g.textAlign = 'center'; g.fillStyle = on ? '#ff6b94' : '#4a1a28'; g.fillText("Mel's Diner", 650 - cam, 98); g.restore();
  // control panel buttons
  const px = 480 - cam;
  glow(px, 245, G.doorHeld ? 50 : 26, G.doorHeld ? 'rgba(255,50,40,.55)' : 'rgba(255,50,40,.18)');
  g.fillStyle = '#111'; g.beginPath(); g.arc(px, 245, 27, 0, 6.3); g.fill(); ball(px, 245 + (G.doorHeld ? 2 : 0), 22 - (G.doorHeld ? 2 : 0), G.doorHeld ? '#ff9a8a' : '#ff6a5a', G.doorHeld ? '#e01c10' : '#b81a10', '#4a0804');
  g.fillStyle = '#111'; rrp(g, px - 20, 330, 40, 30, 4); g.fill(); g.fillStyle = '#cfd6da'; g.save(); g.translate(px, 345); g.rotate(G.lightOff ? .55 : -.55); rrp(g, -4, -22, 8, 26, 3); g.fill(); ball(0, -22, 7, '#fff', '#e8c030', '#6a4a00'); g.restore();
  HR.door = [px - 36, 214, 72, 64]; HR.light = [px - 40, 322, 80, 46]; HR.win = [wx, 100, 400, 240];
  // desk layer
  g.drawImage(OF.desk.c, (cam * 1.12 + 20) * RS, 0, W * RS, 220 * RS, 0, 320, W, 220);
  // monitor
  const mx = NX(640);
  g.fillStyle = lg(g, mx, 262, mx + 240, 392, [[0, '#262c31'], [1, '#0d1013']]); rrp(g, mx, 262, 240, 128, 8); g.fill(); g.fillStyle = '#15191c'; g.fillRect(mx + 100, 388, 40, 10);
  g.fillStyle = dark ? '#050607' : lg(g, mx, 276, mx, 366, [[0, '#0b3a3f'], [1, '#052226']]); g.fillRect(mx + 14, 276, 212, 90);
  if (!dark) { g.fillStyle = 'rgba(120,255,240,.9)'; g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.fillText(Math.sin(t * 4) > 0 ? 'CAMERAS' : 'CAMERAS_', mx + 120, 322); g.fillStyle = 'rgba(120,255,240,.4)'; g.font = '10px monospace'; g.fillText('click to open', mx + 120, 340); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,255,245,${Math.random() * .12})`; g.fillRect(mx + 14 + Math.random() * 212, 276 + Math.random() * 90, 6, 1); } }
  HR.mon = [mx, 262, 240, 130];
  // vent
  const vx = NX(980), vy = 456, vw = 240, vh = 76, gm = e.gumbo, cx = vx + vw / 2;
  g.fillStyle = '#020202'; g.fillRect(vx, vy, vw, vh);
  const fr = gm.s === 1 ? gm.pat / gm.max : 1;
  if (gm.s === 1) { g.save(); g.beginPath(); g.rect(vx, vy, vw, vh); g.clip(); if (fr > .66) { glow(cx, vy + 40, 40, 'rgba(120,255,255,.5)'); g.fillStyle = '#7ff'; g.beginPath(); g.arc(cx - 22, vy + 40, 6, 0, 6.3); g.arc(cx + 22, vy + 40, 6, 0, 6.3); g.fill(); } else if (fr > .33) drawGumbo(cx, vy + 52 + Math.sin(t * 4) * 2, .78, t, { mouth: .4 }); g.restore(); }
  g.strokeStyle = '#6c757d'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(vx, vy + 10 + i * 14); g.lineTo(vx + vw, vy + 10 + i * 14); g.stroke(); }
  g.strokeStyle = lg(g, vx, vy, vx, vy + vh, [[0, '#c3cbd1'], [1, '#5a636a']]); g.lineWidth = 6; g.strokeRect(vx, vy, vw, vh);
  if (gm.s === 1 && fr <= .33) drawGumbo(cx, vy - 6 + Math.sin(t * 6) * 3, 1.1, t, { reach: .55 + Math.sin(t * 8) * .1, mouth: 1 });
  if (gm.s === 2) { const k = Math.min(1, gm.cl / 2.2); drawGumbo(cx - k * 90, 470 - k * 200, 1.1 + k * 1.2, t, { reach: 1, mouth: 1 }); }
  // drawer + rat
  const dwx = NX(1320); g.fillStyle = lg(g, 0, 462, 0, 522, [[0, '#4d3019'], [1, '#2a180a']]); rrp(g, dwx, 462, 320, 60, 5); g.fill(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.stroke(); g.fillStyle = lg(g, 0, 484, 0, 498, [[0, '#f0d87a'], [1, '#8a6b18']]); rrp(g, dwx + 110, 484, 100, 14, 7); g.fill();
  HR.drawer = [dwx, 462, 320, 60];
  const n = e.nib; if (n.here) drawNib(NX(n.px), 388, .5, t, { flip: n.dir });
  g.restore();
  drawLights(); drawEmissive();
}
function drawLights() {
  const m = OF.lmx, cam = CAM, out = G.power <= 0 || G.rb > 0, off = G.lightOff || out;
  m.setTransform(.5, 0, 0, .5, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H);
  m.fillStyle = `rgba(2,4,8,${out ? .975 : off ? .93 : .5})`; m.fillRect(0, 0, W, H); m.globalCompositeOperation = 'destination-out';
  const fl = off ? 0 : (G.power < 20 ? .55 + Math.random() * .45 : .93 + Math.random() * .07), pt = (cx, cy, r, a) => { m.fillStyle = rg(m, cx, cy, 2, r, [[0, `rgba(0,0,0,${a})`], [.5, `rgba(0,0,0,${a * .55})`], [1, 'rgba(0,0,0,0)']]); m.fillRect(cx - r, cy - r, r * 2, r * 2); };
  if (!off) { pt(900 - cam, 60 + VY, 620, fl); pt(NX(760), 330, 200, .5 * fl); }
  if (!out) { pt(1540 - cam, 220 + VY, 280, .5); pt(NX(760), 330, 150, .55); pt(270 - cam, 200 + VY, 200, .22); }
  if (G.flashOn || G.flashT > 0) { const wcx = 1540 - cam, wcy = 220 + VY; pt(wcx, wcy, 340, 1); m.fillStyle = rg(m, 480, 600, 20, 520, [[0, 'rgba(0,0,0,.8)'], [1, 'rgba(0,0,0,0)']]); m.beginPath(); m.moveTo(420, 560); m.lineTo(540, 560); m.lineTo(wcx + 200, wcy - 80); m.lineTo(wcx - 200, wcy - 80); m.fill(); }
  g.drawImage(OF.lm, 0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'lighter';
  if (!out) { glow(1540 - cam, 220 + VY, 300, 'rgba(255,70,130,.10)'); glow(NX(760), 330, 160, 'rgba(60,200,200,.10)'); glow(270 - cam, 90 + VY, 150, 'rgba(255,40,30,.12)'); }
  if (G.flashOn || G.flashT > 0) { g.fillStyle = `rgba(210,230,255,${G.flashT > 0 ? .28 : .16})`; g.fillRect(1340 - cam, 100 + VY, 400, 240); }
  g.restore();
}
function drawEmissive() {
  const e = G.e, cam = CAM; g.save(); g.globalCompositeOperation = 'lighter';
  const eyes = (x, y, sp, col, r) => { glow(x - sp, y, r * 4, col.replace('1)', '.35)')); glow(x + sp, y, r * 4, col.replace('1)', '.35)')); g.fillStyle = col; g.beginPath(); g.arc(x - sp, y, r, 0, 6.3); g.arc(x + sp, y, r, 0, 6.3); g.fill(); };
  if (e.rusty.at && !(G.flashOn || G.flashT > 0)) eyes(1540 - cam, 150 + VY, 22, 'rgba(255,255,255,1)', 4);
  if (e.gumbo.s === 1 && G.lightOff) eyes(NX(1100), 496 + VY, 22, 'rgba(120,255,255,1)', 5);
  if (e.nib.here) eyes(NX(e.nib.px) + 32 * e.nib.dir, 376 + VY, 4, 'rgba(255,40,40,1)', 2.2);
  g.restore();
}
function drawHUD() {
  g.fillStyle = 'rgba(0,0,0,.45)'; rrp(g, 12, 10, 230, 62, 8); g.fill();
  txt('POWER', 24, 32, 13, '#9ab'); txt(Math.ceil(G.power) + '%', 24, 58, 26, G.power < 20 ? '#ff5a4a' : '#fff');
  const u = 1 + (G.doorHeld ? 3 : 0) + (G.cam ? 1 : 0) + (G.flashOn ? 2 : 0) + (G.lightOff ? -0 : 0); for (let i = 0; i < 6; i++) { g.fillStyle = i < Math.min(6, u) ? (i < 2 ? '#4cd964' : i < 4 ? '#f5c542' : '#ff5a4a') : 'rgba(255,255,255,.12)'; g.fillRect(100 + i * 21, 44, 17, 16); } txt('USAGE', 100, 36, 11, '#789');
  txt(clockStr(G.t), 940, 36, 30, '#fff', 'right'); txt('Night ' + night, 940, 60, 15, '#9ab', 'right');
  g.fillStyle = G.cam ? 'rgba(180,40,40,.7)' : 'rgba(20,40,50,.75)'; rrp(g, 330, 500, 300, 32, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,.3)'; g.stroke(); txt(G.cam ? 'CLOSE CAMERAS [C]' : 'OPEN CAMERAS [C]', 480, 522, 15, '#fff', 'center');
  if (G.noteT > 0) { g.globalAlpha = Math.min(1, G.noteT); txt(G.note, 480, 470, 18, '#fff', 'center'); g.globalAlpha = 1; }
  if (G.dr && !G.cam) {
    g.fillStyle = 'rgba(18,18,22,.96)'; rrp(g, 520, 290, 420, 200, 10); g.fill(); g.strokeStyle = '#c9b037'; g.lineWidth = 3; g.stroke();
    txt(G.e.gumbo.s === 1 ? 'TAP A BATTERY: GIVE ONE TO GUMBO!' : 'Drawer of batteries (infinite)', 730, 316, 14, G.e.gumbo.s === 1 ? '#ff9ec7' : '#9ab', 'center');
    for (let i = 0; i < 6; i++) drawBattery(552 + (i % 3) * 125, 336 + (i / 3 | 0) * 66, 1.5); txt('∞', 905, 480, 28, '#2ec4b6', 'center');
  }
}
function drawBattery(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = lg(g, 0, 0, 0, 26, [[0, '#3a3a40'], [1, '#111']]); rrp(g, 0, 0, 54, 26, 4); g.fill(); g.fillStyle = lg(g, 0, 3, 0, 23, [[0, '#5ee8d8'], [1, '#12907f']]); rrp(g, 3, 3, 36, 20, 3); g.fill(); g.fillStyle = '#f4d35e'; g.fillRect(40, 3, 11, 20); g.fillStyle = '#bbb'; g.fillRect(54, 8, 5, 10); g.restore(); }
function txt(s, x, y, size, col, al) { g.font = `bold ${size || 20}px "Courier New", monospace`; g.fillStyle = col || '#fff'; g.textAlign = al || 'left'; g.fillText(s, x, y); }

// ---------- drawing: cameras ----------
function drawCam() {
  const id = G.camId, e = G.e, t = T; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (G.camOff > 0) { g.fillStyle = '#111'; g.fillRect(0, 0, W, H); txt('NO SIGNAL', 480, 250, 44, '#ccc', 'center'); txt('cables chewed: ' + Math.ceil(G.camOff) + 's', 480, 290, 18, '#f66', 'center'); }
  else {
    const L = camLayer(id); g.drawImage(L.c, 0, 0, 960, 540);
    if (id === 1 && e.rusty.loc === 'dining') drawRusty(690, 240, .9, t);
    if (id === 2 && e.sal.loc === 'kitchen') drawSal(300, 250, 1.05, t);
    if (id === 3 && e.sal.loc === 'hall') drawSal(480, 300, .62, t);
    if (id === 3 && e.sal.at) drawSal(480, 340, 1.3, t);
    if (id === 4) drawTin(480, 250, 1.25, t, { spin: e.tin.wind > 0, up: e.tin.wind <= 0 });
    if (id === 5) { if (e.gumbo.s >= 1) drawGumbo(480, 280, 1.7, t, { reach: .6 }); else if (e.gumbo.tm < 9) { const k = 1 - e.gumbo.tm / 9; g.save(); g.globalCompositeOperation = 'lighter'; glow(480, 270, 40 + k * 60, 'rgba(120,255,255,.35)'); g.fillStyle = 'rgba(160,255,255,.95)'; g.beginPath(); g.arc(465, 270, 2 + k * 6, 0, 6.3); g.arc(495, 270, 2 + k * 6, 0, 6.3); g.fill(); g.restore(); } }
    if (id === 6 && e.rusty.loc === 'parts') drawRusty(560, 250, 1.05, t);
    if (id === 7 && !e.nib.here && e.nib.tm < 9) { g.save(); g.globalCompositeOperation = 'lighter'; glow(500, 380, 60, 'rgba(255,40,40,.3)'); g.fillStyle = 'rgba(255,60,60,.9)'; g.beginPath(); g.arc(490, 380, 3.5, 0, 6.3); g.arc(512, 380, 3.5, 0, 6.3); g.fill(); g.restore(); if (e.nib.tm < 4) drawNib(520, 430, .9, t, { flip: -1 }); }
    g.fillStyle = 'rgba(40,90,70,.22)'; g.fillRect(0, 0, W, H);
  }
  if (G.camSw > 0) { g.globalAlpha = G.camSw * 3; g.fillStyle = GP; g.fillRect(0, 0, W + 256, H + 256); g.globalAlpha = 1; }
  g.globalAlpha = .12; g.fillStyle = SCAN; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, ((t * 110) % 700) - 80, W, 70);
  g.fillStyle = rg(g, 480, 270, 200, 620, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.65)']]); g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; g.strokeRect(16, 16, W - 32, H - 32);
  txt('CAM ' + id + ' - ' + CAMNAMES[id], 32, 46, 20, '#fff'); if (Math.sin(t * 4) > 0) { g.fillStyle = '#e22'; g.beginPath(); g.arc(W - 150, 38, 7, 0, 6.3); g.fill(); } txt('REC ' + clockStr(G.t), W - 135, 45, 15, '#fff');
  txt('MUSIC BOX', 32, 74, 11, '#bbb'); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(100, 66, 120, 9); g.fillStyle = e.tin.wind > 30 ? '#6c6' : '#e55'; g.fillRect(100, 66, 120 * e.tin.wind / 100, 9);
  for (let i = 1; i <= 7; i++) { const m = CAMMAP[i], bx = 680 + m[0], by = 340 + m[1]; g.fillStyle = i === id ? 'rgba(80,220,120,.85)' : 'rgba(20,30,34,.8)'; g.fillRect(bx, by, m[2], m[3]); g.strokeStyle = '#bcd'; g.lineWidth = 1.5; g.strokeRect(bx, by, m[2], m[3]); txt(String(i), bx + m[2] / 2, by + m[3] / 2 + 6, 16, '#fff', 'center'); }
  if (id === 4 && G.camOff <= 0) { const w = mouse.down && mouse.target === 'wind'; g.fillStyle = w ? '#2e8f4e' : 'rgba(20,30,34,.85)'; rrp(g, 30, 440, 190, 52, 8); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); txt('HOLD TO WIND', 125, 472, 17, '#fff', 'center'); }
  g.fillStyle = 'rgba(180,40,40,.75)'; rrp(g, 330, 500, 300, 32, 8); g.fill(); txt('CLOSE CAMERAS [C]', 480, 522, 15, '#fff', 'center');
  txt('POWER ' + Math.ceil(G.power) + '%', W - 135, 70, 15, G.power < 20 ? '#ff5a4a' : '#fff'); txt('Night ' + night, W - 135, 92, 13, '#9ab');
}

// ---------- minigames ----------
function finishMini(pass) { M.done = true; M.pass = pass; if (pass) { tips = 1; tone(784, .2, 'square', .12); setTimeout(() => tone(1047, .3, 'square', .12), 150); } else tone(120, .5, 'sawtooth', .2); }
function initPie() {
  return { title: 'PIE RUSH: move to catch 10 pies. Avoid burnt ones!', t: 25, score: 0, px: 480, items: [], sp: 0,
    upd(dt) { this.t -= dt; this.px += (mouse.x - this.px) * Math.min(1, dt * 12); this.sp -= dt; if (this.sp <= 0) { this.sp = .55; this.items.push({ x: rand(60, 900), y: -20, v: rand(160, 260), bad: Math.random() < .22 }); }
      for (const i of this.items) { i.y += i.v * dt; if (!i.d && i.y > 470 && i.y < 510 && Math.abs(i.x - this.px) < 62) { i.d = 1; this.score += i.bad ? -2 : 1; if (i.bad) tone(120, .2, 'sawtooth', .15); else tone(660, .08, 'square', .1); } }
      this.items = this.items.filter(i => i.y < 560 && !i.d); if (this.t <= 0) finishMini(this.score >= 10); },
    draw() { txt('Time ' + Math.ceil(this.t) + '   Pies ' + this.score + '/10', 480, 40, 22, '#fff', 'center');
      for (const i of this.items) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(i.x, i.y + 18, 18, 5, 0, 0, 6.3); g.fill(); ball(i.x, i.y, 20, i.bad ? '#555' : '#f3c98a', i.bad ? '#222' : '#c98a3c', '#000'); ball(i.x, i.y, 12, i.bad ? '#444' : '#ff6a5a', i.bad ? '#111' : '#b8201a', '#000'); }
      g.fillStyle = lg(g, 0, 495, 0, 520, [[0, '#e8c860'], [1, '#8a6b18']]); rrp(g, this.px - 60, 495, 120, 24, 8); g.fill(); }, click() {} };
}
function initStack() {
  const cols = ['#e0a458', '#6b3e26', '#52b788', '#f4d35e', '#e63946'];
  return { title: 'BURGER STACK: tap to drop. Stack 7 layers!', st: [{ x: 330, w: 300 }], pc: { x: 40, w: 300, d: 1 },
    upd(dt) { const p = this.pc; p.x += p.d * 260 * dt * (1 + this.st.length * .08); if (p.x < 40) { p.x = 40; p.d = 1; } if (p.x + p.w > 920) { p.x = 920 - p.w; p.d = -1; } },
    click() { const t = this.st[this.st.length - 1], p = this.pc, l = Math.max(p.x, t.x), r = Math.min(p.x + p.w, t.x + t.w); if (r - l <= 6) { finishMini(this.st.length >= 7); return; } tone(300 + this.st.length * 40, .1, 'square', .12); this.st.push({ x: l, w: r - l }); if (this.st.length >= 10) { finishMini(true); return; } this.pc = { x: 40, w: r - l, d: 1 }; },
    draw() { txt('Layers ' + this.st.length + '/7', 480, 40, 22, '#fff', 'center'); this.st.forEach((s, i) => { g.fillStyle = lg(g, 0, 480 - i * 30, 0, 506 - i * 30, [[0, i === 0 ? '#eee' : cols[i % cols.length]], [1, '#000']]); rrp(g, s.x, 480 - i * 30, s.w, 26, 6); g.fill(); }); g.fillStyle = cols[this.st.length % cols.length]; rrp(g, this.pc.x, 90, this.pc.w, 26, 6); g.fill(); } };
}
function initSimon() {
  const cols = ['#e63946', '#f4d35e', '#52b788', '#9b5de5'], names = ['Ketchup', 'Mustard', 'Pickle', 'Onion'], p4 = [[290, 110], [490, 110], [290, 290], [490, 290]];
  return { title: 'ORDER UP! repeat the orders (reach round 5)', seq: [], ph: 'wait', tm: 1, i: 0, lit: -1, pos: 0,
    upd(dt) { this.tm -= dt;
      if (this.ph === 'wait' && this.tm <= 0) { this.seq.push(Math.floor(Math.random() * 4)); this.ph = 'show'; this.i = 0; this.tm = .5; this.lit = -1; }
      else if (this.ph === 'show' && this.tm <= 0) { if (this.lit >= 0) { this.lit = -1; this.tm = .25; this.i++; } else if (this.i < this.seq.length) { this.lit = this.seq[this.i]; tone(300 + this.lit * 120, .35, 'square', .1); this.tm = .5; } else { this.ph = 'in'; this.pos = 0; } }
      else if (this.ph === 'in' && this.lit >= 0 && this.tm <= 0) this.lit = -1; },
    click(x, y) { if (this.ph !== 'in') return; const q = p4.findIndex(p => x > p[0] && x < p[0] + 180 && y > p[1] && y < p[1] + 160); if (q < 0) return; this.lit = q; this.tm = .2; tone(300 + q * 120, .25, 'square', .1);
      if (q === this.seq[this.pos]) { this.pos++; if (this.pos === this.seq.length) { if (this.seq.length >= 5) finishMini(true); else { this.ph = 'wait'; this.tm = .8; } } } else finishMini(this.seq.length >= 5); },
    draw() { txt('Round ' + this.seq.length + (this.ph === 'in' ? '  YOUR TURN' : '  watch...'), 480, 40, 22, '#fff', 'center'); p4.forEach((p, i) => { g.globalAlpha = this.lit === i ? 1 : .38; g.fillStyle = lg(g, 0, p[1], 0, p[1] + 160, [[0, cols[i]], [1, '#000']]); rrp(g, p[0], p[1], 180, 160, 14); g.fill(); g.globalAlpha = 1; txt(names[i], p[0] + 90, p[1] + 88, 20, '#fff', 'center'); }); } };
}
function startMini() { M = [initPie, initStack, initSimon][(night - 1) % 3](); st = 'mini'; }
function nextNight() { night++; if (night > 5) { st = 'win'; night = 1; save(); return; } save(); newShift(); }

// ---------- input routing ----------
function onDown(x, y) {
  if (st === 'title') { if (inR(x, y, 330, 330, 300, 50)) { night = 1; save(); newShift(); hum(); } else if (night > 1 && inR(x, y, 330, 400, 300, 50)) { newShift(); hum(); } return; }
  if (st === 'play') {
    if (G.rb > 0) return;
    if (inR(x, y, 330, 500, 300, 32)) { toggleCam(); return; }
    if (G.cam) {
      for (let i = 1; i <= 7; i++) { const m = CAMMAP[i]; if (inR(x, y, 680 + m[0], 340 + m[1], m[2], m[3]) && G.camId !== i) { G.camId = i; G.camSw = .3; noise(.15, .2); } }
      if (G.camId === 4 && inR(x, y, 30, 440, 190, 52)) mouse.target = 'wind'; return;
    }
    if (G.dr && inR(x, y, 520, 290, 420, 200)) { mouse.target = 'bat'; giveBat(); return; }
    if (hit(HR.drawer, x, y)) { toggleDrawer(); mouse.target = 'drawer'; }
    else if (hit(HR.mon, x, y)) toggleCam();
    else if (hit(HR.door, x, y)) mouse.target = 'door';
    else if (hit(HR.light, x, y)) mouse.target = 'light';
    else if (hit(HR.win, x, y)) { mouse.target = 'win'; tryFlash(); }
    return;
  }
  if (st === 'mini') { if (M.done) nextNight(); else M.click(x, y); }
  else if (st === 'dead') { if (D.t > 1.9) newShift(); }
  else if (st === 'win') st = 'title';
}

// ---------- scenes ----------
function drawBackdropOffice(cam, darkA) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.drawImage(OF.far.c, 1340 - cam, 100, 400, 240); g.drawImage(OF.hall.c, 140 - cam, 60, 260, 360);
  g.drawImage(OF.main.c, cam * RS, 0, W * RS, H * RS, 0, 0, W, H); g.drawImage(OF.desk.c, (cam * 1.12 + 20) * RS, 0, W * RS, 220 * RS, 0, 320, W, 220);
  g.fillStyle = `rgba(0,0,0,${darkA})`; g.fillRect(0, 0, W, H);
}
function post() {
  g.fillStyle = rg(g, 480, 270, 260, 640, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.6)']]); g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .12; g.translate(-Math.random() * 256, -Math.random() * 256); g.fillStyle = GP; g.fillRect(0, 0, W + 256, H + 256); g.restore();
}
function drawPlayScene() { if (G.cam && G.rb <= 0) drawCam(); else drawOffice(); if (G.rb > 0) drawReboot(); else if (!G.cam) drawHUD(); }
function drawReboot() {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (Math.random() < .55) { g.save(); g.globalCompositeOperation = 'lighter'; glow(445, 300, 30, 'rgba(255,120,170,.5)'); glow(515, 300, 30, 'rgba(255,120,170,.5)'); g.fillStyle = '#ff7eb6'; g.beginPath(); g.arc(445, 300, 5, 0, 6.3); g.arc(515, 300, 5, 0, 6.3); g.fill(); g.restore(); }
  txt('POWER FAILURE', 480, 170, 32, '#e63946', 'center'); txt('REBOOTING SYSTEM', 480, 205, 18, '#a55', 'center'); txt(String(Math.ceil(G.rb)), 480, 400, 90, '#fff', 'center'); if (Math.sin(T * 20) > 0) txt('he-he-he...', 480, 460, 20, '#ff7eb6', 'center');
}
const KILLTXT = { sal: 'THE COOK GOT IN.', rusty: 'THE SKELETON GOT YOU.', tin: 'THE MUSIC STOPPED.' };

let last = performance.now(), booted = false;
function boot() { buildOffice(); GP = g.createPattern(GRAIN, 'repeat'); const sc = document.createElement('canvas'); sc.width = 4; sc.height = 4; const sx = sc.getContext('2d'); sx.fillStyle = '#000'; sx.fillRect(0, 0, 4, 2); SCAN = g.createPattern(sc, 'repeat'); booted = true; }
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt;
  if (!booted) boot();
  CAM += (clamp(mouse.x, 0, W) - CAM) * Math.min(1, dt * 5); VY += ((-(mouse.y - 270) / 270 * 8) - VY) * Math.min(1, dt * 5);
  g.setTransform(RS, 0, 0, RS, 0, 0);
  if (st === 'title') {
    drawBackdropOffice((Math.sin(T * .25) + 1) * 480, .55); drawGumbo(480, 520 + Math.sin(T) * 6, 2.6, T, { look: Math.sin(T * .7) });
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, 330); g.save(); g.shadowColor = '#ff2e63'; g.shadowBlur = 26; g.font = 'bold 62px "Brush Script MT", cursive, serif'; g.textAlign = 'center'; g.fillStyle = '#ff6b94'; g.fillText("Midnight at Mel's", 480, 130); g.restore();
    txt('A  FAN-MADE  SURVIVAL  HORROR  GAME', 480, 170, 14, '#9ab', 'center');
    g.fillStyle = '#c2417a'; rrp(g, 330, 330, 300, 50, 10); g.fill(); txt('NEW GAME', 480, 363, 22, '#fff', 'center');
    if (night > 1) { g.fillStyle = '#2a9d8f'; rrp(g, 330, 400, 300, 50, 10); g.fill(); txt('CONTINUE: NIGHT ' + night, 480, 433, 22, '#fff', 'center'); }
  } else if (st === 'intro') {
    G.intro -= dt; g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H); txt('NIGHT ' + night, 480, 150, 60, '#fff', 'center'); txt('12:00 AM', 480, 195, 28, '#9ab', 'center');
    const L = [['HOLD the red DOOR button (left wall) to keep Sal out', '#ff8a7a'], ['HOLD the LIGHT lever to cut the lights when the rat shows up', '#f5d06a'], ['CLICK the window repeatedly to flash the skeleton away', '#cfe6ff'], ['Open the drawer and tap a battery when Gumbo is in the vent', '#ff9ec7'], ['Check CAMERAS, and keep the music box wound (cam 4)', '#8fe3c0'], ['Move your mouse / finger left & right to look around', '#aab']];
    L.forEach((l, i) => txt(l[0], 480, 262 + i * 34, 16, l[1], 'center')); if (G.intro <= 0) st = 'play';
  } else if (st === 'play') { updPlay(dt); if (st === 'play' || st === 'dead') drawPlayScene(); }
  else if (st === 'six') { SX += dt; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); txt('7:30 AM', 480, 270, 90, '#fff', 'center'); txt('SHIFT COMPLETE', 480, 330, 30, '#52b788', 'center'); if (SX > 4) startMini(); }
  else if (st === 'mini') {
    g.fillStyle = lg(g, 0, 0, 0, 540, [[0, '#35203a'], [1, '#150a1a']]); g.fillRect(0, 0, W, H); if (!M.done) M.upd(dt); M.draw(); if (!M.done) txt(M.title, 480, 520, 14, '#cde', 'center');
    if (M.done) { g.fillStyle = 'rgba(0,0,0,.78)'; g.fillRect(0, 0, W, H); txt(M.pass ? 'GREAT SERVICE! Tip jar: power drains 15% slower next night' : 'No tips this time...', 480, 260, 26, M.pass ? '#52b788' : '#e63946', 'center'); txt('tap to continue', 480, 310, 18, '#9ab', 'center'); }
  } else if (st === 'dead') {
    D.t += dt; drawPlayScene(); const k = Math.min(1, D.t / .25), sh = D.t < 1.2 ? 16 : 0, rx = () => rand(-sh, sh);
    g.fillStyle = `rgba(110,0,0,${.45 + .3 * Math.sin(T * 40)})`; g.fillRect(0, 0, W, H);
    if (D.t < 1.9) { if (D.who === 'sal') drawSal(480 + rx(), 330 + rx(), 1 + k * 2.4, T * 3); else if (D.who === 'rusty') drawRusty(480 + rx(), 230 + rx(), 1 + k * 2, T * 3, { reach: 1 }); else drawTin(480 + rx(), 260 + rx(), 1 + k * 2, T * 4, { up: true }); }
    if (D.t > 1.9) { g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(0, 0, W, H); txt(KILLTXT[D.who] || 'GAME OVER', 480, 250, 38, '#e63946', 'center'); txt('tap to retry Night ' + night, 480, 310, 20, '#9ab', 'center'); }
  } else if (st === 'win') {
    g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H); txt('YOU SURVIVED ALL 5 NIGHTS!', 480, 250, 44, '#52b788', 'center'); txt("Mel is very proud. Tap to return to the title.", 480, 310, 20, '#cde', 'center');
  }
  if (st !== 'mini') post();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
