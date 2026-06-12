// ============================================================
// INPUT — keyboard state + per-player mappings
// ============================================================
const Input = (() => {
  const down = {};
  const pressedQueue = [];

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    AudioSys.init();
    if (!down[e.code]) pressedQueue.push(e.code);
    down[e.code] = true;
  });
  window.addEventListener('keyup', (e) => { down[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in down) down[k] = false; });

  // action -> keycode per player
  const MAPS = [
    { // Player 1
      left: 'KeyA', right: 'KeyD', up: 'KeyW', downK: 'KeyS',
      lp: 'KeyJ', hp: 'KeyU', lk: 'KeyK', hk: 'KeyI',
      special: 'KeyL', superK: 'KeyO', dash: 'ShiftLeft',
    },
    { // Player 2
      left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', downK: 'ArrowDown',
      lp: 'Numpad1', hp: 'Numpad4', lk: 'Numpad2', hk: 'Numpad5',
      special: 'Numpad3', superK: 'Numpad6', dash: 'Numpad0',
      // laptop fallbacks
      lp2: 'KeyB', hp2: 'KeyG', lk2: 'KeyN', hk2: 'KeyH',
      special2: 'KeyM', superK2: 'Comma', dash2: 'ShiftRight',
    },
  ];

  function held(player, action) {
    const m = MAPS[player];
    return !!(down[m[action]] || (m[action + '2'] && down[m[action + '2']]));
  }

  // frame-buffered "just pressed" — consumed each frame by Game
  let framePressed = new Set();
  function beginFrame() {
    framePressed = new Set(pressedQueue);
    pressedQueue.length = 0;
  }
  function pressed(player, action) {
    const m = MAPS[player];
    return framePressed.has(m[action]) || (m[action + '2'] && framePressed.has(m[action + '2']));
  }
  function key(code) { return framePressed.has(code); }
  function anyKey() { return framePressed.size > 0; }

  return { held, pressed, key, anyKey, beginFrame, MAPS };
})();
