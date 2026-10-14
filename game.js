// MIDNIGHT AT MEL'S — a fan-made survival horror game. No engine: just Canvas 2D + WebAudio.
const W = 960, H = 540;
const cv = document.getElementById('c'), g = cv.getContext('2d');
function fit() { const s = Math.min(innerWidth / W, innerHeight / H); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; }
addEventListener('resize', fit); fit();
const mouse = { x: 480, y: 270 };
function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
cv.addEventListener('pointermove', e => { Object.assign(mouse, pos(e)); });
cv.addEventListener('pointerdown', e => { e.preventDefault(); Object.assign(mouse, pos(e)); ac(); onClick(mouse.x, mouse.y); });
addEventListener('keydown', e => {
  if (st !== 'play') return;
  if (e.code === 'Space') { e.preventDefault(); toggleDoor(); }
  if (e.key === 's' || e.key === 'S') toggleDrawer();
  if (e.key === 'Enter' || e.key === 'e') useBat();
});

// ---------- audio (all synthesized) ----------
let AC, humOn = false;
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d, type = 'sine', v = .15, f2) {
  try {
    const a = ac(), o = a.createOscillator(), gn = a.createGain(), n = a.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, n); if (f2) o.frequency.exponentialRampToValueAtTime(f2, n + d);
    gn.gain.setValueAtTime(v, n); gn.gain.exponentialRampToValueAtTime(.0001, n + d);
    o.connect(gn).connect(a.destination); o.start(); o.stop(n + d);
  } catch (e) {}
}
function noise(d, v = .3) {
  try {
    const a = ac(), b = a.createBuffer(1, Math.max(1, a.sampleRate * d | 0), a.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / x.length);
    const s = a.createBufferSource(), gn = a.createGain(); gn.gain.value = v; s.buffer = b; s.connect(gn).connect(a.destination); s.start();
  } catch (e) {}
}
function hum() {
  if (humOn) return; humOn = true;
  try { const a = ac(), o = a.createOscillator(), o2 = a.createOscillator(), gn = a.createGain(); o.frequency.value = 50; o2.frequency.value = 101; o2.type = 'sawtooth'; gn.gain.value = .02; o.connect(gn); o2.connect(gn); gn.connect(a.destination); o.start(); o2.start(); } catch (e) {}
}

// ---------- state ----------
let st = 'title', night = +localStorage.mmNight || 1, bonus = 0, T = 0, G = null, M = null, D = null, SX = 0;
const SHIFT = 300; // 5 real minutes = 12:00 AM to 7:30 AM
const rand = (a, b) => a + Math.random() * (b - a);
function clockStr(t) { let m = Math.floor(t / SHIFT * 450 / 10) * 10, h = Math.floor(m / 60), mm = m % 60; return (h === 0 ? 12 : h) + ':' + (mm < 10 ? '0' : '') + mm + ' AM'; }
function save() { try { localStorage.mmNight = night; } catch (e) {} }

function newShift() {
  G = { t: 0, power: 100, door: 0, dc: false, dr: false, bat: 4 + bonus, bt: 0, intro: 3, rb: 0, flash: 0, note: '', noteT: 0,
    sal: { s: 0, tm: rand(10, 16), stand: 0 }, pf: { s: 0, tm: rand(9, 14), pat: 0, max: 1, cl: 0 } };
  bonus = 0; st = 'intro';
}
function say(t) { G.note = t; G.noteT = 2.5; }
function toggleDoor() { if (G.rb > 0 || G.power <= 0) return; G.dc = !G.dc; noise(.15, .25); tone(70, .2, 'square', .1); }
function toggleDrawer() { if (G.rb > 0) return; G.dr = !G.dr; tone(150, .1, 'triangle', .1); }
function useBat() {
  if (G.bat <= 0) { say('Drawer is empty!'); return; }
  if (G.pf.s === 1) {
    G.bat--; G.pf.s = 0; G.pf.tm = rand(14, 22); G.dr = false; tone(880, .1, 'square', .1); setTimeout(() => tone(1175, .2, 'square', .1), 100); say('Gumbo happily crawls away...');
  } else if (G.pf.s === 0 && G.power < 100) { G.bat--; G.power = Math.min(100, G.power + 7); tone(520, .15, 'triangle', .15); say('+7% power'); }
}
function die() { st = 'dead'; D = { t: 0 }; noise(1.2, .6); tone(90, 1.2, 'sawtooth', .3, 30); }

// ---------- gameplay update ----------
function updPlay(dt) {
  G.t += dt; G.flash = Math.max(0, G.flash - dt); G.noteT -= dt; G.bt += dt;
  if (G.t >= SHIFT) { st = 'six'; SX = 0; tone(880, 1.5, 'sine', .2); setTimeout(() => tone(1320, 2, 'sine', .2), 300); return; }
  G.door += ((G.dc ? 1 : 0) - G.door) * Math.min(1, dt * 8);
  if (G.rb > 0) { // reboot
    G.rb -= dt; G.dr = false;
    if (G.rb <= 0) { G.rb = 0; G.pf.s = 0; G.pf.tm = rand(15, 22); G.flash = 1; tone(440, .3); say('System rebooted.'); }
    return;
  }
  if (G.power > 0) { G.power -= dt * (.08 + (G.dc ? .22 : 0)); if (G.power <= 0) { G.power = 0; G.dc = false; say('POWER OUT!'); } }
  if (G.bt >= 40) { G.bt = 0; if (G.bat < 6) { G.bat++; say('Found a battery in the drawer'); } }
  // door enemy: Sal the cook
  const s = G.sal;
  if (s.s === 0) {
    s.tm -= dt;
    if (s.tm <= 0) { s.s = 1; s.stand = Math.max(3.5, 6 - night * .4); for (let i = 0; i < 4; i++) setTimeout(() => tone(80 + i * 5, .12, 'square', .12), i * 220); }
  } else {
    s.stand -= dt;
    if (s.stand <= 0) {
      if (G.door > .85) { s.s = 0; s.tm = rand(Math.max(5, 16 - night * 2), Math.max(9, 24 - night * 3)); noise(.2, .3); tone(60, .3, 'square', .2); }
      else { die(); return; }
    }
  }
  // vent enemy: Gumbo
  const p = G.pf;
  if (p.s === 0) { p.tm -= dt; if (p.tm <= 0) { p.s = 1; p.pat = p.max = Math.max(5, 9 - night * .6); noise(.4, .25); tone(200, .4, 'square', .1, 100); say('Something is in the vent...'); } }
  else if (p.s === 1) { p.pat -= dt; if (Math.random() < dt * .6) tone(rand(500, 700), .08, 'sine', .06); if (p.pat <= 0) { p.s = 2; p.cl = 0; G.dr = false; noise(.5, .35); } }
  else if (p.s === 2) { p.cl += dt; if (p.cl >= 2.2) { p.s = 3; G.rb = 15; G.dc = false; G.dr = false; noise(1, .5); tone(60, 1, 'sawtooth', .25, 20); } }
}

// ---------- drawing ----------
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function txt(s, x, y, size = 20, col = '#fff', al = 'left') { g.font = `bold ${size}px monospace`; g.fillStyle = col; g.textAlign = al; g.fillText(s, x, y); }

function drawGumbo(cx, cy, s, t) {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = '#c2417a'; rr(-38, 40, 76, 70, 18); g.fill();
  g.fillStyle = '#f4d35e'; for (let i = 0; i < 3; i++) g.fillRect(-38, 58 + i * 18, 76, 7);
  g.fillStyle = '#ff7eb6'; g.beginPath(); g.arc(-48, 72, 11, 0, 7); g.fill(); g.beginPath(); g.arc(48, 72, 11, 0, 7); g.fill();
  const gr = g.createRadialGradient(-15, -20, 5, 0, 0, 60); gr.addColorStop(0, '#ffb3d4'); gr.addColorStop(1, '#d6336c');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 55, 0, 7); g.fill();
  g.fillStyle = '#4a0f2b'; rr(-18, -40, 36, 7, 3); g.fill();
  g.strokeStyle = '#888'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -55); g.quadraticCurveTo(14, -80, -4, -92); g.stroke();
  const b = .5 + .5 * Math.sin(t * 9); g.fillStyle = `rgba(255,${200 + b * 55 | 0},80,${.6 + b * .4})`; g.beginPath(); g.arc(-4, -95, 8, 0, 7); g.fill();
  for (const ex of [-20, 20]) {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, -8, 15, 0, 7); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(ex, -4, 7, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + 2, -7, 2, 0, 7); g.fill();
  }
  g.fillStyle = '#2b0a1a'; g.beginPath(); g.ellipse(0, 26, 30, 14, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#fff'; for (let i = -4; i <= 3; i++) g.fillRect(i * 7 + 1, 26, 5, 6);
  g.restore();
}
function drawSal(cx, cy, s, t) {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = '#d9d9d9'; g.fillRect(-45, -10, 90, 90); g.fillStyle = '#333'; g.fillRect(-45, 80, 90, 80);
  g.fillStyle = '#e8e0cf'; rr(-30, -90, 60, 80, 10); g.fill();
  g.fillStyle = '#fff'; rr(-34, -150, 68, 50, 18); g.fill(); g.fillRect(-34, -112, 68, 18);
  g.fillStyle = '#111'; g.fillRect(-20, -62, 14, 10);
  g.fillStyle = '#e11'; g.beginPath(); g.arc(14, -57, 8 + Math.sin(t * 12), 0, 7); g.fill();
  g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); g.moveTo(-18, -30); for (let i = 0; i < 7; i++) g.lineTo(-18 + i * 6, -30 + (i % 2 ? 6 : -2)); g.stroke();
  g.beginPath(); g.moveTo(8, -90); g.lineTo(14, -70); g.lineTo(6, -60); g.stroke();
  g.fillStyle = '#e8e0cf'; g.fillRect(45, 0, 12, 70); g.fillStyle = '#999'; g.fillRect(48, 70, 6, 40); g.fillRect(40, 105, 22, 26);
  g.restore();
}
function drawBattery(x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#222'; rr(0, 0, 54, 26, 4); g.fill(); g.fillStyle = '#2ec4b6'; rr(3, 3, 36, 20, 3); g.fill(); g.fillStyle = '#f4d35e'; g.fillRect(40, 3, 11, 20);
  g.fillStyle = '#aaa'; g.fillRect(54, 8, 5, 10); g.restore();
}

function drawOffice() {
  const wall = g.createLinearGradient(0, 0, 0, 400); wall.addColorStop(0, '#16323a'); wall.addColorStop(1, '#0c1c22'); g.fillStyle = wall; g.fillRect(0, 0, W, H);
  g.globalAlpha = .22; for (let i = 0; i < 24; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#222' : '#ddd'; g.fillRect(i * 40, 300 + j * 40, 40, 40); } g.globalAlpha = 1;
  // diner window
  g.fillStyle = '#05090b'; g.fillRect(380, 70, 300, 150); g.strokeStyle = '#445'; g.lineWidth = 6; g.strokeRect(380, 70, 300, 150);
  g.fillStyle = '#0b1316'; for (let i = 0; i < 3; i++) { rr(400 + i * 95, 150, 80, 70, 10); g.fill(); }
  // neon sign
  const on = Math.sin(T * 3.1) > -.7 || Math.random() < .5;
  g.shadowColor = '#ff2e63'; g.shadowBlur = on ? 18 : 0; txt("MEL'S DINER", 530, 50, 26, on ? '#ff5c8a' : '#4a1a28', 'center'); g.shadowBlur = 0;
  // poster
  g.fillStyle = '#d9c9a3'; g.fillRect(740, 90, 90, 120); txt('EAT', 785, 135, 22, '#733', 'center'); txt('HERE', 785, 160, 22, '#733', 'center');
  // doorway
  g.fillStyle = '#050607'; g.fillRect(30, 60, 200, 340);
  g.fillStyle = '#a00'; g.fillRect(110, 66, 40, 12); txt('EXIT', 130, 76, 9, '#fff', 'center');
  if (G.sal.s === 1 && G.door < .95) { g.save(); g.beginPath(); g.rect(30, 60, 200, 340); g.clip(); drawSal(130 + Math.sin(T * 2) * 4, 235, 1.2, T); g.restore(); }
  // door panel
  const dh = 340 * G.door;
  if (dh > 1) {
    g.fillStyle = '#58656b'; g.fillRect(30, 60, 200, dh); g.fillStyle = '#3c474c'; for (let y = 90; y < dh + 60; y += 40) g.fillRect(30, y, 200, 4);
    g.fillStyle = '#e0a'; g.fillStyle = '#9aa'; g.fillRect(30, 60 + dh - 8, 200, 8);
    if (G.door > .5) { g.fillStyle = '#050607'; g.fillRect(95, 100, 70, 50); if (G.sal.s === 1) { g.fillStyle = '#f22'; g.beginPath(); g.arc(138 + Math.sin(T * 3) * 3, 125, 6, 0, 7); g.fill(); } g.strokeStyle = '#222'; g.lineWidth = 4; g.strokeRect(95, 100, 70, 50); }
  }
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 10; g.strokeRect(30, 60, 200, 340);
  // desk
  g.fillStyle = '#4a2f1d'; g.fillRect(0, 385, W, 155); g.fillStyle = '#6b4529'; g.fillRect(0, 385, W, 20);
  // desk items: lamp
  g.fillStyle = '#333'; g.fillRect(780, 345, 10, 40); g.fillStyle = '#ffd166'; g.beginPath(); g.moveTo(760, 350); g.lineTo(810, 350); g.lineTo(798, 325); g.lineTo(772, 325); g.fill();
  // vent
  const vx = 300, vy = 425, vw = 240, vh = 95;
  g.fillStyle = '#050505'; g.fillRect(vx, vy, vw, vh);
  const p = G.pf;
  if (p.s === 1) { g.save(); g.beginPath(); g.rect(vx, vy, vw, vh); g.clip(); drawGumbo(vx + vw / 2, vy + 55 + Math.sin(T * 4) * 2, .85, T); g.restore(); }
  g.strokeStyle = '#6c757d'; g.lineWidth = 5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(vx, vy + 12 + i * 15); g.lineTo(vx + vw, vy + 12 + i * 15); g.stroke(); }
  g.strokeStyle = '#8d99a3'; g.lineWidth = 6; g.strokeRect(vx, vy, vw, vh);
  if (p.s === 2) { const k = Math.min(1, p.cl / 2.2); drawGumbo(vx + vw / 2 - k * 60, 480 - k * 160, .8 + k * 1.3, T); }
  if (p.s === 1) {
    g.fillStyle = 'rgba(0,0,0,.75)'; rr(300, 335, 260, 56, 8); g.fill();
    txt('Batteries... please?', 430, 360, 18, '#ff9ec7', 'center');
    g.fillStyle = '#222'; g.fillRect(315, 370, 230, 10); const f = p.pat / p.max; g.fillStyle = f > .5 ? '#52b788' : f > .25 ? '#f4d35e' : '#e63946'; g.fillRect(315, 370, 230 * f, 10);
  }
  // drawer front
  g.fillStyle = '#3a2314'; rr(620, 415, 260, 75, 6); g.fill(); g.fillStyle = '#c9b037'; rr(710, 440, 80, 12, 6); g.fill();
  txt('DRAWER [S]', 750, 480, 12, '#d9b', 'center');
  // door button
  g.fillStyle = G.dc ? '#a22' : '#262'; rr(20, 430, 160, 50, 8); g.fill(); txt(G.dc ? 'DOOR: CLOSED' : 'DOOR: OPEN', 100, 461, 15, '#fff', 'center'); txt('[SPACE]', 100, 500, 11, '#999', 'center');
  // open drawer tray
  if (G.dr) {
    g.fillStyle = '#1f1f23'; rr(520, 290, 420, 230, 10); g.fill(); g.strokeStyle = '#c9b037'; g.lineWidth = 3; g.stroke();
    txt(G.pf.s === 1 ? 'TAP A BATTERY: GIVE TO VISITOR!' : 'Tap battery: recharge +7%', 730, 318, 14, G.pf.s === 1 ? '#ff9ec7' : '#9ab', 'center');
    for (let i = 0; i < G.bat; i++) drawBattery(560 + (i % 3) * 125, 340 + (i / 3 | 0) * 70, 1.5);
    if (G.bat === 0) txt('EMPTY', 730, 420, 28, '#a55', 'center');
  }
}
function drawHUD() {
  txt(clockStr(G.t), 940, 36, 28, '#fff', 'right'); txt('Night ' + night, 940, 62, 16, '#9ab', 'right');
  txt('POWER ' + Math.ceil(G.power) + '%', 20, 30, 20, G.power < 20 ? '#e63946' : '#fff');
  g.fillStyle = '#222'; g.fillRect(20, 40, 200, 12); g.fillStyle = G.power < 20 ? '#e63946' : '#52b788'; g.fillRect(20, 40, 2 * G.power, 12);
  txt('BATTERIES x' + G.bat, 20, 80, 16, '#2ec4b6');
  if (G.noteT > 0) txt(G.note, 480, 520, 18, '#fff', 'center');
}
function drawPlay() {
  drawOffice(); drawHUD();
  const dark = G.power <= 0 ? .85 : G.power < 20 ? .5 + Math.random() * .2 : .25;
  const v = g.createRadialGradient(480, 270, 150, 480, 270, 620); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${dark + .35})`); g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (G.flash > 0) { g.fillStyle = `rgba(255,255,255,${G.flash * .4})`; g.fillRect(0, 0, W, H); }
  if (G.rb > 0) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (Math.random() < .5) { g.fillStyle = '#ff7eb6'; g.beginPath(); g.arc(440, 250, 5, 0, 7); g.fill(); g.beginPath(); g.arc(520, 250, 5, 0, 7); g.fill(); }
    txt('POWER FAILURE - REBOOTING', 480, 200, 30, '#e63946', 'center'); txt(Math.ceil(G.rb) + '', 480, 330, 90, '#fff', 'center');
    if (Math.sin(T * 20) > 0) txt('he-he-he...', 480, 400, 20, '#ff7eb6', 'center');
  }
}

// ---------- minigames ----------
function finishMini(pass) { M.done = true; M.pass = pass; if (pass) { bonus = 2; tone(784, .2, 'square', .12); setTimeout(() => tone(1047, .3, 'square', .12), 150); } else tone(120, .5, 'sawtooth', .2); }
function initPie() {
  return { type: 'pie', title: 'PIE RUSH: catch 10 pies, avoid burnt ones!', t: 25, score: 0, px: 480, items: [], sp: 0,
    upd(dt) {
      this.t -= dt; this.px += (mouse.x - this.px) * Math.min(1, dt * 12); this.sp -= dt;
      if (this.sp <= 0) { this.sp = .55; this.items.push({ x: rand(60, 900), y: -20, v: rand(160, 260), bad: Math.random() < .22 }); }
      for (const i of this.items) { i.y += i.v * dt; if (!i.d && i.y > 470 && i.y < 510 && Math.abs(i.x - this.px) < 62) { i.d = 1; this.score += i.bad ? -2 : 1; if (i.bad) tone(120, .2, 'sawtooth', .15); else tone(660, .08, 'square', .1); } }
      this.items = this.items.filter(i => i.y < 560 && !i.d);
      if (this.t <= 0) finishMini(this.score >= 10);
    },
    draw() {
      txt('Time ' + Math.ceil(this.t) + '   Pies ' + this.score + '/10', 480, 40, 22, '#fff', 'center');
      for (const i of this.items) { g.fillStyle = i.bad ? '#1b1b1b' : '#e0a458'; g.beginPath(); g.arc(i.x, i.y, 20, 0, 7); g.fill(); g.fillStyle = i.bad ? '#444' : '#e63946'; g.beginPath(); g.arc(i.x, i.y, 12, 0, 7); g.fill(); }
      g.fillStyle = '#c9b037'; rr(this.px - 60, 495, 120, 22, 6); g.fill();
    }, click() {} };
}
function initStack() {
  const cols = ['#e0a458', '#6b3e26', '#52b788', '#f4d35e', '#e63946'];
  return { type: 'stack', title: 'BURGER STACK: tap to drop. Stack 7 layers!', st: [{ x: 330, w: 300 }], pc: { x: 40, w: 300, d: 1 },
    upd(dt) { const p = this.pc; p.x += p.d * 260 * dt * (1 + this.st.length * .08); if (p.x < 40) { p.x = 40; p.d = 1; } if (p.x + p.w > 920) { p.x = 920 - p.w; p.d = -1; } },
    click() {
      const t = this.st[this.st.length - 1], p = this.pc, l = Math.max(p.x, t.x), r = Math.min(p.x + p.w, t.x + t.w);
      if (r - l <= 6) { finishMini(this.st.length >= 7); return; }
      tone(300 + this.st.length * 40, .1, 'square', .12); this.st.push({ x: l, w: r - l });
      if (this.st.length >= 10) { finishMini(true); return; }
      this.pc = { x: 40, w: r - l, d: 1 };
    },
    draw() {
      txt('Layers ' + this.st.length + '/7', 480, 40, 22, '#fff', 'center');
      this.st.forEach((s, i) => { g.fillStyle = i === 0 ? '#ddd' : cols[i % cols.length]; rr(s.x, 480 - i * 30, s.w, 26, 6); g.fill(); });
      g.fillStyle = cols[this.st.length % cols.length]; rr(this.pc.x, 90, this.pc.w, 26, 6); g.fill();
    } };
}
function initSimon() {
  const cols = ['#e63946', '#f4d35e', '#52b788', '#9b5de5'], names = ['Ketchup', 'Mustard', 'Pickle', 'Onion'], pos4 = [[290, 110], [490, 110], [290, 290], [490, 290]];
  return { type: 'simon', title: "ORDER UP! repeat the orders (reach round 5)", seq: [], ph: 'wait', tm: 1, i: 0, lit: -1, pos: 0,
    upd(dt) {
      this.tm -= dt;
      if (this.ph === 'wait' && this.tm <= 0) { this.seq.push(Math.floor(Math.random() * 4)); this.ph = 'show'; this.i = 0; this.tm = .5; this.lit = -1; }
      else if (this.ph === 'show' && this.tm <= 0) {
        if (this.lit >= 0) { this.lit = -1; this.tm = .25; this.i++; }
        else if (this.i < this.seq.length) { this.lit = this.seq[this.i]; tone(300 + this.lit * 120, .35, 'square', .1); this.tm = .5; }
        else { this.ph = 'in'; this.pos = 0; }
      } else if (this.ph === 'in' && this.lit >= 0 && this.tm <= 0) this.lit = -1;
    },
    click(x, y) {
      if (this.ph !== 'in') return;
      const q = pos4.findIndex(p => x > p[0] && x < p[0] + 180 && y > p[1] && y < p[1] + 160); if (q < 0) return;
      this.lit = q; this.tm = .2; tone(300 + q * 120, .25, 'square', .1);
      if (q === this.seq[this.pos]) { this.pos++; if (this.pos === this.seq.length) { if (this.seq.length >= 5) finishMini(true); else { this.ph = 'wait'; this.tm = .8; } } }
      else finishMini(this.seq.length >= 5);
    },
    draw() {
      txt('Round ' + this.seq.length + (this.ph === 'in' ? '  YOUR TURN' : '  watch...'), 480, 40, 22, '#fff', 'center');
      pos4.forEach((p, i) => { g.globalAlpha = this.lit === i ? 1 : .35; g.fillStyle = cols[i]; rr(p[0], p[1], 180, 160, 14); g.fill(); g.globalAlpha = 1; txt(names[i], p[0] + 90, p[1] + 88, 20, '#111', 'center'); });
    } };
}
function startMini() { M = [initPie, initStack, initSimon][(night - 1) % 3](); st = 'mini'; }
function nextNight() { night++; if (night > 5) { st = 'win'; night = 1; save(); return; } save(); newShift(); }

// ---------- input routing ----------
const inR = (x, y, a, b, w, h) => x > a && x < a + w && y > b && y < b + h;
function onClick(x, y) {
  if (st === 'title') {
    if (inR(x, y, 330, 330, 300, 50)) { night = 1; save(); newShift(); hum(); }
    else if (night > 1 && inR(x, y, 330, 400, 300, 50)) { newShift(); hum(); }
  } else if (st === 'play') {
    if (G.rb > 0) return;
    if (G.dr && inR(x, y, 520, 290, 420, 230)) { useBat(); return; }
    if (inR(x, y, 20, 430, 160, 50) || inR(x, y, 30, 60, 200, 340)) toggleDoor();
    else if (inR(x, y, 620, 415, 260, 75)) toggleDrawer();
    else if (G.dr) G.dr = false;
  } else if (st === 'mini') { if (M.done) nextNight(); else M.click(x, y); }
  else if (st === 'dead') { if (D.t > 1.8) newShift(); }
  else if (st === 'win') st = 'title';
}

// ---------- main loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt;
  g.clearRect(0, 0, W, H); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (st === 'title') {
    g.fillStyle = '#0c1c22'; g.fillRect(0, 0, W, H); drawGumbo(480, 160, 1.3, T);
    g.shadowColor = '#ff2e63'; g.shadowBlur = 20; txt("MIDNIGHT AT MEL'S", 480, 300, 44, '#ff5c8a', 'center'); g.shadowBlur = 0;
    g.fillStyle = '#c2417a'; rr(330, 330, 300, 50, 10); g.fill(); txt('NEW GAME', 480, 363, 22, '#fff', 'center');
    if (night > 1) { g.fillStyle = '#2a9d8f'; rr(330, 400, 300, 50, 10); g.fill(); txt('CONTINUE: NIGHT ' + night, 480, 433, 22, '#fff', 'center'); }
    txt('An original fan-made survival game. Built without a game engine.', 480, 510, 14, '#789', 'center');
  } else if (st === 'intro') {
    G.intro -= dt; txt('NIGHT ' + night, 480, 220, 56, '#fff', 'center'); txt('12:00 AM', 480, 280, 30, '#9ab', 'center');
    txt('DOOR (left): close it when the cook appears - drains power', 480, 350, 16, '#cde', 'center');
    txt('DRAWER (bottom): open it and give batteries to Gumbo in the vent!', 480, 378, 16, '#cde', 'center');
    txt('Too slow = he enters and cuts the power for 15 seconds.', 480, 406, 16, '#cde', 'center');
    txt('Keys: SPACE door, S drawer, ENTER use battery', 480, 440, 14, '#789', 'center');
    if (G.intro <= 0) st = 'play';
  } else if (st === 'play') { updPlay(dt); if (st === 'play') drawPlay(); else if (st === 'dead') drawPlay(); }
  else if (st === 'six') {
    SX += dt; txt('7:30 AM', 480, 250, 80, '#fff', 'center'); txt('SHIFT COMPLETE', 480, 310, 30, '#52b788', 'center'); if (SX > 4) startMini();
  } else if (st === 'mini') {
    g.fillStyle = '#2a1a2e'; g.fillRect(0, 0, W, H);
    if (!M.done) { M.upd(dt); }
    M.draw(); if (!M.done) txt(M.title, 480, 520, 14, '#cde', 'center');
    if (M.done) { g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(0, 0, W, H); txt(M.pass ? 'GREAT SERVICE! +2 batteries next night' : 'No tips this time...', 480, 260, 30, M.pass ? '#52b788' : '#e63946', 'center'); txt('tap to continue', 480, 310, 18, '#9ab', 'center'); }
  } else if (st === 'dead') {
    D.t += dt; drawPlay(); const k = Math.min(1, D.t / .25), sh = D.t < 1.2 ? 14 : 0;
    g.fillStyle = `rgba(120,0,0,${.4 + .3 * Math.sin(T * 40)})`; g.fillRect(0, 0, W, H);
    drawSal(480 + rand(-sh, sh), 300 + rand(-sh, sh), 1 + k * 2.6, T * 3);
    if (D.t > 1.8) { g.fillStyle = 'rgba(0,0,0,.8)'; g.fillRect(0, 0, W, H); txt('YOU DIDN\'T CLOSE THE DOOR', 480, 250, 36, '#e63946', 'center'); txt('tap to retry Night ' + night, 480, 310, 20, '#9ab', 'center'); }
  } else if (st === 'win') {
    txt('YOU SURVIVED ALL 5 NIGHTS!', 480, 250, 44, '#52b788', 'center'); txt('Mel is very proud. Tap to return to title.', 480, 310, 20, '#cde', 'center');
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
