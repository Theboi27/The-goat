// Headless smoke test: stubs browser APIs, loads the game, drives
// menu -> select -> stage -> full fight with random inputs.
// Fails loudly on any exception. Run: node test/smoke.js
const fs = require('fs');
const path = require('path');

// ---------- DOM / canvas stubs ----------
function makeCtx() {
  const grad = { addColorStop() {} };
  const base = {};
  return new Proxy(base, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'canvas') return { width: 1280, height: 720 };
      return (...args) => (String(p).startsWith('create') ? grad :
        p === 'getTransform' ? {} : undefined);
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}
const keyHandlers = { keydown: [], keyup: [], blur: [] };
global.window = {
  addEventListener(ev, fn) { (keyHandlers[ev] = keyHandlers[ev] || []).push(fn); },
  AudioContext: function () {
    const node = () => ({
      gain: param(), frequency: param(), Q: param(), type: '',
      buffer: null, connect() {}, start() {}, stop() {},
    });
    function param() {
      return { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {} };
    }
    return {
      currentTime: 0, sampleRate: 44100, state: 'running', destination: {},
      resume() {}, createGain: node, createOscillator: node,
      createBiquadFilter: node, createBufferSource: node,
      createBuffer: (ch, len) => ({ getChannelData: () => new Float32Array(len) }),
    };
  },
};
global.localStorage = (() => {
  const m = {};
  return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } };
})();
global.document = {
  getElementById: () => ({ width: 1280, height: 720, getContext: makeCtx }),
  createElement: () => ({ width: 0, height: 0, getContext: makeCtx }),
};
let rafQueue = [];
global.requestAnimationFrame = cb => rafQueue.push(cb);

// ---------- load game sources ----------
const files = ['audio', 'input', 'fx', 'humanoid', 'characters', 'stages', 'fighter', 'story', 'game'];
const src = files.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8')).join('\n;\n');
try {
  (0, eval)(`var window = global.window, document = global.document,
    localStorage = global.localStorage, requestAnimationFrame = global.requestAnimationFrame;
    ${src}`);
} catch (e) { console.error('LOAD FAILED:', e); process.exit(1); }

// ---------- drive frames ----------
let now = 0;
function hold(code) {
  keyHandlers.keydown.forEach(fn => fn({ code, key: code, preventDefault() {} }));
}
function release(code) { keyHandlers.keyup.forEach(fn => fn({ code, key: code })); }
function press(code) {
  hold(code);
  release(code); // tap: release immediately so repeat presses register
}
function frames(n, perFrame) {
  for (let i = 0; i < n; i++) {
    const q = rafQueue; rafQueue = [];
    now += 16.7;
    if (perFrame) perFrame(i);
    for (const cb of q) cb(now);
    if (!rafQueue.length) throw new Error('frame loop died');
  }
}

try {
  frames(5);
  press('KeyJ'); frames(5);             // boot past attract screen
  press('KeyS'); frames(2); press('KeyS'); frames(2); press('KeyS'); frames(2); // menu -> VERSUS CPU
  press('KeyJ'); frames(5);             // confirm mode -> character select
  press('KeyD'); frames(2);             // browse a character
  press('KeyJ'); frames(200);           // lock P1, wait out CPU roulette -> stage select
  press('KeyD'); frames(2);
  press('KeyJ'); frames(10);            // confirm stage -> fight (entrance)
  frames(140);                          // entrance plays out
  press('KeyJ'); frames(30); press('KeyJ'); frames(30); press('KeyJ'); frames(120); // dialogue + round banner
  // brawl: ~40s of random inputs
  const keys = ['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyU', 'KeyK', 'KeyI', 'KeyL', 'KeyO', 'ShiftLeft'];
  let held = [];
  // sample combat state DURING the brawl — a finished match rematches
  // with fresh HP, so checking only at the end races the rematch
  let maxDmg1 = 0, maxDmg2 = 0, sawKo = false;
  frames(2400, i => {
    if (i % 7 === 0) {
      held.forEach(release); held = [];
      const k = keys[Math.floor(Math.random() * keys.length)];
      hold(k); held.push(k);
    }
    const F = global.window.__SKCR.F;
    if (F.f1 && F.f2) {
      maxDmg1 = Math.max(maxDmg1, F.f1.maxHp - F.f1.hp);
      maxDmg2 = Math.max(maxDmg2, F.f2.maxHp - F.f2.hp);
      if (F.phase === 'ko' || F.phase === 'victory') sawKo = true;
    }
  });
  // mash continue through KO/round/victory screens
  frames(600, i => { if (i % 20 === 0) press('KeyJ'); });
  const dbg = global.window.__SKCR;
  if (!dbg) throw new Error('debug hook missing');
  const { G, F } = dbg;
  if (!F.f1 || !F.f2) throw new Error('fighters never created');
  if (maxDmg1 <= 0 && maxDmg2 <= 0) throw new Error('no damage was ever dealt in 40s of combat');
  console.log(`combat verified: p1 dealt/took ${maxDmg2.toFixed(0)}/${maxDmg1.toFixed(0)} dmg, ko/victory seen=${sawKo}, phase=${F.phase}, scene=${G.scene}`);
  console.log('SMOKE TEST PASSED — no exceptions across boot, menus, select, and combat.');
  // story mode quick pass
  press('Escape'); frames(5);
  press('KeyW'); frames(2); press('KeyW'); frames(2); press('KeyW'); frames(2); press('KeyW'); frames(2);
  press('KeyJ'); frames(10);            // STORY MODE
  for (let s = 0; s < 40; s++) { press('KeyJ'); frames(60); } // hammer through scenes/fights
  frames(1200, i => { if (i % 6 === 0) press(['KeyJ','KeyD','KeyL'][i % 3]); });
  console.log('STORY MODE SMOKE PASSED.');
  process.exit(0);
} catch (e) {
  console.error('SMOKE TEST FAILED:', e);
  process.exit(1);
}
