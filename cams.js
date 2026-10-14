// ===== cams.js : security camera scenes (pre-rendered lazily) =====
const CAMNAMES = { 1: 'DINING HALL', 2: 'KITCHEN', 3: 'BACK HALL', 4: 'PRIZE CORNER', 5: 'VENT TUNNEL', 6: 'PARTS & SERVICE', 7: 'RESTROOMS' };
const CAMMAP = { 1: [20, 20, 120, 50], 2: [150, 20, 70, 50], 3: [150, 80, 70, 40], 4: [20, 80, 120, 40], 5: [90, 130, 130, 24], 6: [20, 130, 60, 24], 7: [230, 20, 40, 100] };
const CAML = {};
function floorGrid(x, y0, vx, c1, c2, rows) {
  x.fillStyle = lg(x, 0, y0, 0, 540, [[0, c1], [1, c2]]); x.fillRect(0, y0, 960, 540 - y0);
  x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1;
  for (let i = -12; i <= 12; i++) { x.beginPath(); x.moveTo(vx + i * 14, y0); x.lineTo(vx + i * 150, 540); x.stroke(); }
  for (let k = 1; k <= rows; k++) { const yy = y0 + (540 - y0) * Math.pow(k / rows, 1.9); x.beginPath(); x.moveTo(0, yy); x.lineTo(960, yy); x.stroke(); }
}
const SCENE = {
  1(x) {
    x.fillStyle = lg(x, 0, 0, 0, 280, [[0, '#0d1420'], [1, '#1d2838']]); x.fillRect(0, 0, 960, 540);
    x.fillStyle = '#2a1018'; x.fillRect(250, 40, 460, 190); for (let i = 0; i < 46; i++) { x.fillStyle = i % 2 ? '#431a28' : '#2e0f1a'; x.fillRect(250 + i * 10, 40, 10, 190); }
    x.fillStyle = '#5a4128'; x.fillRect(230, 226, 500, 30); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(230, 226, 500, 3);
    floorGrid(x, 256, 480, '#1b2430', '#0a0f16', 7);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const sc = .55 + r * .35, xx = 480 + (c - 2) * (120 + r * 70), yy = 290 + r * 62 + (r * r * 6); x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.ellipse(xx, yy + 22 * sc, 40 * sc, 10 * sc, 0, 0, 6.3); x.fill(); x.fillStyle = lg(x, 0, yy - 10 * sc, 0, yy + 10 * sc, [[0, '#6a7380'], [1, '#2c333c']]); x.beginPath(); x.ellipse(xx, yy, 38 * sc, 11 * sc, 0, 0, 6.3); x.fill(); x.fillStyle = '#1c2128'; x.fillRect(xx - 3 * sc, yy, 6 * sc, 24 * sc); }
    x.fillStyle = '#ff5c8a'; x.font = 'bold 34px sans-serif'; x.textAlign = 'center'; x.shadowColor = '#ff2e63'; x.shadowBlur = 20; x.fillText("MEL'S DINER", 480, 28); x.shadowBlur = 0;
  },
  2(x) {
    x.fillStyle = lg(x, 0, 0, 0, 540, [[0, '#2a2f33'], [1, '#12161a']]); x.fillRect(0, 0, 960, 540);
    for (let i = 0; i < 960; i += 60) for (let j = 0; j < 330; j += 60) { x.fillStyle = (i / 60 + j / 60) % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)'; x.fillRect(i, j, 60, 60); }
    floorGrid(x, 330, 480, '#2a3035', '#0d1013', 5);
    x.fillStyle = lg(x, 0, 60, 0, 130, [[0, '#9ca5ab'], [1, '#444c52']]); x.fillRect(300, 50, 360, 70); x.fillStyle = '#222'; for (let i = 0; i < 12; i++) x.fillRect(310 + i * 29, 100, 12, 18);
    for (let i = 0; i < 6; i++) { x.strokeStyle = '#555'; x.lineWidth = 2; x.beginPath(); x.moveTo(120 + i * 60, 0); x.lineTo(120 + i * 60, 90); x.stroke(); x.fillStyle = lg(x, 0, 90, 0, 140, [[0, '#8a9298'], [1, '#3b4247']]); x.beginPath(); x.arc(120 + i * 60, 118, 24 - (i % 3) * 3, 0, 3.14); x.fill(); }
    x.fillStyle = lg(x, 0, 300, 0, 380, [[0, '#b7c0c6'], [1, '#4b5358']]); x.fillRect(80, 300, 400, 40); x.fillStyle = '#2a2f33'; x.fillRect(80, 340, 400, 120); x.fillStyle = lg(x, 0, 290, 0, 330, [[0, '#d3dade'], [1, '#6a737a']]); x.fillRect(560, 280, 320, 50); x.fillStyle = '#2a2f33'; x.fillRect(570, 330, 300, 140);
    x.fillStyle = 'rgba(160,30,20,.35)'; x.beginPath(); x.ellipse(660, 440, 40, 12, 0, 0, 6.3); x.fill();
  },
  3(x) {
    x.fillStyle = '#05070a'; x.fillRect(0, 0, 960, 540); const a = 340, b = 620, fy0 = 200, fy1 = 330;
    x.fillStyle = lg(x, 0, 0, 0, fy0, [[0, '#0a0d11'], [1, '#222a31']]); x.beginPath(); x.moveTo(0, 0); x.lineTo(960, 0); x.lineTo(b, fy0); x.lineTo(a, fy0); x.fill();
    x.fillStyle = lg(x, 0, 0, a, 0, [[0, '#0d1318'], [1, '#34464f']]); x.beginPath(); x.moveTo(0, 0); x.lineTo(a, fy0); x.lineTo(a, fy1); x.lineTo(0, 540); x.fill();
    x.fillStyle = lg(x, 960, 0, b, 0, [[0, '#0b1014'], [1, '#2f424b']]); x.beginPath(); x.moveTo(960, 0); x.lineTo(b, fy0); x.lineTo(b, fy1); x.lineTo(960, 540); x.fill();
    x.fillStyle = lg(x, 0, 540, 0, fy1, [[0, '#0f1316'], [1, '#434e55']]); x.beginPath(); x.moveTo(0, 540); x.lineTo(960, 540); x.lineTo(b, fy1); x.lineTo(a, fy1); x.fill();
    x.fillStyle = '#44545c'; x.fillRect(a, fy0, b - a, fy1 - fy0); x.fillStyle = '#0a0d10'; x.fillRect(a + 100, fy0 + 40, 80, 90);
    x.fillStyle = '#ff3b30'; x.fillRect(a + 100, fy0 + 14, 80, 18); x.fillStyle = '#fff'; x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.fillText('EXIT', a + 140, fy0 + 28);
    x.strokeStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i <= 10; i++) { x.beginPath(); x.moveTo(a + (b - a) * i / 10, fy1); x.lineTo(-300 + 1560 * i / 10, 540); x.stroke(); }
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const t = [.15, .4, .7][k], dx = s < 0 ? a * (1 - t) : 960 - (960 - b) * (1 - t) - 0, h = 220 * (1 - t) + 40; x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(dx - (s < 0 ? 0 : 50 * (1 - t)), 270 - h / 2 + 40, 50 * (1 - t), h); }
    x.fillStyle = rg(x, 480, 120, 4, 300, [[0, 'rgba(255,240,200,.25)'], [1, 'rgba(255,240,200,0)']]); x.fillRect(0, 0, 960, 540);
  },
  4(x) {
    x.fillStyle = lg(x, 0, 0, 0, 540, [[0, '#1b1018'], [1, '#0c070b']]); x.fillRect(0, 0, 960, 540);
    for (let i = 0; i < 4; i++) { x.fillStyle = '#3b2616'; x.fillRect(70, 70 + i * 90, 260, 10); x.fillRect(630, 70 + i * 90, 260, 10); for (let j = 0; j < 5; j++) { ball0(x, 95 + j * 50, 52 + i * 90, 16 + (j % 2) * 4, ['#e85a8a', '#4aa3e8', '#e8c44a', '#6ad48a', '#a46ae8'][(i + j) % 5]); ball0(x, 655 + j * 50, 52 + i * 90, 17 - (j % 2) * 3, ['#a46ae8', '#e8c44a', '#4aa3e8', '#e85a8a', '#6ad48a'][(i + j) % 5]); } }
    floorGrid(x, 400, 480, '#2a1a22', '#0d070a', 4);
    x.fillStyle = rg(x, 480, 300, 10, 260, [[0, 'rgba(255,220,160,.35)'], [1, 'rgba(255,220,160,0)']]); x.fillRect(0, 0, 960, 540);
    x.fillStyle = '#4d2f1c'; x.fillRect(330, 360, 300, 14); x.fillRect(350, 374, 14, 90); x.fillRect(596, 374, 14, 90);
  },
  5(x) {
    x.fillStyle = '#030405'; x.fillRect(0, 0, 960, 540);
    for (let i = 14; i >= 0; i--) { const k = i / 14, w = 480 * (1 - k * .93), h = 270 * (1 - k * .93); x.strokeStyle = `rgba(${90 + (1 - k) * 90 | 0},${100 + (1 - k) * 90 | 0},${110 + (1 - k) * 90 | 0},${.25 + (1 - k) * .4})`; x.lineWidth = 3 + (1 - k) * 8; x.strokeRect(480 - w, 270 - h, w * 2, h * 2); }
    x.fillStyle = 'rgba(120,130,140,.12)'; for (let i = 0; i < 9; i++) x.fillRect(0, 60 + i * 50, 960, 3);
    x.fillStyle = rg(x, 480, 270, 5, 120, [[0, 'rgba(0,0,0,.95)'], [1, 'rgba(0,0,0,0)']]); x.fillRect(300, 150, 360, 240);
    x.fillStyle = 'rgba(160,175,185,.4)'; x.fillRect(0, 500, 960, 8);
  },
  6(x) {
    x.fillStyle = lg(x, 0, 0, 0, 540, [[0, '#1c2226'], [1, '#0b0e10']]); x.fillRect(0, 0, 960, 540);
    floorGrid(x, 360, 480, '#262c30', '#0a0c0e', 5);
    x.fillStyle = lg(x, 0, 300, 0, 370, [[0, '#7a5a38'], [1, '#3a2814']]); x.fillRect(60, 300, 420, 70); x.fillStyle = '#2a1c0e'; x.fillRect(70, 370, 14, 110); x.fillRect(456, 370, 14, 110);
    for (let i = 0; i < 6; i++) { x.fillStyle = ['#aab3b9', '#8a949b', '#c3ccd1'][i % 3]; x.beginPath(); x.ellipse(110 + i * 60, 290 + (i % 2) * 6, 16, 12, 0, 0, 6.3); x.fill(); }
    for (let i = 0; i < 5; i++) { x.strokeStyle = '#555'; x.lineWidth = 2; x.beginPath(); x.moveTo(620 + i * 70, 0); x.lineTo(620 + i * 70, 100 + i * 14); x.stroke(); x.fillStyle = '#9aa3a9'; x.beginPath(); x.ellipse(620 + i * 70, 110 + i * 14, 14, 20, 0, 0, 6.3); x.fill(); }
    x.fillStyle = 'rgba(255,240,200,.18)'; x.fillRect(0, 0, 960, 540); x.fillStyle = rg(x, 560, 250, 10, 300, [[0, 'rgba(255,240,200,.25)'], [1, 'rgba(255,240,200,0)']]); x.fillRect(0, 0, 960, 540);
  },
  7(x) {
    x.fillStyle = lg(x, 0, 0, 0, 540, [[0, '#26343a'], [1, '#10181c']]); x.fillRect(0, 0, 960, 540);
    for (let i = 0; i < 960; i += 40) for (let j = 0; j < 420; j += 40) { x.fillStyle = (i / 40 + j / 40) % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.15)'; x.fillRect(i, j, 40, 40); }
    for (let i = 0; i < 3; i++) { x.fillStyle = lg(x, 120 + i * 260, 0, 320 + i * 260, 0, [[0, '#4a5a62'], [.5, '#6c7f88'], [1, '#3a484f']]); x.fillRect(120 + i * 260, 100, 200, 340); x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(120 + i * 260, 100, 200, 12); x.fillStyle = '#9aa'; x.fillRect(290 + i * 260, 260, 10, 30); }
    x.fillStyle = lg(x, 0, 420, 0, 540, [[0, '#1a2327'], [1, '#080c0e']]); x.fillRect(0, 420, 960, 120);
    x.fillStyle = 'rgba(200,230,255,.16)'; rrp(x, 400, 20, 160, 70, 4); x.fill();
  }
};
function ball0(x, cx, cy, r, col) { x.fillStyle = rg(x, cx - r * .3, cy - r * .35, r * .1, r * 1.1, [[0, '#fff'], [.4, col], [1, '#000']]); x.beginPath(); x.arc(cx, cy, r, 0, 6.3); x.fill(); }
function camLayer(id) { if (!CAML[id]) { const L = mk(960, 540); SCENE[id](L.x); CAML[id] = L; } return CAML[id]; }
