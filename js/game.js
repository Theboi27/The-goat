// ============================================================
// GAME — scene manager, fight engine, menus, select screens
// ============================================================
(() => {
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 1280, H = 720;

// ---------- portrait cache ----------
const portraits = {};
function portrait(id) {
  if (portraits[id]) return portraits[id];
  const c = document.createElement('canvas');
  c.width = 110; c.height = 150;
  const pc = c.getContext('2d');
  Humanoid.draw(pc, CHARACTERS[id], Humanoid.pose('idle'),
    { x: 55, y: 144, facing: 1, scale: 0.95, t: 0, shadow: false });
  portraits[id] = c;
  return c;
}

function drawText(t, x, y, size, color, align = 'center', font = "Impact, 'Arial Black', sans-serif", stroke = true) {
  ctx.font = `900 ${size}px ${font}`;
  ctx.textAlign = align;
  if (stroke) {
    ctx.lineWidth = Math.max(2, size / 9);
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.strokeText(t, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(t, x, y);
}

function roundRect(x, y, w, h, r, fill, strokeCol, lw = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (strokeCol) { ctx.strokeStyle = strokeCol; ctx.lineWidth = lw; ctx.stroke(); }
}

const G = {
  scene: 'menu',
  t: 0,
  menuIdx: 0,
  mode: null,          // 'story' | 'arcade' | 'vs2p' | 'vscpu'
  storyIdx: 0,
  arcade: null,
};

// ============================================================
// MAIN MENU — overview of Cyber City at night
// ============================================================
const MENU_ITEMS = [
  ['STORY MODE', 'The Cost of Justice — three acts against the Great Correction'],
  ['ARCADE', 'Climb the ladder. Dream Man waits at the Throne of Glass'],
  ['VERSUS (2 PLAYERS)', 'Local 1v1 — settle it like champions'],
  ['VERSUS CPU', 'Fight the machine'],
  ['CONTROLS', 'Key bindings for both players'],
];

const cars = [];
for (let i = 0; i < 7; i++) cars.push({ x: Math.random() * W, y: 90 + Math.random() * 260,
  v: (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 160), c: ['#ff4d6b','#42e8ff','#ffd76b','#b06bff'][i % 4] });

function drawMenu(dt) {
  STAGES.cityScape(ctx, G.t, W, H, Math.sin(G.t * 0.1) * 300, {
    skyTop: '#04060f', skyBot: '#101a33', far: '#0e1422', near: '#151d31',
    win: '#ffd76b', neon: ['#ff4d8d', '#42e8ff', '#b06bff', '#5dff9e'] });
  // flying cars (light streaks)
  for (const c of cars) {
    c.x += c.v * dt;
    if (c.x < -80) c.x = W + 60; if (c.x > W + 80) c.x = -60;
    ctx.save();
    ctx.strokeStyle = c.c; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.shadowColor = c.c; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - Math.sign(c.v) * 26, c.y); ctx.stroke();
    ctx.restore();
  }
  STAGES.rain(ctx, G.t, W, H);
  // ground haze
  const hg = ctx.createLinearGradient(0, 540, 0, H);
  hg.addColorStop(0, 'rgba(8,12,24,0)'); hg.addColorStop(1, 'rgba(8,12,24,0.95)');
  ctx.fillStyle = hg; ctx.fillRect(0, 540, W, H - 540);

  // title with electric flicker
  const flick = Math.random() < 0.05 ? 0.4 : 1;
  ctx.save();
  ctx.globalAlpha = flick;
  ctx.shadowColor = '#7fd4ff'; ctx.shadowBlur = 26;
  drawText('STATIC KNIGHT', W / 2, 150, 86, '#eaf8ff');
  ctx.shadowColor = '#ff9b3d'; ctx.shadowBlur = 18;
  drawText('COSMIC RECKONING', W / 2, 215, 44, '#ffce8a');
  ctx.restore();
  if (Math.random() < 0.03)
    FX.lightning(W / 2 + FX.rnd(-300, 300), 60, W / 2 + FX.rnd(-200, 200), 200, '#9be8ff');

  // menu items (backing panel keeps text readable over the city)
  const pg = ctx.createLinearGradient(0, 270, 0, 640);
  pg.addColorStop(0, 'rgba(3,6,14,0)');
  pg.addColorStop(0.25, 'rgba(3,6,14,0.78)');
  pg.addColorStop(0.85, 'rgba(3,6,14,0.78)');
  pg.addColorStop(1, 'rgba(3,6,14,0)');
  ctx.fillStyle = pg;
  ctx.fillRect(W / 2 - 360, 270, 720, 370);
  for (let i = 0; i < MENU_ITEMS.length; i++) {
    const y = 320 + i * 62;
    const sel = i === G.menuIdx;
    if (sel) {
      roundRect(W / 2 - 290, y - 34, 580, 50, 10, 'rgba(40,90,140,0.45)', '#7fd4ff', 2);
      drawText('▶', W / 2 - 320, y, 26, '#7fd4ff');
    }
    drawText(MENU_ITEMS[i][0], W / 2, y, sel ? 30 : 26, sel ? '#ffffff' : '#8fa6c0');
  }
  drawText(MENU_ITEMS[G.menuIdx][1], W / 2, 660, 17, '#6f87a6', 'center', 'Segoe UI, sans-serif', false);
  drawText('W/S — navigate     J — select', W / 2, 692, 15, '#4d6076', 'center', 'Segoe UI, sans-serif', false);
  if (secretsUnlocked())
    drawText('★ SECRETS UNLOCKED ★', W - 150, 30, 16, '#ffd76b');
  FX.update(dt); FX.draw(ctx);
}

function menuInput() {
  if (Input.key('KeyW') || Input.key('ArrowUp')) { G.menuIdx = (G.menuIdx + MENU_ITEMS.length - 1) % MENU_ITEMS.length; AudioSys.sfx('move'); }
  if (Input.key('KeyS') || Input.key('ArrowDown')) { G.menuIdx = (G.menuIdx + 1) % MENU_ITEMS.length; AudioSys.sfx('move'); }
  if (Input.key('KeyJ') || Input.key('Enter')) {
    AudioSys.sfx('confirm');
    const pick = ['story', 'arcade', 'vs2p', 'vscpu', 'controls'][G.menuIdx];
    if (pick === 'controls') { G.scene = 'controls'; return; }
    G.mode = pick;
    if (pick === 'story') { G.storyIdx = 0; advanceStory(); }
    else startSelect();
  }
}

// ============================================================
// CONTROLS SCREEN
// ============================================================
function drawControls(dt) {
  ctx.fillStyle = '#070a12'; ctx.fillRect(0, 0, W, H);
  STAGES.rain(ctx, G.t, W, H);
  drawText('CONTROLS', W / 2, 80, 52, '#eaf8ff');
  const rows = [
    ['', 'PLAYER 1', 'PLAYER 2'],
    ['Move', 'A / D', '← / →'],
    ['Jump / Fly (double-tap, fliers)', 'W', '↑'],
    ['Block / Crouch-Counter', 'S (hold)', '↓ (hold)'],
    ['Light Punch', 'J', 'Numpad 1  (or B)'],
    ['Heavy Punch', 'U', 'Numpad 4  (or G)'],
    ['Light Kick', 'K', 'Numpad 2  (or N)'],
    ['Heavy Kick', 'I', 'Numpad 5  (or H)'],
    ['Special', 'L', 'Numpad 3  (or M)'],
    ['FINISHER (full meter)', 'O', 'Numpad 6  (or ,)'],
    ['Hyper-Dash', 'Left Shift', 'Numpad 0  (or Right Shift)'],
    ['Launcher (uppercut)', 'S + J', '↓ + Numpad 1'],
  ];
  for (let i = 0; i < rows.length; i++) {
    const y = 140 + i * 40;
    const head = i === 0;
    if (!head && i % 2 === 0) { ctx.fillStyle = 'rgba(60,90,130,0.12)'; ctx.fillRect(140, y - 24, 1000, 36); }
    drawText(rows[i][0], 380, y, head ? 20 : 18, '#a8c0da', 'right', 'Segoe UI, sans-serif', false);
    drawText(rows[i][1], 560, y, head ? 22 : 18, head ? '#7fd4ff' : '#e8f2ff', 'center', 'Segoe UI, sans-serif', false);
    drawText(rows[i][2], 900, y, head ? 22 : 18, head ? '#ff9b8a' : '#e8f2ff', 'center', 'Segoe UI, sans-serif', false);
  }
  drawText('Perfect Counter: tap Block right before a hit lands.', W / 2, 648, 18, '#ffd76b', 'center', 'Segoe UI, sans-serif', false);
  drawText('Press J or Esc to return', W / 2, 690, 15, '#4d6076', 'center', 'Segoe UI, sans-serif', false);
  if (Input.key('KeyJ') || Input.key('Escape')) { AudioSys.sfx('back'); G.scene = 'menu'; }
}

// ============================================================
// CHARACTER SELECT — dual displays, per-character confirm FX
// ============================================================
const SEL = { cells: [], p1: 0, p2: 1, l1: false, l2: false, c1: null, c2: null,
  fx1: 0, fx2: 0, stageIdx: 0, cols: 8 };

function startSelect() {
  const ids = rosterIds();
  const cells = ids.slice();
  cells.splice(Math.ceil(cells.length / 2), 0, 'rand'); // random tile mid-grid
  SEL.cells = cells;
  SEL.cols = Math.ceil(cells.length / 2);
  SEL.p1 = 0; SEL.p2 = Math.min(1, cells.length - 1);
  SEL.l1 = false; SEL.l2 = false; SEL.c1 = null; SEL.c2 = null;
  SEL.fx1 = 0; SEL.fx2 = 0; SEL.stageIdx = 0;
  G.scene = 'select';
  AudioSys.music('menu');
}

function resolveCell(i) {
  const c = SEL.cells[i];
  if (c !== 'rand') return c;
  const ids = SEL.cells.filter(x => x !== 'rand');
  return ids[Math.floor(Math.random() * ids.length)];
}

// head-and-shoulders portrait for the grid tiles
const facePortraits = {};
function portraitFace(id) {
  if (facePortraits[id]) return facePortraits[id];
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const pc = c.getContext('2d');
  const ch = CHARACTERS[id];
  const g = pc.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, '#1c2333'); g.addColorStop(1, '#0c111c');
  pc.fillStyle = g; pc.fillRect(0, 0, 64, 64);
  const hs = ch.visual.heightScale || 1;
  // place ground so the head always sits near the top of the tile
  Humanoid.draw(pc, ch, Humanoid.pose(ch.stance || 'idle'),
    { x: 30, y: 18 + 223 * hs, facing: 1, scale: 2.3, t: 0.6, shadow: false });
  facePortraits[id] = c;
  return c;
}

function selectFxDraw(id, x, y, k) {
  // confirm animation per character archetype
  const fx = CHARACTERS[id].selectFx;
  const col = CHARACTERS[id].theme;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - k);
  if (fx === 'lightning') {
    for (let i = 0; i < 4; i++)
      if (Math.random() < 0.6) FX.lightning(x + FX.rnd(-90, 90), y - 320, x + FX.rnd(-40, 40), y - 60, col);
  } else if (fx === 'smoke') {
    if (k < 0.2) FX.smokePuff(x, y - 100, '#9aa3ad', 4, 1.2);
  } else if (fx === 'water') {
    if (k < 0.3) FX.smokePuff(x, y - 60, 'rgba(95,229,212,0.7)', 3, 1);
  } else if (fx === 'ice') {
    if (k < 0.2) FX.debris(x, y, '#cfeeff', 4);
  } else if (fx === 'light' || fx === 'silver') {
    ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y - 140, 40 + k * 220, 0, 6.29); ctx.stroke();
  } else if (fx === 'rock') {
    if (k < 0.2) { FX.debris(x, y, '#8a6f4d', 5); FX.shake(4); }
  } else if (fx === 'wind') {
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y - 140 - i * 30, 30 + ((k * 300 + i * 40) % 120), 0.6, 2.6);
      ctx.stroke();
    }
  } else if (fx === 'void') {
    ctx.fillStyle = col; ctx.globalAlpha = (1 - k) * 0.3;
    ctx.beginPath(); ctx.arc(x, y - 140, 60 + k * 160, 0, 6.29); ctx.fill();
  } else if (fx === 'rage') {
    ctx.strokeStyle = col; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y - 130, 30 + k * 180, 0, 6.29); ctx.stroke();
    if (k < 0.15) FX.shake(5);
  } else if (fx === 'gun') {
    if (k < 0.2) FX.impact(x + 60, y - 160, col, 0.8);
  } else if (fx === 'slash') {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 100 + k * 200, y - 240); ctx.lineTo(x - 40 + k * 200, y - 60);
    ctx.stroke();
  }
  ctx.restore();
}

// big tournament bust, MK-style: large fighter over an engraved nameplate
function drawBust(side, cell, locked, fxT, lockedId) {
  const x = side === 0 ? 240 : W - 240;
  const baseY = 545;
  const id = locked ? lockedId : (cell === 'rand' ? null : cell);
  const ch = id ? CHARACTERS[id] : null;
  const themeCol = ch ? ch.theme : '#caa84f';

  // arched alcove backdrop with character-colored inner glow
  ctx.save();
  const ag = ctx.createLinearGradient(x, 110, x, 560);
  ag.addColorStop(0, 'rgba(14,18,30,0.92)');
  ag.addColorStop(1, side === 0 ? 'rgba(28,58,92,0.45)' : 'rgba(92,40,38,0.45)');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.moveTo(x - 195, 560);
  ctx.lineTo(x - 195, 220);
  ctx.arc(x, 220, 195, Math.PI, 0);
  ctx.lineTo(x + 195, 560);
  ctx.closePath();
  ctx.fill();
  if (ch) {
    const ig = ctx.createRadialGradient(x, 330, 30, x, 330, 230);
    ig.addColorStop(0, themeCol + '33');
    ig.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ig;
    ctx.fillRect(x - 195, 110, 390, 450);
  }
  ctx.strokeStyle = locked ? themeCol : 'rgba(120,140,175,0.45)';
  ctx.lineWidth = locked ? 3.5 : 2;
  ctx.stroke();
  // clip the figure to the alcove so big busts stay framed
  ctx.clip();

  drawText(side === 0 ? 'P1' : (G.mode === 'vs2p' ? 'P2' : 'CPU'),
    x + (side === 0 ? -160 : 160), 150, 26, side === 0 ? '#7fd4ff' : '#ff9b8a');

  const t = G.t + side * 3;
  if (!ch) {
    // random tile hovered — mystery silhouette
    ctx.shadowColor = '#caa84f'; ctx.shadowBlur = 24;
    drawText('?', x, 400, 180, '#2c3142');
    ctx.shadowBlur = 0;
  } else {
    let pose;
    if (locked && fxT < 0.8) {
      const pk = Math.min(1, fxT * 2.2);
      const poseName = { lightning: 'cast', smoke: 'crouch', water: 'cast', ice: 'block',
        light: 'win', silver: 'sword_w', rock: 'slam_w', wind: 'fly', void: 'win2',
        rage: 'charge', gun: 'jab_x', slash: 'sword_x' }[ch.selectFx] || 'win';
      pose = Humanoid.lerp(Humanoid.pose(ch.stance || 'idle'), Humanoid.pose(poseName), pk);
    } else if (locked) {
      pose = Humanoid.pose(ch.selectFx === 'smoke' ? 'crouch' : 'win');
    } else {
      const p = { ...Humanoid.pose(ch.stance || 'idle') };
      p.hipY += Math.sin(t * 2.4) * 1.5;
      p.head += Math.sin(t * 1.6) * 0.03;
      pose = p;
    }
    // large bust: head-to-knees framing
    Humanoid.draw(ctx, ch, pose, { x, y: baseY + 130, facing: side === 0 ? 1 : -1,
      scale: 3.6, t, shadow: false, aura: locked ? ch.theme : null });
    if (locked && fxT < 1) selectFxDraw(id, x, baseY + 130, fxT);
  }
  ctx.restore();

  // engraved nameplate (skewed metal bar)
  const name = ch ? ch.name : 'RANDOM SELECT';
  const sub = ch ? ch.title : 'Fate picks your champion';
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 188, 566); ctx.lineTo(x + 188, 566);
  ctx.lineTo(x + 174, 612); ctx.lineTo(x - 174, 612);
  ctx.closePath();
  const ng = ctx.createLinearGradient(x, 566, x, 612);
  ng.addColorStop(0, '#2a3142'); ng.addColorStop(0.5, '#10141f'); ng.addColorStop(1, '#1c2230');
  ctx.fillStyle = ng; ctx.fill();
  ctx.strokeStyle = locked ? themeCol : '#46506a'; ctx.lineWidth = 2; ctx.stroke();
  drawText(name, x, 594, 23, locked ? themeCol : '#e6edf8');
  ctx.restore();
  drawText(sub, x, 632, 13, '#8fa6c0', 'center', 'Segoe UI, sans-serif', false);
}

function drawSelect(dt) {
  // gritty tournament backdrop: dark stone, drifting smoke, embers
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#11141d'); bg.addColorStop(0.5, '#1a1d27'); bg.addColorStop(1, '#0a0c12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(120,130,150,0.05)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse((i * 330 + G.t * 18) % (W + 300) - 150, 140 + i * 90, 220, 50, 0, 0, 6.29);
    ctx.fill();
  }
  STAGES.embersFx(ctx, G.t * 0.5, W, H, 'rgba(180,150,90,0.5)');

  // ---- title banner with emblem (MK-style header) ----
  const bnG = ctx.createLinearGradient(0, 14, 0, 92);
  bnG.addColorStop(0, '#2c3344'); bnG.addColorStop(0.5, '#12161f'); bnG.addColorStop(1, '#232a3a');
  roundRect(W / 2 - 350, 14, 700, 78, 10, null, null);
  ctx.fillStyle = bnG; ctx.fill();
  roundRect(W / 2 - 350, 14, 700, 78, 10, null, '#4d5a75', 2.5);
  roundRect(W / 2 - 344, 20, 688, 66, 8, null, 'rgba(160,180,220,0.18)', 1);
  ctx.save();
  const mg = ctx.createLinearGradient(0, 30, 0, 80);
  mg.addColorStop(0, '#f2f7ff'); mg.addColorStop(0.55, '#9fb3cf'); mg.addColorStop(1, '#5d7090');
  ctx.font = "900 44px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = 'right'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeText('STATIC', W / 2 - 58, 70); ctx.fillStyle = mg; ctx.fillText('STATIC', W / 2 - 58, 70);
  ctx.textAlign = 'left';
  ctx.strokeText('KNIGHT', W / 2 + 58, 70); ctx.fillText('KNIGHT', W / 2 + 58, 70);
  // shield-and-bolt emblem between the words
  ctx.translate(W / 2, 52);
  ctx.shadowColor = '#9fe7ff'; ctx.shadowBlur = 12;
  ctx.strokeStyle = '#9fe7ff'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-17, -19); ctx.lineTo(17, -19); ctx.lineTo(15, 9);
  ctx.quadraticCurveTo(0, 25, -15, 9); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = '#cfeeff';
  ctx.beginPath();
  ctx.moveTo(4, -14); ctx.lineTo(-7, 1); ctx.lineTo(-0.5, 2);
  ctx.lineTo(-4, 16); ctx.lineTo(8, -1); ctx.lineTo(1.5, -2);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  if (SEL.l1) SEL.fx1 += dt; if (SEL.l2) SEL.fx2 += dt;
  drawBust(0, SEL.cells[SEL.p1], SEL.l1, SEL.fx1, SEL.c1);
  drawBust(1, SEL.cells[SEL.p2], SEL.l2, SEL.fx2, SEL.c2);

  // VS emblem
  ctx.save();
  ctx.shadowColor = '#ff9b3d'; ctx.shadowBlur = 18 + Math.sin(G.t * 4) * 6;
  drawText('VS', W / 2, 370, 70, '#ffce8a');
  ctx.restore();

  // ---- full-width roster tile grid ----
  const cells = SEL.cells;
  const cols = SEL.cols, ts = 58, gap = 6;
  const gx = W / 2 - (cols * (ts + gap)) / 2, gy = 596;
  for (let i = 0; i < cells.length; i++) {
    const cx = gx + (i % cols) * (ts + gap), cy = gy + Math.floor(i / cols) * (ts + gap);
    const cell = cells[i];
    const hov1 = i === SEL.p1 && !SEL.l1, hov2 = i === SEL.p2 && !SEL.l2;
    const lock1 = i === SEL.p1 && SEL.l1, lock2 = i === SEL.p2 && SEL.l2;
    if (cell === 'rand') {
      roundRect(cx, cy, ts, ts, 5, '#1a1408', '#8a7434', 2);
      drawText('?', cx + ts / 2, cy + ts / 2 + 13, 36, '#caa84f');
    } else {
      const ch = CHARACTERS[cell];
      ctx.save();
      ctx.beginPath(); ctx.roundRect(cx, cy, ts, ts, 5); ctx.clip();
      ctx.drawImage(portraitFace(cell), cx, cy, ts, ts);
      if (ch.secret) {
        ctx.fillStyle = 'rgba(160,130,40,0.18)'; ctx.fillRect(cx, cy, ts, ts);
      }
      ctx.restore();
      roundRect(cx, cy, ts, ts, 5, null,
        ch.secret ? '#8a7434' : '#3a4150', 1.6);
    }
    // selection cursors
    if (hov1 || lock1 || hov2 || lock2) {
      ctx.save();
      const col = (hov1 || lock1) && (hov2 || lock2) ? '#e8d8ff'
        : (hov1 || lock1) ? '#46c8ff' : '#ff7a4d';
      ctx.shadowColor = col; ctx.shadowBlur = (lock1 || lock2) ? 14 : 8;
      roundRect(cx - 2, cy - 2, ts + 4, ts + 4, 6, null, col, 3);
      ctx.restore();
      if (hov1 || lock1) drawText('1', cx + 9, cy + 16, 15, '#9fe2ff');
      if (hov2 || lock2) drawText('2', cx + ts - 9, cy + 16, 15, '#ffb09a');
    }
  }

  FX.update(dt); FX.draw(ctx);
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // ---- input ----
  const moveP = (who, d) => {
    const cur = who === 1 ? SEL.p1 : SEL.p2;
    const nxt = (cur + d + cells.length) % cells.length;
    if (who === 1) SEL.p1 = nxt; else SEL.p2 = nxt;
    AudioSys.sfx('move');
  };
  if (!SEL.l1) {
    if (Input.key('KeyA')) moveP(1, -1);
    if (Input.key('KeyD')) moveP(1, 1);
    if (Input.key('KeyW')) moveP(1, -cols);
    if (Input.key('KeyS')) moveP(1, cols);
    if (Input.key('KeyJ')) {
      SEL.c1 = resolveCell(SEL.p1);
      SEL.l1 = true; SEL.fx1 = 0;
      AudioSys.sfx('confirm'); AudioSys.sfx(pickSfx(SEL.c1));
    }
  }
  const p2human = G.mode === 'vs2p';
  if (!SEL.l2 && p2human) {
    if (Input.key('ArrowLeft')) moveP(2, -1);
    if (Input.key('ArrowRight')) moveP(2, 1);
    if (Input.key('ArrowUp')) moveP(2, -cols);
    if (Input.key('ArrowDown')) moveP(2, cols);
    if (Input.key('Numpad1') || Input.key('KeyB') || Input.key('Enter')) {
      SEL.c2 = resolveCell(SEL.p2);
      SEL.l2 = true; SEL.fx2 = 0;
      AudioSys.sfx('confirm'); AudioSys.sfx(pickSfx(SEL.c2));
    }
  } else if (!SEL.l2 && !p2human && SEL.l1 && SEL.fx1 > 0.5) {
    // CPU roulette pick sweeping the grid
    SEL.p2 = (SEL.p2 + 1) % cells.length;
    if (SEL.fx1 > 1.4) {
      SEL.c2 = resolveCell(SEL.p2);
      SEL.l2 = true; SEL.fx2 = 0;
      AudioSys.sfx('confirm');
    }
  }
  if (Input.key('Escape')) { AudioSys.sfx('back'); G.scene = 'menu'; }

  if (SEL.l1 && SEL.l2 && Math.min(SEL.fx1, SEL.fx2) > 1.1) {
    if (G.mode === 'arcade') {
      startArcade(SEL.c1);
    } else {
      G.scene = 'stageselect';
      SEL.stageList = STAGES.list();
    }
  }
}

function pickSfx(id) {
  return { lightning: 'zap', smoke: 'smoke', water: 'splash', ice: 'ice', light: 'beam',
    silver: 'slash', rock: 'heavy', wind: 'whoosh', void: 'teleport', rage: 'charge',
    gun: 'gun', slash: 'slash' }[CHARACTERS[id].selectFx] || 'confirm';
}

// ============================================================
// STAGE SELECT
// ============================================================
function drawStageSelect(dt) {
  ctx.fillStyle = '#060912'; ctx.fillRect(0, 0, W, H);
  drawText('SELECT ARENA', W / 2, 70, 42, '#eaf8ff');
  const list = SEL.stageList;
  const id = list[SEL.stageIdx];
  const st = STAGES.S[id];
  // live stage preview
  ctx.save();
  ctx.beginPath(); ctx.roundRect(W / 2 - 420, 120, 840, 430, 14); ctx.clip();
  ctx.translate(W / 2 - 420, 120); ctx.scale(840 / W, 430 / H);
  st.draw(ctx, G.t, W, H, 0);
  ctx.restore();
  roundRect(W / 2 - 420, 120, 840, 430, 14, null, '#7fd4ff', 3);
  drawText(st.name, W / 2, 605, 36, st.secret ? '#ffd76b' : '#ffffff');
  drawText(`◀  ${SEL.stageIdx + 1} / ${list.length}  ▶`, W / 2, 650, 20, '#8fa6c0');
  drawText('A/D — browse     J — fight', W / 2, 695, 15, '#4d6076', 'center', 'Segoe UI, sans-serif', false);
  if (Input.key('KeyA') || Input.key('ArrowLeft')) { SEL.stageIdx = (SEL.stageIdx + list.length - 1) % list.length; AudioSys.sfx('move'); }
  if (Input.key('KeyD') || Input.key('ArrowRight')) { SEL.stageIdx = (SEL.stageIdx + 1) % list.length; AudioSys.sfx('move'); }
  if (Input.key('Escape')) { AudioSys.sfx('back'); startSelect(); }
  if (Input.key('KeyJ') || Input.key('Enter') || Input.key('Numpad1')) {
    AudioSys.sfx('confirm');
    startFight({ p1: SEL.c1, p2: SEL.c2, stage: id,
      cpu2: G.mode !== 'vs2p', rounds: 2 });
  }
}

// ============================================================
// FIGHT ENGINE
// ============================================================
const F = {}; // fight state

function cloneChar(id, opts = {}) {
  const c = structuredClone(CHARACTERS[id]);
  if (opts.name) { c.name = opts.name; }
  if (opts.dark) {
    c.visual.suit.torso = '#15101e'; c.visual.suit.arms = '#1a1426'; c.visual.suit.legs = '#120e1a';
    c.visual.aura = 'rgba(150,60,220,0.5)';
    c.visual.eyes = { glow: '#d05aff' };
    if (c.visual.hair) c.visual.hair.color = '#0d0815';
    c.theme = '#b95aff';
  }
  if (opts.noArmor) { // Dream Man phase 3 — being of pure thought
    c.visual.mask = 'none';
    c.visual.hair = { style: 'bald', color: '#222' };
    c.visual.aura = 'rgba(255,170,90,0.85)';
    c.visual.suit.torso = '#1a1022'; c.visual.pauldrons = null; c.visual.cape = null;
    c.visual.eyes = { glow: '#ffd9a0' };
  }
  return c;
}

function startFight(cfg) {
  F.cfg = cfg;
  F.stage = STAGES.S[cfg.stage];
  F.roundsToWin = cfg.rounds || 2;
  F.round = 1;
  F.wins = [0, 0];
  F.story = cfg.story || null;
  setupRound(true);
  G.scene = 'fight';
  AudioSys.music(F.stage.music || 'fight');
}

function setupRound(first) {
  const cfg = F.cfg;
  F.f1 = new Fighter(cfg.p1, 0, 420, 1, !!cfg.cpu1, cfg.ai || 2);
  F.f2 = new Fighter(cfg.p2, 1, 860, -1, !!cfg.cpu2, cfg.ai || 2);
  if (cfg.chOverride2) F.f2.ch = cfg.chOverride2;
  if (cfg.chOverride1) F.f1.ch = cfg.chOverride1;
  if (cfg.hpMul2) { F.f2.maxHp *= cfg.hpMul2; F.f2.hp = F.f2.maxHp; }
  F.projectiles = [];
  F.cine = [];     // beams, weights, spheres, shockwaves
  F.superBanner = null;
  F.timer = 99;
  F.koT = 0;
  F.phase = first ? 'entrance' : 'roundbanner';
  F.phaseT = 0;
  F.dlg = null;
  F.camX = 0;
  F.fightActive = false;
  FX.clear();
  if (first) {
    F.f1.beginEntrance(F);
    F.f2.beginEntrance(F);
  }
}

// game-facing API used by Fighter
F.resolveHit = (att, def, m, hx, hy) => {
  if (['down', 'getup', 'entrance', 'ko'].includes(def.state)) return;
  const scale = att.combo > 0 ? Math.max(0.45, 1 - att.combo * 0.07) : 1;
  let dmg = m.dmg * att.powerMul * scale / def.ch.stats.defense;
  const dealt = def.takeHit(dmg, m, att, F);
  if (dealt === 0) return; // perfect counter consumed it
  const blocked = dealt < dmg * 0.5;
  def.hp = Math.max(0, def.hp - dealt);
  if (blocked) { att.meter = Math.min(100, att.meter + 3); return; }

  // ---- clean hit: impact frames + reactions ----
  const power = m.power || 1;
  att.hitstop = 0.045 + power * 0.045;          // both freeze: impact frame
  def.hitstop = att.hitstop;
  def.flashT = 0.12;
  AudioSys.sfx(m.sfx || 'punch');
  FX.impact(hx, hy, att.ch.theme, power);
  FX.shake(2.5 + power * 4);
  if (power >= 1.4) FX.flash('rgba(255,255,255,0.13)', 0.07);

  att.combo++; att.comboT = 1.1; att.comboDmg += dealt;
  if (att.combo >= 2)
    FX.popup(att.x, F.stage.floorY - 270, `${att.combo} HIT${att.combo > 2 ? 'S' : ''}!`,
      att.ch.theme, 26 + Math.min(20, att.combo * 2));
  att.meter = Math.min(100, att.meter + dealt * 0.16);
  def.meter = Math.min(100, def.meter + dealt * 0.09);
  if (def.ch.adaptive) def.adaptStacks = Math.min(12, def.adaptStacks + 1);

  def.vx = att.facing * m.kb * (1 + power * 0.2);
  const juggled = def.state === 'launch' || def.airH > 8; // already airborne
  if (juggled) {
    // air juggle: pop them back up so the string can continue
    def.vy = -(Math.max(m.kup, 180) + 150);
    def.airH = Math.max(def.airH, 0.1);
    def.flying = false;
    def.setState('launch');
  } else if (m.kup > 250 || m.launcher || def.hp <= 0) {
    def.vy = -(Math.max(m.kup, def.hp <= 0 ? 460 : 0) + 140);
    def.airH = Math.max(def.airH, 0.1);
    def.flying = false;
    def.setState('launch');
  } else {
    def.setState('hit', m.stun);
    if (m.kup) { def.vy = -m.kup; def.airH = Math.max(def.airH, 0.1); }
  }
  if (def.hp <= 0 && F.phase === 'fight') beginKO(att, def);
};

F.applyDamage = (att, def, dmg, kind, o = {}) => {
  if (['down', 'getup', 'entrance', 'ko'].includes(def.state)) return;
  const dealt = def.takeHit(dmg, o, att, F);
  if (dealt === 0) return;
  def.hp = Math.max(0, def.hp - dealt);
  if (dealt < dmg * 0.5) { AudioSys.sfx('block'); return; }
  AudioSys.sfx(o.sfx || 'heavy');
  const hy = F.stage.floorY - def.airH - 110;
  FX.impact(def.x, hy, att.ch.theme, o.power || 1.3);
  FX.shake(4 + (o.power || 1) * 4);
  def.flashT = 0.12;
  def.hitstop = 0.07; att.hitstop = Math.min(att.hitstop, 0.05);
  att.combo++; att.comboT = 1.1; att.comboDmg += dealt;
  att.meter = Math.min(100, att.meter + dealt * 0.1);
  if (def.ch.adaptive) def.adaptStacks = Math.min(12, def.adaptStacks + 1);
  def.vx = (def.x >= att.x ? 1 : -1) * (o.kb || 160);
  if ((o.kup || 0) > 250 || def.hp <= 0) {
    def.vy = -(Math.max(o.kup || 0, 420)); def.airH = Math.max(def.airH, 0.1);
    def.flying = false; def.setState('launch');
  } else def.setState('hit', o.stun || 0.35);
  if (o.freeze) { def.freezeT = 1.4; AudioSys.sfx('ice'); }
  if (o.reverse) { def.reverseT = 3; FX.popup(def.x, 280, 'RELATIVITY: CONTROLS REVERSED', '#c08aff', 20); }
  if (def.hp <= 0 && F.phase === 'fight') beginKO(att, def);
};

F.fireBeam = (owner, opp, dmg, color, big, after) => {
  const y = F.stage.floorY - owner.airH - 105;
  F.cine.push({ kind: 'beam', owner, x: owner.x + owner.facing * 30, y, dir: owner.facing,
    color, big, t: 0, dur: big ? 0.55 : 0.3, dmg, after, hitDone: false });
  AudioSys.sfx('beam');
  if (big) FX.shake(10);
};
F.dropWeight = (owner, opp, dmg, color, big) => {
  F.cine.push({ kind: 'weight', owner, x: opp.x, y: -160, vy: 0, dmg, color, big, t: 0, hitDone: false });
  FX.popup(opp.x, 200, big ? 'DREAM LOGIC' : '16 TONS', color, 24);
};
F.sphereCrush = (owner, opp, dmg, color, after) => {
  F.cine.push({ kind: 'sphere', owner, target: opp, dmg, color, after, t: 0, dur: 1.0, hitDone: false });
  AudioSys.sfx('splash');
};
F.groundSlam = (owner, opp, dmg, color, after) => {
  F.cine.push({ kind: 'wave', owner, x: owner.x, dir: owner.facing, dmg, color, after, t: 0, hitDone: false });
  AudioSys.sfx('heavy');
  FX.shake(16);
  FX.debris(owner.x, F.stage.floorY, '#8a7a5d', 16);
};

function beginKO(att, def) {
  F.phase = 'ko'; F.phaseT = 0;
  F.fightActive = false;
  AudioSys.sfx('ko');
  FX.flash('rgba(255,255,255,0.5)', 0.3);
  FX.slowmo(1.0, 0.22);
  FX.shake(18);
  F.koWinner = att; F.koLoser = def;
}

function updateCine(dt) {
  for (let i = F.cine.length - 1; i >= 0; i--) {
    const c = F.cine[i];
    c.t += dt;
    const opp = c.owner === F.f1 ? F.f2 : F.f1;
    if (c.kind === 'beam') {
      if (!c.hitDone && c.t > 0.08) {
        // beam hits anything in its horizontal path
        const oy = F.stage.floorY - opp.airH - 110;
        if (Math.abs(oy - c.y) < 90 && Math.sign(opp.x - c.x) === c.dir) {
          c.hitDone = true;
          F.applyDamage(c.owner, opp, c.dmg, 'beam',
            { kb: 380, kup: c.big ? 380 : 100, power: c.big ? 2 : 1.2, sfx: 'heavy',
              freeze: c.after === 'freeze', reverse: c.after === 'reverse' });
        }
      }
      if (c.t > c.dur) F.cine.splice(i, 1);
    } else if (c.kind === 'weight') {
      c.vy += 2600 * dt; c.y += c.vy * dt;
      const ground = F.stage.floorY - 70;
      if (c.y >= ground) {
        if (!c.hitDone) {
          c.hitDone = true;
          AudioSys.sfx('weight'); FX.shake(16);
          FX.debris(c.x, F.stage.floorY, '#777', 14);
          FX.impact(c.x, F.stage.floorY - 50, c.color, 2);
          if (Math.abs(opp.x - c.x) < 95 && opp.airH < 120)
            F.applyDamage(c.owner, opp, c.dmg, 'weight', { kb: 240, kup: 460, power: 2, sfx: 'heavy' });
        }
        c.y = ground;
        if (c.t > 1.6) F.cine.splice(i, 1);
      }
    } else if (c.kind === 'sphere') {
      const opp2 = c.target;
      if (!c.hitDone && c.t > c.dur * 0.8) {
        c.hitDone = true;
        if (Math.abs(opp2.x - c.owner.x) < 460)
          F.applyDamage(c.owner, opp2, c.dmg, 'sphere',
            { kb: 300, kup: 420, power: 2, sfx: 'splash', freeze: c.after === 'freeze' });
      }
      if (c.t > c.dur + 0.3) F.cine.splice(i, 1);
    } else if (c.kind === 'wave') {
      c.x += c.dir * 700 * dt;
      if (!c.hitDone && Math.abs(opp.x - c.x) < 60 && opp.airH < 60) {
        c.hitDone = true;
        F.applyDamage(c.owner, opp, c.dmg, 'wave',
          { kb: 260, kup: 480, power: 2, sfx: 'heavy', freeze: c.after === 'freeze' });
      }
      if (Math.random() < 0.7) FX.debris(c.x, F.stage.floorY, '#9a8a6d', 2);
      if (c.x < -60 || c.x > W + 60) F.cine.splice(i, 1);
    }
  }
}

function drawCine() {
  for (const c of F.cine) {
    ctx.save();
    if (c.kind === 'beam') {
      const k = c.t / c.dur;
      const wdt = (c.big ? 70 : 34) * (k < 0.25 ? k * 4 : 1 - Math.max(0, k - 0.8) * 5);
      const endX = c.dir > 0 ? W + 40 : -40;
      const bg = ctx.createLinearGradient(c.x, 0, endX, 0);
      bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.25, c.color); bg.addColorStop(1, c.color);
      ctx.shadowColor = c.color; ctx.shadowBlur = 30;
      ctx.fillStyle = bg;
      ctx.fillRect(Math.min(c.x, endX), c.y - wdt / 2, Math.abs(endX - c.x), wdt);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(Math.min(c.x, endX), c.y - wdt / 6, Math.abs(endX - c.x), wdt / 3);
    } else if (c.kind === 'weight') {
      // toon-force 16-ton weight
      ctx.fillStyle = '#3c4350';
      ctx.strokeStyle = '#13161c'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.x - 90, c.y + 70); ctx.lineTo(c.x + 90, c.y + 70);
      ctx.lineTo(c.x + 55, c.y - 20); ctx.lineTo(c.x - 55, c.y - 20);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(c.x - 18, c.y - 44, 36, 26);
      ctx.strokeRect(c.x - 18, c.y - 44, 36, 26);
      drawText(c.big ? '∞ TON' : '16 TON', c.x, c.y + 38, 26, '#cdd6e4');
    } else if (c.kind === 'sphere') {
      const opp2 = c.target;
      const k = Math.min(1, c.t / (c.dur * 0.8));
      const r = 150 * (1 - k * 0.75);
      const cx2 = opp2.x, cy2 = F.stage.floorY - opp2.airH - 105;
      ctx.globalAlpha = 0.55;
      const sg = ctx.createRadialGradient(cx2, cy2, r * 0.2, cx2, cy2, r);
      sg.addColorStop(0, 'rgba(255,255,255,0.5)'); sg.addColorStop(1, c.color);
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, 6.29); ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = c.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, 6.29); ctx.stroke();
      if (c.hitDone && c.t < c.dur + 0.2) FX.impact(cx2, cy2, c.color, 2);
    } else if (c.kind === 'wave') {
      ctx.fillStyle = c.color;
      ctx.shadowColor = c.color; ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(c.x - 40, F.stage.floorY);
      ctx.quadraticCurveTo(c.x, F.stage.floorY - 90, c.x + 40, F.stage.floorY);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ---------------- fight HUD (tournament style) ----------------
function metalText(t, x, y, size, align = 'center') {
  ctx.save();
  ctx.font = `900 ${size}px Impact, 'Arial Black', sans-serif`;
  ctx.textAlign = align;
  ctx.lineWidth = Math.max(2.5, size / 8);
  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.strokeText(t, x, y);
  const g = ctx.createLinearGradient(0, y - size, 0, y + 3);
  g.addColorStop(0, '#fbfdff'); g.addColorStop(0.5, '#b9c8de'); g.addColorStop(0.55, '#7d8fae');
  g.addColorStop(1, '#e8f0fb');
  ctx.fillStyle = g;
  ctx.fillText(t, x, y);
  ctx.restore();
}

function drawHealthBar(f, side) {
  const flip = side === 1;
  const bw = 470, bh = 26, y = 26;
  const x0 = flip ? W - 46 - bw : 46;       // outer edge
  const skew = 16;
  // skewed plate path (slants toward screen center)
  const plate = (inset, dy0, dy1) => {
    ctx.beginPath();
    if (!flip) {
      ctx.moveTo(x0 + inset, y + dy0);
      ctx.lineTo(x0 + bw - inset, y + dy0);
      ctx.lineTo(x0 + bw - skew - inset, y + bh - dy1);
      ctx.lineTo(x0 + inset, y + bh - dy1);
    } else {
      ctx.moveTo(x0 + inset, y + dy0);
      ctx.lineTo(x0 + bw - inset, y + dy0);
      ctx.lineTo(x0 + bw - inset, y + bh - dy1);
      ctx.lineTo(x0 + skew + inset, y + bh - dy1);
    }
    ctx.closePath();
  };
  // backdrop + double frame (dark steel with gilt inner line)
  plate(0, 0, 0);
  ctx.fillStyle = 'rgba(6,9,16,0.88)'; ctx.fill();
  ctx.strokeStyle = '#454f66'; ctx.lineWidth = 2.5; ctx.stroke();
  plate(3, 3, 3);
  ctx.strokeStyle = 'rgba(214,184,120,0.45)'; ctx.lineWidth = 1; ctx.stroke();
  // damage trail (drains slowly behind the real bar)
  ctx.save();
  plate(4, 4, 4); ctx.clip();
  const kTrail = Math.max(0, f.dispHp / f.maxHp);
  const kHp = Math.max(0, f.hp / f.maxHp);
  ctx.fillStyle = '#b3402c';
  if (!flip) ctx.fillRect(x0, y, bw * kTrail, bh);
  else ctx.fillRect(x0 + bw * (1 - kTrail), y, bw * kTrail, bh);
  // live health: theme-tinted gradient
  const hg = ctx.createLinearGradient(0, y, 0, y + bh);
  if (kHp > 0.35) { hg.addColorStop(0, '#e4ffd2'); hg.addColorStop(0.45, '#62d957'); hg.addColorStop(1, '#1f8c3c'); }
  else { hg.addColorStop(0, '#ffe2b0'); hg.addColorStop(0.45, '#ffae3d'); hg.addColorStop(1, '#c2611c'); }
  ctx.fillStyle = hg;
  if (!flip) ctx.fillRect(x0, y, bw * kHp, bh);
  else ctx.fillRect(x0 + bw * (1 - kHp), y, bw * kHp, bh);
  // gloss
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(x0, y + 3, bw, 6);
  ctx.restore();
  // name engraved on the plate
  const name = F.cfg.rename2 && side === 1 ? F.cfg.rename2 : f.ch.name;
  drawText(name, flip ? x0 + bw - 14 : x0 + 14, y + 19, 17, '#f2f7ff', flip ? 'right' : 'left');
  // round-win gems (diamonds under the inner end)
  for (let i = 0; i < F.roundsToWin; i++) {
    const gx = flip ? x0 + skew + 16 + i * 24 : x0 + bw - skew - 16 - i * 24;
    const gy = y + bh + 12;
    ctx.save();
    ctx.translate(gx, gy); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = i < F.wins[side] ? '#ffd76b' : 'rgba(30,40,58,0.95)';
    if (i < F.wins[side]) { ctx.shadowColor = '#ffd76b'; ctx.shadowBlur = 9; }
    ctx.fillRect(-6, -6, 12, 12);
    ctx.strokeStyle = '#0a0f1a'; ctx.lineWidth = 2; ctx.strokeRect(-6, -6, 12, 12);
    ctx.restore();
  }
  // portrait chip
  const px = flip ? W - 44 - 52 : 44;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(px, y + bh + 8, 52, 52, 6); ctx.clip();
  ctx.drawImage(portraitFace(f.ch.id), px, y + bh + 8, 52, 52);
  ctx.restore();
  roundRect(px, y + bh + 8, 52, 52, 6, null, f.ch.theme, 2);
  // super meter (segmented) + stamina
  const mx = flip ? px - 8 - 264 : px + 60;
  const my = y + bh + 16;
  roundRect(mx, my, 264, 13, 4, 'rgba(6,9,16,0.88)', '#454f66', 1.5);
  const full = f.meter >= 100;
  ctx.save();
  ctx.beginPath(); ctx.roundRect(mx + 2, my + 2, 260, 9, 3); ctx.clip();
  ctx.fillStyle = full ? (Math.sin(G.t * 10) > 0 ? '#ffffff' : f.ch.theme) : f.ch.theme;
  const mw = 260 * Math.min(1, f.meter / 100);
  ctx.fillRect(flip ? mx + 262 - mw : mx + 2, my + 2, mw, 9);
  ctx.fillStyle = 'rgba(6,9,16,0.9)';
  for (let i = 1; i < 4; i++) ctx.fillRect(mx + 2 + i * 65, my + 2, 2, 9);
  ctx.restore();
  if (full) drawText('FINISHER READY', mx + 132, my - 3, 11, '#ffd76b');
  roundRect(mx, my + 17, 180, 7, 3, 'rgba(6,9,16,0.88)', '#454f66', 1);
  ctx.fillStyle = '#5dc0ff';
  const sw = 176 * (f.stamina / 100);
  ctx.fillRect(flip ? mx + 178 - sw : mx + 2, my + 18.5, sw, 4);
}

// ornate center timer medallion
function drawTimerMedallion() {
  const cx = W / 2, cy = 46;
  ctx.save();
  // side wings
  ctx.fillStyle = '#1a2030';
  ctx.strokeStyle = '#caa84f'; ctx.lineWidth = 2;
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + sgn * 30, 32);
    ctx.lineTo(cx + sgn * 78, 38);
    ctx.lineTo(cx + sgn * 64, 52);
    ctx.lineTo(cx + sgn * 30, 58);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  // medallion disc
  const dg = ctx.createRadialGradient(cx - 8, cy - 10, 4, cx, cy, 38);
  dg.addColorStop(0, '#2e3a52'); dg.addColorStop(1, '#0a0e18');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.arc(cx, cy, 36, 0, 6.29); ctx.fill();
  ctx.strokeStyle = '#caa84f'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 36, 0, 6.29); ctx.stroke();
  ctx.strokeStyle = 'rgba(214,184,120,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 6.29); ctx.stroke();
  const tLeft = Math.max(0, Math.ceil(F.timer));
  drawText(String(tLeft), cx, cy + 12, 32, tLeft < 15 ? '#ff5a5a' : '#eaf2ff');
  ctx.restore();
}

function drawFight(dt) {
  const ts = FX.timeScale();
  const fdt = dt * ts;
  F.phaseT += dt;

  // camera follows midpoint
  const targetCam = ((F.f1.x + F.f2.x) / 2 - W / 2) * 0.5;
  F.camX += (targetCam - F.camX) * Math.min(1, dt * 5);

  // ---- update ----
  if (F.phase === 'fight') {
    F.timer -= fdt;
    if (F.timer <= 0) {
      const winner = F.f1.hp / F.f1.maxHp >= F.f2.hp / F.f2.maxHp ? F.f1 : F.f2;
      beginKO(winner, winner === F.f1 ? F.f2 : F.f1);
      F.timeOut = true;
    }
  }
  F.fightActive = F.phase === 'fight';
  F.f1.update(fdt, F.f2, F);
  F.f2.update(fdt, F.f1, F);
  // body push apart
  if (Math.abs(F.f1.x - F.f2.x) < 58 && Math.abs(F.f1.airH - F.f2.airH) < 120) {
    const mid = (F.f1.x + F.f2.x) / 2;
    const push = (58 - Math.abs(F.f1.x - F.f2.x)) / 2;
    if (F.f1.x <= F.f2.x) { F.f1.x -= push; F.f2.x += push; }
    else { F.f1.x += push; F.f2.x -= push; }
  }
  // projectiles
  for (let i = F.projectiles.length - 1; i >= 0; i--) {
    const p = F.projectiles[i];
    p.update(fdt);
    const opp = p.owner === F.f1 ? F.f2 : F.f1;
    const oTop = F.stage.floorY - opp.airH - 175, oBot = F.stage.floorY - opp.airH;
    if (!p.dead && Math.abs(p.x - opp.x) < 42 && p.y > oTop && p.y < oBot) {
      p.dead = true;
      F.applyDamage(p.owner, opp, p.def.dmg * p.owner.powerMul, 'proj',
        { kb: 200, kup: 60, power: 1, stun: 0.32, sfx: p.def.sfx });
    }
    if (p.dead) F.projectiles.splice(i, 1);
  }
  updateCine(fdt);
  FX.update(fdt);

  // ---- phases ----
  if (F.phase === 'entrance' && F.phaseT > 1.75) {
    F.phase = 'dialogue'; F.phaseT = 0; F.dlgLine = 0; F.dlgChars = 0;
    F.dlg = getDialogue();
  } else if (F.phase === 'dialogue') {
    F.dlgChars += dt * 40;
    const line = F.dlg[F.dlgLine];
    const skip = Input.key('KeyJ') || Input.key('Enter') || Input.key('Numpad1') || (F.phaseT > 3.6);
    if (skip) {
      if (F.dlgChars < line.text.length) F.dlgChars = line.text.length;
      else {
        F.dlgLine++; F.dlgChars = 0; F.phaseT = 0;
        AudioSys.sfx('select');
        if (F.dlgLine >= F.dlg.length) { F.phase = 'roundbanner'; F.phaseT = 0; AudioSys.sfx('round'); }
      }
    }
  } else if (F.phase === 'roundbanner') {
    if (F.phaseT > 1.5) { F.phase = 'fight'; F.phaseT = 0; AudioSys.sfx('fight'); }
  } else if (F.phase === 'ko') {
    if (F.phaseT > 2.0) {
      const side = F.koWinner === F.f1 ? 0 : 1;
      F.wins[side]++;
      if (F.wins[side] >= F.roundsToWin) {
        F.phase = 'victory'; F.phaseT = 0;
        F.koWinner.setState('win');
        AudioSys.sfx('win');
      } else {
        F.round++;
        const w = F.wins.slice();
        setupRound(false);
        F.wins = w;
        AudioSys.sfx('round');
      }
    }
  } else if (F.phase === 'victory') {
    if (F.phaseT > 1.2) handleVictoryInput();
  }

  // health-bar damage trail eases down after hits
  for (const f of [F.f1, F.f2]) {
    if (f.dispHp < f.hp) f.dispHp = f.hp;
    f.dispHp += (f.hp - f.dispHp) * Math.min(1, dt * 2.4);
  }

  // ---- draw ----
  const [shx, shy] = FX.shakeOffset();
  ctx.save();
  ctx.translate(shx, shy);
  F.stage.draw(ctx, G.t, W, H, F.camX);
  // polished-floor reflections
  if (F.stage.reflect) {
    ctx.save();
    ctx.translate(0, F.stage.floorY * 2);
    ctx.scale(1, -1);
    for (const f of [F.f1, F.f2]) {
      if (f.entHidden) continue;
      Humanoid.draw(ctx, f.ch, f.pose, { x: f.x, y: F.stage.floorY, facing: f.facing,
        scale: 2.5, t: f.t, airH: f.airH, shadow: false, alpha: 0.14 });
    }
    ctx.restore();
  }
  // super dark overlay
  if (F.superBanner && F.superBanner.t > 0) {
    ctx.fillStyle = 'rgba(0,0,10,0.55)';
    ctx.fillRect(-20, -20, W + 40, H + 40);
  }
  // draw order: defender first so attacker pops
  const order = F.f1.state === 'attack' || F.f1.state === 'super' ? [F.f2, F.f1] : [F.f1, F.f2];
  order[0].draw(ctx, F); order[1].draw(ctx, F);
  for (const p of F.projectiles) p.draw(ctx);
  drawCine();
  FX.draw(ctx);
  ctx.restore();
  // cinematic vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.98);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  FX.drawFlash(ctx, W, H);

  // HUD
  drawHealthBar(F.f1, 0);
  drawHealthBar(F.f2, 1);
  drawTimerMedallion();
  if (F.story && F.story.tag)
    drawText(F.story.tag, W / 2, 104, 16, '#ffd76b');
  // fighting style names, MK-style, at the bottom corners
  if (['fight', 'roundbanner'].includes(F.phase)) {
    metalText(F.f1.ch.styleName || '', 56, H - 18, 30, 'left');
    metalText(F.f2.ch.styleName || '', W - 56, H - 18, 30, 'right');
  }

  // phase overlays
  if (F.phase === 'entrance') {
    drawVsTag();
  } else if (F.phase === 'dialogue' && F.dlg && F.dlgLine < F.dlg.length) {
    drawDialogueBox(F.dlg[F.dlgLine]);
  } else if (F.phase === 'roundbanner') {
    const k = F.phaseT;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 3) * (k > 1.1 ? Math.max(0, 1 - (k - 1.1) * 3) : 1);
    if (k < 1.0) drawText(F.roundsToWin > 1 ? `ROUND ${F.round}` : 'FINAL BATTLE', W / 2, H / 2 - 20, 76, '#eaf2ff');
    else drawText('FIGHT!', W / 2, H / 2 - 10, 100, '#ffce5a');
    ctx.restore();
  } else if (F.phase === 'ko') {
    const k = Math.min(1, F.phaseT * 2.5);
    ctx.save();
    ctx.translate(W / 2, H / 2 - 30);
    ctx.scale(2.2 - k * 1.2, 2.2 - k * 1.2);
    drawText(F.timeOut ? 'TIME!' : 'K.O.!', 0, 20, 110, '#ff5a4a');
    ctx.restore();
  } else if (F.phase === 'victory') {
    drawVictory();
  }
  // super banner
  if (F.superBanner) {
    const b = F.superBanner;
    b.t -= dt;
    if (b.t <= 0) F.superBanner = null;
    else {
      const k = Math.min(1, (1.4 - b.t) * 4);
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.t * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, H / 2 - 84, W, 130);
      ctx.shadowColor = b.color; ctx.shadowBlur = 24;
      drawText(b.name, W / 2, H / 2 - 18, 58 * (0.8 + k * 0.2), b.color);
      drawText(`"${b.quote}"`, W / 2, H / 2 + 26, 19, '#dfe9f5', 'center', 'Georgia, serif', false);
      ctx.restore();
    }
  }

  if (Input.key('Escape')) { AudioSys.sfx('back'); AudioSys.music('menu'); G.scene = 'menu'; }
}

function drawVsTag() {
  const k = Math.min(1, F.phaseT * 1.4);
  ctx.save();
  ctx.globalAlpha = k;
  const n1 = F.f1.ch.name, n2 = F.cfg.rename2 || F.f2.ch.name;
  drawText(n1, W * 0.5 - 360 + (1 - k) * -200, 160, 42, F.f1.ch.theme);
  drawText('VS', W / 2, 175, 56, '#ffce8a');
  drawText(n2, W * 0.5 + 360 + (1 - k) * 200, 160, 42, F.f2.ch.theme);
  ctx.restore();
}

function getDialogue() {
  if (F.story && F.story.pre) {
    return [{ who: 0, text: F.story.pre[0] }, { who: 1, text: F.story.pre[1] }];
  }
  const c1 = F.f1.ch, c2 = F.f2.ch;
  const l1 = (c1.vs && c1.vs[c2.id]) || c1.intro[Math.floor(Math.random() * c1.intro.length)];
  const l2 = (c2.vs && c2.vs[c1.id]) || c2.intro[Math.floor(Math.random() * c2.intro.length)];
  return [{ who: 0, text: l1 }, { who: 1, text: l2 }];
}

function drawDialogueBox(line) {
  const f = line.who === 0 ? F.f1 : F.f2;
  const name = line.who === 1 && F.cfg.rename2 ? F.cfg.rename2 : f.ch.name;
  const shown = line.text.slice(0, Math.floor(F.dlgChars));
  roundRect(140, 560, 1000, 110, 12, 'rgba(6,10,20,0.92)', f.ch.theme, 2.5);
  // speaker chip
  ctx.save();
  ctx.beginPath(); ctx.roundRect(line.who === 0 ? 160 : 1040, 520, 80, 80, 10); ctx.clip();
  ctx.fillStyle = '#0c1322'; ctx.fillRect(line.who === 0 ? 160 : 1040, 520, 80, 80);
  ctx.drawImage(portrait(f.ch.id), (line.who === 0 ? 160 : 1040) - 10, 514, 100, 134);
  ctx.restore();
  roundRect(line.who === 0 ? 160 : 1040, 520, 80, 80, 10, null, f.ch.theme, 2.5);
  drawText(name, line.who === 0 ? 260 : 1020, 592, 20, f.ch.theme, line.who === 0 ? 'left' : 'right');
  drawText(shown, W / 2, 634, 22, '#eef4ff', 'center', 'Georgia, serif', false);
  drawText('J — continue', 1100, 660, 13, '#5d7290', 'right', 'Segoe UI, sans-serif', false);
}

function drawVictory() {
  const winner = F.koWinner;
  const quote = winner.ch.win[F.round % winner.ch.win.length];
  ctx.fillStyle = 'rgba(0,0,8,0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.shadowColor = winner.ch.theme; ctx.shadowBlur = 22;
  drawText(`${F.cfg.rename2 && winner === F.f2 ? F.cfg.rename2 : winner.ch.name} WINS`, W / 2, 150, 64, winner.ch.theme);
  ctx.restore();
  drawText(`"${quote}"`, W / 2, 205, 22, '#dfe9f5', 'center', 'Georgia, serif', false);
  if (F.phaseT > 1.2) {
    if (F.story) {
      drawText('J — continue story', W / 2, 600, 22, '#ffd76b');
    } else if (G.mode === 'arcade') {
      drawText(F.koWinner === F.f1 ? 'J — next opponent' : 'J — try again      S — give up', W / 2, 600, 22, '#ffd76b');
    } else {
      drawText('J — rematch      K — character select      S — main menu', W / 2, 600, 22, '#ffd76b');
    }
  }
}

function handleVictoryInput() {
  if (F.story) {
    if (Input.key('KeyJ') || Input.key('Enter')) {
      AudioSys.sfx('confirm');
      const won = F.koWinner === F.f1;
      if (won || F.story.doomed) { G.storyIdx++; advanceStory(); }
      else { startFight(F.cfg); } // retry the story fight
    }
    return;
  }
  if (G.mode === 'arcade') {
    if (Input.key('KeyJ') || Input.key('Enter') || Input.key('Numpad1')) {
      AudioSys.sfx('confirm');
      if (F.koWinner === F.f1) { G.arcade.stage++; nextArcadeFight(); }
      else startFight(F.cfg);
    }
    if (Input.key('KeyS')) { AudioSys.sfx('back'); AudioSys.music('menu'); G.scene = 'menu'; }
    return;
  }
  if (Input.key('KeyJ') || Input.key('Enter') || Input.key('Numpad1')) { AudioSys.sfx('confirm'); startFight(F.cfg); }
  if (Input.key('KeyK') || Input.key('Numpad2')) { AudioSys.sfx('confirm'); startSelect(); }
  if (Input.key('KeyS') || Input.key('ArrowDown')) { AudioSys.sfx('back'); AudioSys.music('menu'); G.scene = 'menu'; }
}

// ============================================================
// ARCADE MODE
// ============================================================
function startArcade(charId) {
  const pool = ROSTER.filter(id => id !== charId && id !== 'dreamman');
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  G.arcade = { hero: charId, ladder: pool.slice(0, 6).concat(['dreamman']), stage: 0 };
  nextArcadeFight();
}

function nextArcadeFight() {
  const a = G.arcade;
  if (a.stage >= a.ladder.length) {
    unlockSecrets();
    G.scene = 'ending';
    G.endingT = 0;
    AudioSys.sfx('win');
    return;
  }
  const opp = a.ladder[a.stage];
  const stages = STAGES.list().filter(s => s !== 'throne');
  const stage = opp === 'dreamman' ? 'throne' : stages[Math.floor(Math.random() * stages.length)];
  startFight({ p1: a.hero, p2: opp, stage, cpu2: true, rounds: 2,
    ai: Math.min(3, 1 + a.stage * 0.4) });
}

function drawEnding(dt) {
  G.endingT += dt;
  const hero = CHARACTERS[G.arcade.hero];
  ctx.fillStyle = '#05070e'; ctx.fillRect(0, 0, W, H);
  STAGES.S.throne.draw(ctx, G.t, W, H, 0);
  ctx.fillStyle = 'rgba(3,5,12,0.7)'; ctx.fillRect(0, 0, W, H);
  Humanoid.draw(ctx, hero, Humanoid.pose('win'), { x: W / 2, y: 560, facing: 1, scale: 2.6, t: G.t, aura: hero.theme });
  drawText('ARCADE COMPLETE', W / 2, 110, 52, '#ffd76b');
  drawText(`${hero.name} — "${hero.alias}"`, W / 2, 160, 24, hero.theme);
  const ending = [
    `With Dream Man cast down from the Throne of Glass,`,
    `${hero.alias} returns to a world learning to dream its own dreams again.`,
    `${hero.win[0]}`,
    '',
    '★ SECRET CHARACTERS & SECRET STAGE UNLOCKED ★'];
  ending.forEach((l, i) => drawText(l, W / 2, 620 + i * 0 + i * 24 - 24 * 2, 19, i === 4 ? '#ffd76b' : '#cfdcec', 'center', 'Georgia, serif', false));
  if (G.endingT > 2 && (Input.key('KeyJ') || Input.key('Enter'))) {
    AudioSys.sfx('confirm'); AudioSys.music('menu'); G.scene = 'menu';
  }
}

// ============================================================
// STORY MODE FLOW
// ============================================================
function advanceStory() {
  while (G.storyIdx < STORY.length) {
    const node = STORY[G.storyIdx];
    if (node.type === 'fight') {
      const cfg = { p1: node.p1, p2: node.p2, stage: node.stage, cpu2: true, rounds: 1,
        story: node, ai: node.phase ? 2 + node.phase * 0.4 : 2, rename2: node.rename };
      if (node.mirror) cfg.chOverride2 = cloneChar(node.p2, { dark: true, name: node.rename });
      if (node.rename && !node.mirror) cfg.chOverride2 = cloneChar(node.p2, { name: node.rename });
      if (node.phase === 3) cfg.chOverride2 = cloneChar(node.p2, { noArmor: true });
      if (node.doomed) cfg.hpMul2 = 2.2;
      if (node.phase) cfg.hpMul2 = 0.75 + node.phase * 0.15;
      startFight(cfg);
      return;
    }
    // scene / title nodes
    G.scene = 'story';
    G.storyNode = node;
    G.storyT = 0;
    G.storyChars = 0;
    if (node.flash) FX.flash('#ffffff', 1.2);
    if (node.end) unlockSecrets();
    return;
  }
  AudioSys.music('menu');
  G.scene = 'menu';
}

function drawStory(dt) {
  const node = G.storyNode;
  G.storyT += dt;
  if (node.type === 'title') {
    ctx.fillStyle = '#020308'; ctx.fillRect(0, 0, W, H);
    STAGES.rain(ctx, G.t, W, H);
    const lines = node.text.split('\n');
    ctx.save();
    ctx.globalAlpha = Math.min(1, G.storyT * 1.2);
    ctx.shadowColor = '#7fd4ff'; ctx.shadowBlur = 20;
    drawText(lines[0], W / 2, H / 2 - 40, 40, '#8fa6c0');
    drawText(lines[1], W / 2, H / 2 + 40, 70, '#eaf8ff');
    ctx.restore();
    if (G.storyT > 1.2 && (Input.key('KeyJ') || Input.key('Enter') || G.storyT > 4)) {
      AudioSys.sfx('confirm'); G.storyIdx++; advanceStory();
    }
  } else { // scene
    const st = STAGES.S[node.bg];
    st.draw(ctx, G.t, W, H, Math.sin(G.t * 0.2) * 120);
    ctx.fillStyle = 'rgba(2,4,10,0.62)'; ctx.fillRect(0, 0, W, H);
    // letterbox = cinematic
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, 70); ctx.fillRect(0, H - 70, W, 70);
    G.storyChars += dt * 34;
    let budget = Math.floor(G.storyChars);
    for (let i = 0; i < node.lines.length; i++) {
      const line = node.lines[i];
      if (budget <= 0) break;
      const shown = line.slice(0, budget);
      budget -= line.length;
      drawText(shown, W / 2, 200 + i * 42, 24,
        line.startsWith('★') || line === line.toUpperCase() && line.trim().length > 3 && i > 4 ? '#ffd76b' : '#e8f0fa',
        'center', 'Georgia, serif', false);
    }
    drawText('J — continue', W - 60, H - 28, 15, '#5d7290', 'right', 'Segoe UI, sans-serif', false);
    FX.update(dt); FX.drawFlash(ctx, W, H);
    if (Input.key('KeyJ') || Input.key('Enter')) {
      const total = node.lines.reduce((a, l) => a + l.length, 0);
      if (G.storyChars < total) G.storyChars = total;
      else {
        AudioSys.sfx('confirm');
        if (node.end) { AudioSys.music('menu'); G.scene = 'menu'; }
        else { G.storyIdx++; advanceStory(); }
      }
    }
  }
}

// ============================================================
// MAIN LOOP
// ============================================================
let last = performance.now();
let booted = false;

// debug/testing hook
window.__SKCR = { G, F };

function frame(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000);
  last = now;
  G.t += dt;
  Input.beginFrame();

  if (!booted) {
    // attract screen — press any key
    drawMenu(dt);
    ctx.fillStyle = 'rgba(2,4,10,0.35)';
    if (Math.sin(G.t * 3) > -0.4) drawText('PRESS ANY KEY', W / 2, 560, 30, '#eaf8ff');
    if (Input.anyKey()) { booted = true; AudioSys.init(); AudioSys.music('menu'); }
    requestAnimationFrame(frame);
    return;
  }

  switch (G.scene) {
    case 'menu': drawMenu(dt); menuInput(); break;
    case 'controls': drawControls(dt); break;
    case 'select': drawSelect(dt); break;
    case 'stageselect': drawStageSelect(dt); break;
    case 'fight': drawFight(dt); break;
    case 'ending': drawEnding(dt); break;
    case 'story': drawStory(dt); break;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

})();
