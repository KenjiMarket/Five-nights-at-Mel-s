// ===== art.js : procedural painting helpers, animatronics, and the layered office =====
const RS = 1.5; // render scale for pre-rendered layers
let _s = 20261014;
function sr() { _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function sra(a, b) { return a + sr() * (b - a); }
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w * RS); c.height = Math.ceil(h * RS); const x = c.getContext('2d'); x.scale(RS, RS); return { c, x, w, h }; }
function lg(x, x0, y0, x1, y1, st) { const q = x.createLinearGradient(x0, y0, x1, y1); st.forEach(s => q.addColorStop(s[0], s[1])); return q; }
function rg(x, cx, cy, r0, r1, st) { const q = x.createRadialGradient(cx, cy, r0, cx, cy, r1); st.forEach(s => q.addColorStop(s[0], s[1])); return q; }
function rrp(x, a, b, w, h, r) { x.beginPath(); x.roundRect(a, b, w, h, r); }
function speckle(x, x0, y0, w, h, n, col, amax, smax) { x.fillStyle = col; for (let i = 0; i < n; i++) { x.globalAlpha = sra(.02, amax); const s = sra(.5, smax); x.fillRect(x0 + sr() * w, y0 + sr() * h, s, s * sra(.5, 2)); } x.globalAlpha = 1; }
let GRAIN = null;
function makeGrain() {
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), d = x.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const v = sr() * 255 | 0; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  x.putImageData(d, 0, 0); GRAIN = c;
}

// ---------- drawing primitives (draw to global g) ----------
function ball(cx, cy, r, c0, c1, c2) { g.fillStyle = rg(g, cx - r * .35, cy - r * .4, r * .08, r * 1.05, [[0, c0], [.55, c1], [1, c2]]); g.beginPath(); g.arc(cx, cy, r, 0, 6.3); g.fill(); }
function limb(x1, y1, x2, y2, w, c, hl) { g.lineCap = 'round'; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); if (hl) { g.strokeStyle = hl; g.lineWidth = w * .28; g.beginPath(); g.moveTo(x1 - w * .2, y1 - w * .1); g.lineTo(x2 - w * .2, y2 - w * .1); g.stroke(); } }
function eye(cx, cy, r, col, look) {
  ball(cx, cy, r * 1.18, '#333', '#111', '#000'); ball(cx, cy, r, '#fff', '#e6e6ee', '#8a94a0');
  const px = cx + (look || 0) * r * .3; ball(px, cy + r * .08, r * .56, col[0], col[1], '#000'); g.fillStyle = '#000'; g.beginPath(); g.arc(px, cy + r * .08, r * .25, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(px - r * .22, cy - r * .16, r * .17, 0, 6.3); g.fill();
}
function grime(w, h, n) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(30,18,8,${.05 + Math.random() * .08})`; g.beginPath(); g.ellipse((Math.random() - .5) * w, (Math.random() - .5) * h, 3 + Math.random() * 8, 2 + Math.random() * 12, 0, 0, 6.3); g.fill(); } }

// ---------- animatronics ----------
function drawGumbo(cx, cy, s, t, o) {
  o = o || {}; const reach = o.reach || 0, sw = Math.sin(t * 2.2) * 3;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = lg(g, -45, 40, 45, 130, [[0, '#c63d79'], [1, '#6e1a40']]); rrp(g, -42, 40, 84, 90, 24); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? 'rgba(244,211,94,.92)' : 'rgba(40,10,25,.6)'; g.fillRect(-42, 58 + i * 17, 84, 8); }
  g.fillStyle = 'rgba(70,36,10,.4)'; g.fillRect(-22, 60, 6, 56); g.fillRect(20, 72, 5, 42);
  const ax = 58 + reach * 26, ay = 78 - reach * 76;
  for (const sd of [-1, 1]) {
    limb(sd * 40, 66, sd * ax, ay, 17, '#a2305f', '#e0679a'); ball(sd * ax, ay, 14, '#ffa6cf', '#d6336c', '#5c0f30');
    for (let f = -1; f <= 1; f++) limb(sd * ax + f * 6, ay - 4, sd * ax + f * 8 + sd * reach * 5, ay - 17 - reach * 8, 4.5, '#ffb3d4');
  }
  ball(0, -4 + sw * .3, 60, '#ffc9e0', '#e04880', '#661036');
  g.strokeStyle = 'rgba(60,10,30,.55)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -4, 60, 17, 0, 0, 6.3); g.stroke();
  g.fillStyle = '#35091f'; rrp(g, -21, -48, 42, 9, 4); g.fill(); g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(-19, -47, 38, 1.6);
  g.strokeStyle = '#9aa4ac'; g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, -62); g.bezierCurveTo(18, -84, -12, -92, -6, -104); g.stroke();
  const b = .5 + .5 * Math.sin(t * 9); ball(-6, -108, 10, '#fffbd0', 'rgba(255,205,70,' + (.75 + b * .25) + ')', '#a05a00');
  eye(-23, -8, 17, ['#7ff', '#08a'], o.look || 0); eye(23, -8, 17, ['#7ff', '#08a'], o.look || 0);
  g.strokeStyle = '#4a0f2b'; g.lineWidth = 4.5; g.beginPath(); g.moveTo(-42, -30); g.lineTo(-9, -22); g.moveTo(42, -30); g.lineTo(9, -22); g.stroke();
  g.fillStyle = '#1b0510'; g.beginPath(); g.moveTo(-36, 22); g.quadraticCurveTo(0, 54 + (o.mouth || 0) * 12, 36, 22); g.quadraticCurveTo(0, 30, -36, 22); g.fill();
  g.fillStyle = '#f3f0e2'; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * 7.5 - 3.4, 24); g.lineTo(i * 7.5 + 3.4, 24); g.lineTo(i * 7.5, 31 + (i % 2 ? 4 : 0)); g.fill(); }
  g.fillStyle = 'rgba(255,90,140,.35)'; g.beginPath(); g.arc(-44, 13, 9, 0, 6.3); g.arc(44, 13, 9, 0, 6.3); g.fill();
  grime(110, 110, 10);
  g.restore();
}
function drawSal(cx, cy, s, t, o) {
  o = o || {}; g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = lg(g, -55, 0, 55, 0, [[0, '#9a9690'], [.5, '#e2ded4'], [1, '#8c8880']]); rrp(g, -52, -8, 104, 130, 16); g.fill();
  g.fillStyle = 'rgba(110,30,20,.45)'; g.beginPath(); g.ellipse(-14, 44, 20, 12, .4, 0, 6.3); g.ellipse(22, 78, 14, 20, -.2, 0, 6.3); g.fill();
  g.fillStyle = '#2b2b30'; g.fillRect(-52, 118, 104, 70); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(-52, 118, 8, 70);
  g.fillStyle = '#c9a23a'; g.fillRect(-50, 10, 100, 7);
  limb(-56, 8, -70, 90, 17, '#e6dfcf', '#fff'); ball(-70, 96, 11, '#fff', '#d8d0bd', '#776');
  limb(56, 8, 82 + (o.swing || 0), -30, 17, '#e6dfcf', '#fff'); g.save(); g.translate(82 + (o.swing || 0), -34); g.rotate(-.3);
  g.fillStyle = lg(g, -4, 0, 24, 0, [[0, '#ccd3d8'], [1, '#6d767c']]); g.fillRect(-4, -62, 24, 56); g.fillStyle = '#4a2a18'; g.fillRect(-3, -6, 8, 30); g.restore();
  ball(0, -52, 46, '#f7f0df', '#d9ceb5', '#6e6350');
  g.strokeStyle = 'rgba(40,30,20,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, -92); g.lineTo(18, -70); g.lineTo(8, -58); g.lineTo(20, -40); g.moveTo(18, -70); g.lineTo(34, -66); g.stroke();
  g.fillStyle = '#0b0b0d'; g.beginPath(); g.ellipse(-18, -56, 11, 9, 0, 0, 6.3); g.fill();
  const fl = .8 + .2 * Math.sin(t * 13); g.fillStyle = 'rgba(255,40,30,.35)'; g.beginPath(); g.arc(18, -56, 20 * fl, 0, 6.3); g.fill(); ball(18, -56, 9 * fl, '#ffb0a0', '#ff2015', '#500');
  g.strokeStyle = '#2a1a14'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-24, -26); for (let i = 0; i < 9; i++) g.lineTo(-24 + i * 6, -26 + (i % 2 ? 6 : -2)); g.stroke();
  g.fillStyle = lg(g, -40, -150, 40, -100, [[0, '#fff'], [1, '#c9c2b0']]); rrp(g, -38, -112, 76, 24, 6); g.fill();
  g.beginPath(); g.ellipse(0, -128, 42, 32, 0, 0, 6.3); g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = -2; i <= 2; i++) g.fillRect(i * 14, -150, 2, 38);
  grime(100, 160, 12); g.restore();
}
function drawRusty(cx, cy, s, t, o) {
  o = o || {}; g.save(); g.translate(cx, cy); g.scale(s, s);
  const metal = [[0, '#e2e7ea'], [.5, '#8d979f'], [1, '#2f353b']];
  for (let i = 0; i < 7; i++) { g.fillStyle = lg(g, -14, 0, 14, 0, metal); g.beginPath(); g.ellipse(0, 52 + i * 15, 14 - i * .6, 6.5, 0, 0, 6.3); g.fill(); }
  g.strokeStyle = '#9aa3aa'; g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 60 + i * 18, 46 - i * 5, 22, 0, 3.4, 6.0); g.stroke(); }
  limb(-60, 50, -88, 120, 8, '#79838b', '#c8d0d6'); limb(60, 50, 90 + (o.reach || 0) * 20, 118, 8, '#79838b', '#c8d0d6');
  ball(-60, 50, 11, '#dfe4e8', '#7d878f', '#262b30'); ball(60, 50, 11, '#dfe4e8', '#7d878f', '#262b30');
  limb(-88, 120, -94, 150, 5, '#a8b0b6'); limb(90 + (o.reach || 0) * 20, 118, 96 + (o.reach || 0) * 20, 152, 5, '#a8b0b6');
  limb(-34, 156, -40, 240, 9, '#79838b', '#c8d0d6'); limb(34, 156, 40, 240, 9, '#79838b', '#c8d0d6');
  g.fillStyle = lg(g, -50, -60, 50, 30, metal); g.beginPath(); g.ellipse(0, -14, 48, 56, 0, 0, 6.3); g.fill();
  g.fillStyle = lg(g, -30, 20, 30, 50, [[0, '#7d878f'], [1, '#2b3035']]); rrp(g, -30, 18, 60, 28, 8); g.fill();
  g.fillStyle = '#0a0c0e'; g.beginPath(); g.ellipse(-20, -18, 15, 17, 0, 0, 6.3); g.ellipse(20, -18, 15, 17, 0, 0, 6.3); g.fill();
  const f = (Math.random() < .08) ? .3 : 1; g.fillStyle = `rgba(240,250,255,${.25 * f})`; g.beginPath(); g.arc(-20, -18, 17, 0, 6.3); g.arc(20, -18, 17, 0, 6.3); g.fill();
  g.fillStyle = `rgba(255,255,255,${f})`; g.beginPath(); g.arc(-20, -18, 5, 0, 6.3); g.arc(20, -18, 5, 0, 6.3); g.fill();
  g.strokeStyle = '#1b1f23'; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 8, 22); g.lineTo(i * 8, 44); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-6, -58); g.lineTo(2, -38); g.lineTo(-4, -30); g.stroke();
  g.fillStyle = 'rgba(120,60,20,.25)'; g.fillRect(-44, 10, 8, 30); g.fillRect(30, -30, 6, 40);
  g.restore();
}
function drawNib(cx, cy, s, t, o) {
  o = o || {}; const fl = o.flip || 1; g.save(); g.translate(cx, cy); g.scale(s * fl, s);
  g.strokeStyle = '#2d2a28'; g.lineWidth = 5; g.beginPath(); g.moveTo(-50, 0); g.bezierCurveTo(-90, 10, -80, -40, -120, -30 + Math.sin(t * 5) * 8); g.stroke();
  g.fillStyle = lg(g, 0, -40, 0, 20, [[0, '#8a8580'], [1, '#3b3835']]); g.beginPath(); g.ellipse(-8, -8, 56, 30, 0, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.ellipse(-14, -22, 34, 8, 0, 0, 6.3); g.fill();
  g.fillStyle = '#6b665f'; g.beginPath(); g.moveTo(38, -26); g.quadraticCurveTo(80, -22, 98, -2); g.quadraticCurveTo(70, 14, 36, 12); g.fill();
  ball(100, -2, 6, '#ffb0b0', '#d06060', '#702020');
  g.strokeStyle = 'rgba(230,230,230,.6)'; g.lineWidth = 1; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(90, -2); g.lineTo(122, -8 + i * 8); g.stroke(); }
  ball(30, -42, 17, '#d9a0a0', '#8d5a5a', '#2a1010'); ball(52, -40, 13, '#d9a0a0', '#8d5a5a', '#2a1010');
  g.fillStyle = 'rgba(255,0,0,.3)'; g.beginPath(); g.arc(64, -12, 16, 0, 6.3); g.fill(); ball(64, -12, 7, '#ffd0d0', '#ff2a2a', '#500');
  g.fillStyle = '#e8e0cc'; g.fillRect(84, 3, 4, 8); g.fillRect(90, 3, 4, 8);
  limb(20, 16, 30, 28, 6, '#6b665f'); limb(-30, 16, -34, 28, 6, '#6b665f');
  g.strokeStyle = '#d33'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-30, -30); g.lineTo(-24, -38); g.lineTo(-18, -30); g.moveTo(-26, -32); g.lineTo(-20, -40); g.stroke();
  g.restore();
}
function drawTin(cx, cy, s, t, o) {
  o = o || {}; const rot = o.spin ? Math.sin(t * 3) * .25 : 0; g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = lg(g, -70, 0, 70, 0, [[0, '#5a2a22'], [.5, '#a2503f'], [1, '#4a1f18']]); rrp(g, -70, 70, 140, 70, 8); g.fill();
  g.fillStyle = '#d9b84a'; g.fillRect(-70, 70, 140, 6); g.save(); g.translate(0, 70); g.rotate(rot);
  const up = o.up ? -14 : 0; limb(-6, -10, -6, -70 + up, 7, '#e9dfd0', '#fff');
  g.fillStyle = 'rgba(245,230,235,.95)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(0, -30 + i * 5, 58 - i * 6, 14 - i, 0, 0, 6.3); g.fill(); }
  g.fillStyle = 'rgba(210,160,190,.6)'; g.beginPath(); g.ellipse(0, -30, 40, 8, 0, 0, 6.3); g.fill();
  ball(0, -76 + up, 22, '#fff6ee', '#e8d8c8', '#7a6a5a');
  g.fillStyle = '#111'; g.beginPath(); g.ellipse(-8, -78 + up, 4, 6, 0, 0, 6.3); g.ellipse(8, -78 + up, 4, 6, 0, 0, 6.3); g.fill();
  g.strokeStyle = '#a02040'; g.lineWidth = 2; g.beginPath(); g.moveTo(-7, -66 + up); g.quadraticCurveTo(0, -60 + up, 7, -66 + up); g.stroke();
  g.fillStyle = '#d9b84a'; g.beginPath(); g.moveTo(-12, -96 + up); g.lineTo(-6, -108 + up); g.lineTo(0, -98 + up); g.lineTo(6, -108 + up); g.lineTo(12, -96 + up); g.fill();
  limb(-10, -56, -48, -86 + up, 6, '#e9dfd0'); limb(10, -56, 48, -86 + up, 6, '#e9dfd0');
  g.restore(); g.restore();
}

// ---------- the office (pre-rendered layers) ----------
const OF = {};
function buildOffice() {
  makeGrain();
  // ===== main wall =====
  let L = mk(1920, 540), x = L.x;
  x.fillStyle = lg(x, 0, 0, 0, 540, [[0, '#2b4249'], [.6, '#1b2d34'], [1, '#101b20']]); x.fillRect(0, 0, 1920, 540);
  for (let i = 0; i < 1920; i += 30) { x.fillStyle = 'rgba(255,255,255,.04)'; x.fillRect(i, 0, 15, 380); x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(i + 15, 0, 15, 380); }
  x.strokeStyle = 'rgba(255,255,255,.04)'; x.lineWidth = 1; for (let i = 0; i < 1920; i += 60) for (let j = 20; j < 360; j += 60) { x.beginPath(); x.moveTo(i + 15, j); x.lineTo(i + 30, j + 15); x.lineTo(i + 15, j + 30); x.lineTo(i, j + 15); x.closePath(); x.stroke(); }
  speckle(x, 0, 0, 1920, 380, 3500, '#000', .22, 2.4); speckle(x, 0, 0, 1920, 380, 1500, '#bcd', .07, 1.6);
  for (let i = 0; i < 10; i++) { const sx = sra(100, 1800), sy = sra(0, 220), r = sra(40, 120); x.fillStyle = rg(x, sx, sy, 4, r, [[0, 'rgba(80,55,20,.26)'], [1, 'rgba(80,55,20,0)']]); x.fillRect(sx - r, sy - r, r * 2, r * 2); }
  x.fillStyle = lg(x, 0, 380, 0, 540, [[0, '#3d2b1f'], [1, '#1a100a']]); x.fillRect(0, 380, 1920, 160);
  for (let i = 0; i < 1920; i += 110) { x.fillStyle = 'rgba(0,0,0,.3)'; rrp(x, i + 10, 402, 90, 112, 4); x.fill(); x.strokeStyle = 'rgba(255,220,170,.10)'; x.strokeRect(i + 10, 402, 90, 112); }
  speckle(x, 0, 380, 1920, 160, 1500, '#000', .25, 2);
  x.fillStyle = '#5e4332'; x.fillRect(0, 372, 1920, 10); x.fillStyle = 'rgba(255,230,190,.2)'; x.fillRect(0, 372, 1920, 2); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(0, 382, 1920, 6);
  x.fillStyle = lg(x, 0, 0, 0, 90, [[0, 'rgba(3,5,7,.95)'], [1, 'rgba(3,5,7,0)']]); x.fillRect(0, 0, 1920, 90);
  x.fillStyle = '#1b1510'; x.fillRect(0, 0, 1920, 16); x.fillStyle = 'rgba(255,255,255,.09)'; x.fillRect(0, 16, 1920, 2);
  // pipes
  x.fillStyle = lg(x, 0, 28, 0, 44, [[0, '#7c868c'], [.4, '#c3cbd0'], [1, '#444c52']]); x.fillRect(420, 28, 1000, 14); for (const px of [520, 900, 1280]) { x.fillStyle = '#3c444a'; x.fillRect(px, 26, 10, 18); }
  // shelf + props
  x.fillStyle = lg(x, 0, 190, 0, 204, [[0, '#6a4a30'], [1, '#2e1d10']]); x.fillRect(610, 190, 300, 12); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(610, 202, 300, 8);
  const cols = ['#a33', '#37a', '#c93', '#3a6', '#868']; for (let i = 0; i < 5; i++) { x.fillStyle = lg(x, 0, 146, 0, 190, [[0, cols[i]], [1, '#111']]); x.fillRect(624 + i * 46, 146 + (i % 2) * 14, 38, 44 - (i % 2) * 14); }
  x.fillStyle = '#d9b84a'; x.beginPath(); x.moveTo(860, 190); x.lineTo(866, 160); x.lineTo(886, 160); x.lineTo(892, 190); x.fill();
  // clock
  x.fillStyle = '#111'; x.beginPath(); x.arc(780, 90, 30, 0, 6.3); x.fill(); x.fillStyle = lg(x, 750, 60, 810, 120, [[0, '#f3efe2'], [1, '#b8b2a0']]); x.beginPath(); x.arc(780, 90, 26, 0, 6.3); x.fill();
  x.strokeStyle = '#222'; x.lineWidth = 2; x.beginPath(); x.moveTo(780, 90); x.lineTo(780, 72); x.moveTo(780, 90); x.lineTo(794, 96); x.stroke();
  // cork board
  x.fillStyle = '#3a2a1c'; x.fillRect(978, 118, 214, 144); x.fillStyle = lg(x, 0, 124, 0, 256, [[0, '#a87a4a'], [1, '#7c5632']]); x.fillRect(984, 124, 202, 132); speckle(x, 984, 124, 202, 132, 500, '#3b2410', .4, 2);
  const nc = ['#f4e9a8', '#cfe8f4', '#f4c4c4']; for (let i = 0; i < 6; i++) { x.save(); x.translate(1000 + (i % 3) * 62, 136 + (i / 3 | 0) * 58); x.rotate(sra(-.12, .12)); x.fillStyle = nc[i % 3]; x.fillRect(0, 0, 46, 44); x.fillStyle = 'rgba(0,0,0,.35)'; for (let j = 0; j < 4; j++) x.fillRect(5, 8 + j * 8, 34 - sr() * 14, 1.5); x.fillStyle = '#c22'; x.beginPath(); x.arc(23, 3, 3, 0, 6.3); x.fill(); x.restore(); }
  // AC unit, extinguisher, poster
  x.fillStyle = lg(x, 0, 60, 0, 120, [[0, '#b9c0c4'], [1, '#6d767b']]); rrp(x, 1220, 60, 150, 56, 6); x.fill(); x.fillStyle = 'rgba(0,0,0,.5)'; for (let i = 0; i < 9; i++) x.fillRect(1230, 68 + i * 5, 130, 2);
  x.fillStyle = lg(x, 1260, 0, 1290, 0, [[0, '#7d1515'], [.4, '#e33'], [1, '#601010']]); rrp(x, 1262, 254, 28, 100, 10); x.fill(); x.fillStyle = '#222'; x.fillRect(1268, 244, 16, 12);
  x.fillStyle = '#d8c79a'; x.fillRect(1090, 280, 90, 70); x.fillStyle = '#7a2a1a'; x.font = 'bold 18px sans-serif'; x.textAlign = 'center'; x.fillText('EAT', 1135, 310); x.fillText('WELL', 1135, 334);
  speckle(x, 0, 0, 1920, 540, 3000, '#000', .12, 1.4);
  // --- holes ---
  x.clearRect(140, 60, 260, 360); x.clearRect(1340, 100, 400, 240);
  // door frame (inner shading + jamb)
  x.fillStyle = lg(x, 120, 0, 140, 0, [[0, '#0e0c0a'], [1, '#3c3026']]); x.fillRect(122, 52, 18, 376);
  x.fillStyle = lg(x, 400, 0, 420, 0, [[0, '#4a3b2e'], [1, '#0e0c0a']]); x.fillRect(400, 52, 20, 376);
  x.fillStyle = '#2a211a'; x.fillRect(122, 44, 298, 18); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(122, 44, 298, 2);
  x.fillStyle = '#c9b037'; rrp(x, 235, 20, 60, 20, 3); x.fill(); x.fillStyle = '#111'; x.font = 'bold 12px monospace'; x.textAlign = 'center'; x.fillText('KITCHEN', 265, 34);
  // control panel
  x.fillStyle = lg(x, 420, 170, 540, 380, [[0, '#59636a'], [.5, '#38424a'], [1, '#232b31']]); rrp(x, 430, 170, 100, 200, 8); x.fill(); x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1.5; x.stroke();
  for (const [px, py] of [[438, 178], [522, 178], [438, 362], [522, 362]]) { x.fillStyle = '#9aa3a9'; x.beginPath(); x.arc(px, py, 3.5, 0, 6.3); x.fill(); x.fillStyle = '#222'; x.fillRect(px - 2.5, py - .5, 5, 1); }
  x.fillStyle = '#d9d2c0'; x.font = 'bold 11px monospace'; x.textAlign = 'center'; x.fillText('HOLD', 480, 196); x.fillText('DOOR', 480, 210); x.fillText('HOLD', 480, 306); x.fillText('LIGHTS', 480, 320);
  speckle(x, 430, 170, 100, 200, 160, '#000', .3, 1.6);
  // window frame + blinds
  const wf = lg(x, 0, 90, 0, 112, [[0, '#6a5240'], [1, '#2a1e14']]); x.fillStyle = wf; x.fillRect(1324, 84, 432, 18); x.fillRect(1324, 338, 432, 20); x.fillRect(1324, 84, 18, 274); x.fillRect(1738, 84, 18, 274);
  x.fillStyle = '#44362a'; x.fillRect(1534, 100, 10, 240); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(1534, 100, 2, 240);
  for (let i = 0; i < 4; i++) { x.fillStyle = lg(x, 0, 102 + i * 8, 0, 108 + i * 8, [[0, '#c8c1ae'], [1, '#6c6656']]); x.fillRect(1342, 102 + i * 8, 396, 6); }
  x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(1342, 134, 396, 4); x.strokeStyle = '#2a2a2a'; x.lineWidth = 2; x.beginPath(); x.moveTo(1500, 134); x.lineTo(1500, 164); x.stroke(); x.fillStyle = '#ddd'; x.beginPath(); x.arc(1500, 166, 4, 0, 6.3); x.fill();
  x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(1324, 338, 432, 2);
  OF.main = L;
  // ===== hallway behind the door (260x360) =====
  L = mk(260, 360); x = L.x; const fx0 = 85, fx1 = 175, fy0 = 120, fy1 = 230;
  x.fillStyle = '#040506'; x.fillRect(0, 0, 260, 360);
  x.fillStyle = lg(x, 0, 0, 0, 120, [[0, '#080a0d'], [1, '#222a31']]); x.beginPath(); x.moveTo(0, 0); x.lineTo(260, 0); x.lineTo(fx1, fy0); x.lineTo(fx0, fy0); x.fill();
  x.fillStyle = lg(x, 0, 0, fx0, 0, [[0, '#0b1014'], [1, '#33454e']]); x.beginPath(); x.moveTo(0, 0); x.lineTo(fx0, fy0); x.lineTo(fx0, fy1); x.lineTo(0, 360); x.fill();
  x.fillStyle = lg(x, 260, 0, fx1, 0, [[0, '#0a0f12'], [1, '#2c3e46']]); x.beginPath(); x.moveTo(260, 0); x.lineTo(fx1, fy0); x.lineTo(fx1, fy1); x.lineTo(260, 360); x.fill();
  x.fillStyle = lg(x, 0, 360, 0, fy1, [[0, '#101417'], [1, '#434e55']]); x.beginPath(); x.moveTo(0, 360); x.lineTo(260, 360); x.lineTo(fx1, fy1); x.lineTo(fx0, fy1); x.fill();
  x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 1; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(fx0 + (fx1 - fx0) * i / 8, fy1); x.lineTo(-140 + 540 * i / 8, 360); x.stroke(); }
  for (let k = 1; k <= 6; k++) { const yy = fy1 + (360 - fy1) * Math.pow(k / 6, 1.8); x.beginPath(); x.moveTo(0, yy); x.lineTo(260, yy); x.stroke(); }
  x.fillStyle = lg(x, 0, fy0, 0, fy1, [[0, '#566770'], [1, '#2a353b']]); x.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
  x.fillStyle = '#0a0d10'; x.fillRect(fx0 + 30, fy0 + 24, 30, 86); x.fillStyle = '#ff3b30'; x.fillRect(fx0 + 22, fy0 + 6, 46, 11); x.fillStyle = '#fff'; x.font = 'bold 8px monospace'; x.textAlign = 'center'; x.fillText('EXIT', fx0 + 45, fy0 + 15);
  for (const [sx, sy] of [[18, 140], [242, 140]]) { x.fillStyle = rg(x, sx, sy, 2, 70, [[0, 'rgba(255,200,120,.55)'], [1, 'rgba(255,200,120,0)']]); x.fillRect(sx - 70, sy - 70, 140, 140); x.fillStyle = '#e9c27a'; x.fillRect(sx - 6, sy - 8, 12, 16); }
  x.fillStyle = rg(x, 130, 175, 4, 90, [[0, 'rgba(255,240,200,.35)'], [1, 'rgba(255,240,200,0)']]); x.fillRect(30, 90, 200, 180);
  speckle(x, 0, 0, 260, 360, 700, '#000', .25, 2);
  OF.hall = L;
  // ===== door slab (260x360) =====
  L = mk(260, 360); x = L.x;
  x.fillStyle = lg(x, 0, 0, 260, 0, [[0, '#5f6d75'], [.45, '#93a1a9'], [1, '#56626a']]); x.fillRect(0, 0, 260, 360);
  for (let i = 0; i < 360; i += 2) { x.fillStyle = `rgba(${sr() < .5 ? '255,255,255' : '0,0,0'},.05)`; x.fillRect(0, i, 260, 1); }
  for (const [px, py, pw, ph] of [[16, 130, 228, 90], [16, 232, 228, 100]]) { x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(px, py, pw, ph); x.strokeStyle = 'rgba(255,255,255,.2)'; x.strokeRect(px, py, pw, ph); x.strokeStyle = 'rgba(0,0,0,.5)'; x.strokeRect(px + 2, py + 2, pw, ph); }
  for (let i = 0; i < 6; i++) for (const [px, py] of [[8, 14 + i * 56], [252, 14 + i * 56]]) { x.fillStyle = '#c8d0d4'; x.beginPath(); x.arc(px, py, 3.5, 0, 6.3); x.fill(); x.fillStyle = 'rgba(0,0,0,.5)'; x.beginPath(); x.arc(px + 1, py + 1, 2, 0, 6.3); x.fill(); }
  x.fillStyle = '#05080a'; rrp(x, 70, 56, 120, 50, 6); x.fill(); x.strokeStyle = '#2a3238'; x.lineWidth = 5; x.stroke();
  for (let i = 0; i < 22; i++) { x.fillStyle = (i % 2) ? '#e8c020' : '#161616'; x.beginPath(); x.moveTo(i * 12, 336); x.lineTo(i * 12 + 12, 336); x.lineTo(i * 12 + 4, 360); x.lineTo(i * 12 - 8, 360); x.fill(); }
  x.fillStyle = lg(x, 0, 190, 0, 210, [[0, '#d0d6da'], [1, '#6a7378']]); rrp(x, 20, 180, 220, 12, 5); x.fill();
  speckle(x, 0, 0, 260, 336, 700, '#2a1a0a', .28, 2.2); for (let i = 0; i < 14; i++) { x.strokeStyle = `rgba(255,255,255,${sra(.05, .2)})`; x.lineWidth = .8; x.beginPath(); const sx = sra(10, 250), sy = sra(10, 330); x.moveTo(sx, sy); x.lineTo(sx + sra(-30, 30), sy + sra(-10, 20)); x.stroke(); }
  OF.slab = L;
  // ===== dining-room view through the window (400x240) =====
  L = mk(400, 240); x = L.x;
  x.fillStyle = lg(x, 0, 0, 0, 240, [[0, '#070d18'], [.5, '#0f1a2c'], [1, '#18233a']]); x.fillRect(0, 0, 400, 240);
  x.fillStyle = '#22101a'; x.fillRect(110, 30, 180, 80); for (let i = 0; i < 18; i++) { x.fillStyle = i % 2 ? '#3a1622' : '#2a0e18'; x.fillRect(110 + i * 10, 30, 10, 80); }
  x.fillStyle = '#4a3624'; x.fillRect(96, 108, 208, 12);
  for (let r = 0; r < 4; r++) { const yy = 130 + r * 24, sc = .5 + r * .25; for (let c = 0; c < 4 + r; c++) { const xx = 40 + (c + .5) * (320 / (4 + r)); x.fillStyle = '#0a0f17'; x.beginPath(); x.ellipse(xx, yy, 24 * sc, 7 * sc, 0, 0, 6.3); x.fill(); x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); x.ellipse(xx, yy - 1, 22 * sc, 5 * sc, 0, 0, 6.3); x.fill(); x.fillStyle = '#080c12'; x.fillRect(xx - 3 * sc, yy, 6 * sc, 18 * sc); } }
  x.fillStyle = rg(x, 200, 30, 4, 150, [[0, 'rgba(255,80,130,.45)'], [1, 'rgba(255,80,130,0)']]); x.fillRect(0, 0, 400, 200);
  x.font = 'bold 22px sans-serif'; x.fillStyle = '#ff5c8a'; x.textAlign = 'center'; x.fillText("MEL'S", 60, 40); x.fillStyle = '#5cf'; x.fillText('OPEN', 340, 50);
  speckle(x, 0, 0, 400, 240, 500, '#fff', .12, 1.2);
  OF.far = L;
  // ===== desk (2200 x 220, drawn at y=320) =====
  L = mk(2200, 220); x = L.x;
  x.fillStyle = lg(x, 0, 60, 0, 130, [[0, '#8a5d38'], [.5, '#6a4527'], [1, '#4f3119']]); x.fillRect(0, 60, 2200, 70);
  for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(${sr() < .5 ? '30,15,5' : '190,140,90'},${sra(.04, .16)})`; x.lineWidth = sra(.4, 1.5); const yy = sra(60, 130); x.beginPath(); x.moveTo(sra(0, 2200), yy); x.lineTo(sra(0, 2200), yy + sra(-1.5, 1.5)); x.stroke(); }
  x.fillStyle = rg(x, 1000, 90, 10, 700, [[0, 'rgba(255,230,170,.16)'], [1, 'rgba(255,230,170,0)']]); x.fillRect(0, 60, 2200, 70);
  x.fillStyle = '#b98856'; x.fillRect(0, 128, 2200, 4); x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, 132, 2200, 10);
  x.fillStyle = lg(x, 0, 132, 0, 220, [[0, '#442a17'], [1, '#150b05']]); x.fillRect(0, 132, 2200, 88);
  for (let i = 0; i < 2200; i += 260) { x.strokeStyle = 'rgba(0,0,0,.45)'; x.strokeRect(i + 14, 148, 232, 64); x.strokeStyle = 'rgba(255,200,140,.09)'; x.strokeRect(i + 16, 150, 232, 64); }
  speckle(x, 0, 60, 2200, 160, 2600, '#000', .22, 2);
  // papers, mug, fan, notes (static desk dressing)
  for (let i = 0; i < 4; i++) { x.save(); x.translate(330 + i * 6, 94 + i * 2); x.rotate(sra(-.15, .15)); x.fillStyle = i % 2 ? '#eae4d0' : '#f1ecd9'; x.fillRect(0, 0, 70, 24); x.fillStyle = 'rgba(0,0,0,.35)'; for (let j = 0; j < 3; j++) x.fillRect(5, 5 + j * 6, 50, 1); x.restore(); }
  x.fillStyle = lg(x, 520, 0, 556, 0, [[0, '#d9d2c0'], [.5, '#fff'], [1, '#9a9382']]); rrp(x, 520, 52, 34, 40, 5); x.fill(); x.fillStyle = '#2a1a10'; x.beginPath(); x.ellipse(537, 54, 15, 4, 0, 0, 6.3); x.fill();
  x.strokeStyle = '#d9d2c0'; x.lineWidth = 4; x.beginPath(); x.arc(556, 70, 9, -1.4, 1.4); x.stroke(); x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.ellipse(540, 94, 24, 5, 0, 0, 6.3); x.fill();
  x.fillStyle = '#4a4f54'; x.fillRect(1860, 80, 8, 20); x.fillStyle = '#6a7076'; x.beginPath(); x.arc(1864, 70, 22, 0, 6.3); x.fill(); x.strokeStyle = '#23272a'; x.lineWidth = 2; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(1864, 70, 6 + i * 6, 0, 6.3); x.stroke(); }
  x.fillStyle = '#f4e9a8'; x.save(); x.translate(1960, 96); x.rotate(.1); x.fillRect(0, 0, 44, 40); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(5, 8, 30, 1.5); x.fillRect(5, 16, 24, 1.5); x.restore();
  x.strokeStyle = '#161616'; x.lineWidth = 5; x.beginPath(); x.moveTo(900, 110); x.bezierCurveTo(1000, 140, 1100, 90, 1250, 120); x.stroke();
  OF.desk = L;
  // light mask canvas
  OF.lm = document.createElement('canvas'); OF.lm.width = 480; OF.lm.height = 270; OF.lmx = OF.lm.getContext('2d');
}
