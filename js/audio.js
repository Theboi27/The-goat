// ============================================================
// AUDIO — synthesized SFX engine (WebAudio, no asset files)
// ============================================================
const AudioSys = (() => {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let musicTimer = null;
  let musicMode = null;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.16;
      musicGain.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(dur) {
    const c = ensure();
    const len = Math.max(1, (dur * c.sampleRate) | 0);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function noise(dur, freq, q, vol, attack = 0.002, type = 'bandpass') {
    const c = ensure();
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(dur);
    const f = c.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(); src.stop(c.currentTime + dur + 0.05);
  }

  function tone(freq, dur, vol, type = 'sine', slideTo = null, delay = 0) {
    const c = ensure();
    const o = c.createOscillator();
    o.type = type;
    const t0 = c.currentTime + delay;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  function thud(freq, dur, vol) {
    tone(freq, dur, vol, 'sine', freq * 0.4);
    noise(dur * 0.7, freq * 6, 1.2, vol * 0.7);
  }

  const SFX = {
    punch()   { thud(160, 0.12, 0.8); noise(0.06, 2400, 1, 0.35); },
    kick()    { noise(0.10, 900, 1, 0.5); thud(120, 0.15, 0.9); },
    heavy()   { thud(70, 0.30, 1.2); noise(0.18, 500, 1, 0.7); tone(48, 0.3, 0.7, 'sine', 30); },
    whoosh()  { noise(0.16, 1200, 2, 0.28, 0.05, 'bandpass'); },
    block()   { tone(800, 0.07, 0.4, 'square', 500); noise(0.06, 3000, 2, 0.3); },
    counter() { tone(1500, 0.25, 0.5, 'sine', 200); tone(2200, 0.18, 0.35, 'triangle', 400); noise(0.2, 4000, 3, 0.4); },
    zap()     { noise(0.14, 3200, 6, 0.5); tone(900, 0.12, 0.3, 'sawtooth', 100); },
    splash()  { noise(0.25, 1100, 0.8, 0.45, 0.03); noise(0.35, 500, 0.7, 0.3, 0.08); },
    ice()     { tone(2400, 0.18, 0.3, 'sine', 3600); noise(0.15, 5000, 4, 0.35); },
    gun()     { noise(0.08, 400, 0.6, 1.0); thud(90, 0.18, 0.8); },
    slash()   { noise(0.12, 4500, 5, 0.45, 0.002, 'highpass'); tone(1800, 0.1, 0.18, 'sawtooth', 600); },
    smoke()   { noise(0.4, 600, 0.6, 0.4, 0.06, 'lowpass'); },
    special() { tone(300, 0.4, 0.4, 'sawtooth', 900); noise(0.3, 2000, 2, 0.35, 0.05); },
    super_()  { tone(60, 0.8, 0.8, 'sine', 40); tone(220, 0.7, 0.4, 'sawtooth', 880); noise(0.6, 1500, 1, 0.5, 0.1); },
    ko()      { thud(50, 0.7, 1.4); noise(0.5, 300, 0.6, 0.9, 0.01); tone(38, 0.9, 0.9, 'sine', 22); },
    land()    { thud(110, 0.1, 0.45); },
    dash()    { noise(0.12, 1800, 3, 0.3, 0.01); tone(500, 0.1, 0.15, 'sine', 1100); },
    jump()    { tone(220, 0.12, 0.2, 'sine', 380); },
    select()  { tone(660, 0.06, 0.3, 'square'); },
    move()    { tone(440, 0.05, 0.22, 'square'); },
    confirm() { tone(523, 0.09, 0.32, 'square'); tone(784, 0.14, 0.32, 'square', null, 0.07); tone(1046, 0.2, 0.3, 'square', null, 0.14); },
    back()    { tone(400, 0.1, 0.25, 'square', 200); },
    round()   { tone(392, 0.15, 0.4, 'sawtooth'); tone(523, 0.15, 0.4, 'sawtooth', null, 0.13); tone(659, 0.3, 0.45, 'sawtooth', null, 0.26); },
    fight()   { tone(523, 0.1, 0.5, 'sawtooth'); tone(659, 0.1, 0.5, 'sawtooth', null, 0.08); tone(880, 0.4, 0.55, 'sawtooth', null, 0.16); thud(70, 0.4, 1.0); },
    win()     { [523,659,784,1046].forEach((f,i)=>tone(f, 0.22, 0.35, 'triangle', null, i*0.12)); },
    teleport(){ tone(1400, 0.2, 0.3, 'sine', 200); noise(0.2, 2600, 4, 0.3, 0.02); },
    charge()  { tone(120, 0.6, 0.35, 'sawtooth', 700); noise(0.5, 900, 2, 0.25, 0.2); },
    weight()  { thud(45, 0.5, 1.5); noise(0.3, 250, 0.6, 0.9); },
    beam()    { tone(180, 0.7, 0.5, 'sawtooth', 90); noise(0.7, 2800, 1.5, 0.45, 0.05); },
  };

  // ---- procedural music loops (dark synth pulse) ----
  const SCALES = {
    menu:  [55, 58.27, 65.41, 73.42, 82.41, 87.31],
    fight: [82.41, 87.31, 98, 110, 123.47, 130.81],
    boss:  [61.74, 65.41, 73.42, 77.78, 92.5, 98],
  };
  function musicTick(mode, step) {
    if (!ctx || musicMode !== mode) return;
    const sc = SCALES[mode] || SCALES.menu;
    const t = ctx.currentTime;
    // bass pulse
    const bass = sc[step % 4 === 0 ? 0 : (step % 8 === 6 ? 2 : 0)];
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = bass;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(mode === 'menu' ? 0.5 : 0.75, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
    o.connect(f); f.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + 0.3);
    // sparkle arp on some steps
    if (step % 2 === 1) {
      const n = sc[(step * 3 + ((step / 8) | 0)) % sc.length] * 4;
      const o2 = ctx.createOscillator(); o2.type = 'triangle';
      o2.frequency.value = n;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.linearRampToValueAtTime(0.22, t + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o2.connect(g2); g2.connect(musicGain);
      o2.start(t); o2.stop(t + 0.35);
    }
    // hat
    if (mode !== 'menu') noiseHat(t);
  }
  function noiseHat(t) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(0.04);
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 8000;
    const g = ctx.createGain(); g.gain.value = 0.12;
    src.connect(f); f.connect(g); g.connect(musicGain);
    src.start(t); src.stop(t + 0.05);
  }

  function music(mode) {
    ensure();
    if (musicMode === mode) return;
    musicMode = mode;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    if (!mode) return;
    let step = 0;
    const bpmMs = mode === 'menu' ? 280 : (mode === 'boss' ? 200 : 220);
    musicTimer = setInterval(() => { musicTick(mode, step++); }, bpmMs);
  }

  return {
    init: ensure,
    music,
    sfx(name) {
      try { ensure(); (SFX[name === 'super' ? 'super_' : name] || SFX.punch)(); } catch (e) {}
    },
  };
})();
