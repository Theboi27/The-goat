// ============================================================
// FX — particles, impact frames, screen shake, flashes, popups
// ============================================================
const FX = (() => {
  let parts = [];
  let popups = [];
  let shakeAmt = 0;
  let flashCol = null, flashT = 0, flashDur = 0;
  let slowmoT = 0, slowmoFactor = 1;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function spawn(type, x, y, o = {}) {
    const base = { type, x, y, vx: o.vx || 0, vy: o.vy || 0, life: o.life || 0.5, t: 0,
      size: o.size || 6, color: o.color || '#fff', grav: o.grav || 0, rot: rnd(0, 6.28),
      vr: o.vr || rnd(-4, 4), o };
    parts.push(base);
    return base;
  }

  // radial impact spark burst (the "hit hard" frame)
  function impact(x, y, color, power = 1) {
    const n = (8 + power * 6) | 0;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2);
      const sp = rnd(150, 450) * (0.6 + power * 0.5);
      spawn('spark', x, y, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rnd(0.12, 0.3), size: rnd(2, 5) * (0.7 + power * 0.4), color });
    }
    spawn('ring', x, y, { life: 0.22, size: 10 + power * 22, color });
    spawn('flashstar', x, y, { life: 0.12, size: 26 + power * 30, color: '#ffffff' });
    if (power > 1.2) spawn('ring', x, y, { life: 0.35, size: 30 + power * 35, color: '#ffffff' });
  }

  function smokePuff(x, y, color = '#9aa3ad', n = 14, sz = 1) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2);
      spawn('smoke', x + rnd(-10, 10), y + rnd(-20, 10), {
        vx: Math.cos(a) * rnd(20, 120), vy: Math.sin(a) * rnd(20, 100) - 40,
        life: rnd(0.4, 1.0), size: rnd(14, 34) * sz, color });
    }
  }

  function lightning(x1, y1, x2, y2, color = '#9be8ff', branches = 2) {
    spawn('bolt', x1, y1, { life: 0.14, color, o2: { x2, y2, branches } });
  }

  function debris(x, y, color = '#777', n = 8) {
    for (let i = 0; i < n; i++)
      spawn('debris', x, y, { vx: rnd(-220, 220), vy: rnd(-380, -80),
        life: rnd(0.5, 1.1), size: rnd(3, 8), color, grav: 900 });
  }

  function popup(x, y, text, color = '#fff', size = 28, life = 0.9) {
    popups.push({ x, y, text, color, size, t: 0, life });
  }

  function shake(a) { shakeAmt = Math.max(shakeAmt, a); }
  function flash(color, dur) { flashCol = color; flashDur = dur; flashT = dur; }
  function slowmo(dur, factor = 0.25) { slowmoT = dur; slowmoFactor = factor; }
  function timeScale() { return slowmoT > 0 ? slowmoFactor : 1; }

  function update(dt) {
    if (slowmoT > 0) slowmoT -= dt;
    shakeAmt = Math.max(0, shakeAmt - dt * 38);
    if (flashT > 0) flashT -= dt;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt;
      if (p.t >= p.life) { parts.splice(i, 1); continue; }
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.type === 'smoke') { p.vx *= 0.94; p.vy *= 0.94; }
    }
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.t += dt; p.y -= 40 * dt;
      if (p.t >= p.life) popups.splice(i, 1);
    }
  }

  function shakeOffset() {
    if (shakeAmt <= 0) return [0, 0];
    return [rnd(-shakeAmt, shakeAmt), rnd(-shakeAmt, shakeAmt)];
  }

  function drawBoltSeg(ctx, x1, y1, x2, y2, jag) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    const segs = 7;
    for (let i = 1; i < segs; i++) {
      const k = i / segs;
      ctx.lineTo(x1 + (x2 - x1) * k + rnd(-jag, jag), y1 + (y2 - y1) * k + rnd(-jag, jag));
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function draw(ctx) {
    for (const p of parts) {
      const k = 1 - p.t / p.life;
      ctx.save();
      ctx.globalAlpha = k;
      if (p.type === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.55;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
        ctx.stroke();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * k;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (1 - k) * 2.2), 0, 6.29);
        ctx.stroke();
      } else if (p.type === 'flashstar') {
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * k);
          ctx.lineTo(p.size * 0.13, 0);
          ctx.lineTo(0, p.size * k);
          ctx.lineTo(-p.size * 0.13, 0);
          ctx.closePath();
          ctx.fill();
        }
      } else if (p.type === 'smoke') {
        ctx.globalAlpha = k * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (1 - k)), 0, 6.29);
        ctx.fill();
      } else if (p.type === 'debris') {
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.type === 'bolt') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        drawBoltSeg(ctx, p.x, p.y, p.o.o2.x2, p.o.o2.y2, 14);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#ffffff';
        drawBoltSeg(ctx, p.x, p.y, p.o.o2.x2, p.o.o2.y2, 10);
      } else if (p.type === 'glow') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, p.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = k * 0.8;
        ctx.fillStyle = g;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else if (p.type === 'drop') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.02, p.y + p.vy * 0.02);
        ctx.stroke();
      } else if (p.type === 'ember') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * k, 0, 6.29);
        ctx.fill();
      }
      ctx.restore();
    }
    for (const p of popups) {
      const k = 1 - p.t / p.life;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.font = `900 ${p.size}px Impact, 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000';
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  function drawFlash(ctx, W, H) {
    if (flashT > 0 && flashDur > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, flashT / flashDur);
      ctx.fillStyle = flashCol;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  function clear() { parts = []; popups = []; shakeAmt = 0; flashT = 0; slowmoT = 0; }

  return { spawn, impact, smokePuff, lightning, debris, popup, shake, flash, slowmo,
    timeScale, update, draw, drawFlash, shakeOffset, clear, rnd };
})();
