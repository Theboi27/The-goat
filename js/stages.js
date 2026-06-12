// ============================================================
// STAGES — arena background renderers (parallax 2.5D)
// Each stage: { name, floorY, ambient, draw(ctx,t,W,H,camX) }
// ============================================================
const STAGES = (() => {
  const FLOOR = 640;

  function stars(ctx, W, n, seed, yMax) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < n; i++) {
      const x = ((i * 127 + seed * 31) % W);
      const y = ((i * 211 + seed * 57) % yMax);
      const s = ((i * 7) % 3) * 0.5 + 0.4;
      ctx.globalAlpha = 0.3 + ((i * 13) % 7) / 10;
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function floorPlane(ctx, W, H, camX, c1, c2, lineCol) {
    const g = ctx.createLinearGradient(0, FLOOR, 0, H);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, FLOOR, W, H - FLOOR);
    // perspective lines for 2.5D depth
    if (lineCol) {
      ctx.strokeStyle = lineCol;
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2 + i * 70 - camX * 0.04, FLOOR);
        ctx.lineTo(W / 2 + i * 260 - camX * 0.1, H);
        ctx.stroke();
      }
      for (let j = 0; j < 4; j++) {
        const y = FLOOR + 8 + j * j * 8;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
  }

  function building(ctx, x, y, w, h, col, winCol, seed, t) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = winCol;
    const cols = Math.max(1, (w / 14) | 0), rows = Math.max(1, (h / 18) | 0);
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const r = (i * 31 + j * 17 + seed) % 10;
        if (r < 4) {
          const flick = r === 0 && Math.sin(t * 3 + i + j) > 0.93 ? 0 : 1;
          if (flick) ctx.fillRect(x + 4 + i * 14, y + 6 + j * 18, 6, 9);
        }
      }
  }

  function cityScape(ctx, t, W, H, camX, opts) {
    const { skyTop, skyBot, far, near, win, neon } = opts;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, skyTop); g.addColorStop(1, skyBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    stars(ctx, W, 90, 3, 300);
    // moon
    ctx.fillStyle = 'rgba(235,240,255,0.9)';
    ctx.beginPath(); ctx.arc(W - 220, 110, 38, 0, 6.29); ctx.fill();
    ctx.fillStyle = skyTop;
    ctx.beginPath(); ctx.arc(W - 234, 100, 34, 0, 6.29); ctx.fill();
    // far skyline
    for (let i = 0; i < 14; i++) {
      const bx = ((i * 110 - camX * 0.06) % (W + 160)) - 80;
      const bh = 130 + ((i * 53) % 130);
      building(ctx, bx, 480 - bh, 70 + (i * 13) % 40, bh, far, win, i, t);
    }
    // near skyline
    for (let i = 0; i < 9; i++) {
      const bx = ((i * 180 - camX * 0.14) % (W + 260)) - 130;
      const bh = 200 + ((i * 97) % 160);
      building(ctx, bx, FLOOR - bh - 60, 110 + (i * 29) % 60, bh, near, win, i + 5, t);
      // neon strip
      if (neon && i % 2 === 0) {
        ctx.fillStyle = neon[i % neon.length];
        ctx.globalAlpha = 0.75 + Math.sin(t * 2 + i) * 0.2;
        ctx.fillRect(bx + 8, FLOOR - bh - 56, 5, bh * 0.5);
        ctx.globalAlpha = 1;
      }
    }
  }

  function rain(ctx, t, W, H) {
    ctx.strokeStyle = 'rgba(160,190,230,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 70; i++) {
      const x = ((i * 97 + t * 540) % (W + 100)) - 50;
      const y = ((i * 211 + t * 880) % H);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16); ctx.stroke();
    }
  }

  function embersFx(ctx, t, W, H, col) {
    for (let i = 0; i < 36; i++) {
      const x = ((i * 173 + Math.sin(t + i) * 40 + t * 30) % W + W) % W;
      const y = H - ((i * 97 + t * (50 + i % 40)) % H);
      ctx.globalAlpha = 0.3 + (i % 5) / 8;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, 1.4 + (i % 3), 0, 6.29); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const S = {};

  // ---- ZALUM PRISON ----
  S.prison = { name: 'ZALUM PRISON', floorY: FLOOR, music: 'fight',
    draw(ctx, t, W, H, camX) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a0d14'); g.addColorStop(1, '#1a2028');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // moon through barred skylight
      ctx.fillStyle = 'rgba(200,215,240,0.12)';
      ctx.beginPath(); ctx.moveTo(W/2 - 180, 0); ctx.lineTo(W/2 + 180, 0);
      ctx.lineTo(W/2 + 320, FLOOR); ctx.lineTo(W/2 - 320, FLOOR); ctx.fill();
      // cell block wall
      ctx.fillStyle = '#202733';
      ctx.fillRect(0, 180, W, FLOOR - 180);
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 200 - camX * 0.2) % (W + 200)) - 100;
        ctx.fillStyle = '#0c1018';
        ctx.fillRect(cx, 260, 120, 280);
        ctx.strokeStyle = '#3c4655'; ctx.lineWidth = 4;
        for (let b = 0; b < 6; b++) {
          ctx.beginPath(); ctx.moveTo(cx + 12 + b * 20, 260); ctx.lineTo(cx + 12 + b * 20, 540); ctx.stroke();
        }
        ctx.strokeRect(cx, 260, 120, 280);
      }
      // spotlights sweep
      for (let i = 0; i < 2; i++) {
        const sx = W * (0.25 + i * 0.5) + Math.sin(t * 0.7 + i * 2) * 200;
        const sg = ctx.createLinearGradient(sx, 0, sx, FLOOR);
        sg.addColorStop(0, 'rgba(255,240,200,0.16)'); sg.addColorStop(1, 'rgba(255,240,200,0.02)');
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.moveTo(sx - 14, 0); ctx.lineTo(sx + 14, 0);
        ctx.lineTo(sx + 130, FLOOR); ctx.lineTo(sx - 130, FLOOR); ctx.fill();
      }
      // razor wire top
      ctx.strokeStyle = '#4a5566'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < W; x += 18) {
        ctx.moveTo(x, 180 + Math.sin(x * 0.4) * 4);
        ctx.arc(x + 9, 180, 8, Math.PI, 0);
      }
      ctx.stroke();
      floorPlane(ctx, W, H, camX, '#2a313d', '#11151c', 'rgba(90,105,125,0.18)');
    } };

  // ---- WESTMINSTER RUINS ----
  S.westminster = { name: 'WESTMINSTER RUINS', floorY: FLOOR, music: 'fight',
    draw(ctx, t, W, H, camX) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#3b3a45'); g.addColorStop(0.6, '#6b5d56'); g.addColorStop(1, '#4a4039');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // smoke plumes
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = 'rgba(60,55,52,0.5)';
        const px = (i * 340 - camX * 0.08) % (W + 200);
        ctx.beginPath();
        ctx.ellipse(px, 200 - (t * 12 + i * 60) % 240, 70 + i * 16, 44, 0, 0, 6.29);
        ctx.fill();
      }
      // broken Big Ben
      const bx = W * 0.68 - camX * 0.15;
      ctx.fillStyle = '#54493c';
      ctx.fillRect(bx, 120, 90, FLOOR - 120);
      ctx.fillStyle = '#463d33';
      ctx.fillRect(bx + 10, 130, 70, 60);
      // clock face (cracked)
      ctx.fillStyle = '#d8cba8';
      ctx.beginPath(); ctx.arc(bx + 45, 200, 32, 0, 6.29); ctx.fill();
      ctx.strokeStyle = '#2c2620'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + 45, 200); ctx.lineTo(bx + 45, 178); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + 45, 200); ctx.lineTo(bx + 62, 208); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + 26, 182); ctx.lineTo(bx + 60, 222); ctx.moveTo(bx + 50, 175); ctx.lineTo(bx + 38, 224); ctx.stroke();
      // jagged broken top
      ctx.fillStyle = '#54493c';
      ctx.beginPath();
      ctx.moveTo(bx, 120); ctx.lineTo(bx + 20, 80); ctx.lineTo(bx + 38, 115);
      ctx.lineTo(bx + 60, 70); ctx.lineTo(bx + 90, 120); ctx.fill();
      // ruined parliament silhouette
      ctx.fillStyle = '#3c352d';
      for (let i = 0; i < 7; i++) {
        const rx = (i * 170 - camX * 0.1) % (W + 240) - 120;
        ctx.fillRect(rx, 380, 130, FLOOR - 380);
        ctx.beginPath();
        ctx.moveTo(rx, 380); ctx.lineTo(rx + 30, 330 + (i * 37) % 50);
        ctx.lineTo(rx + 70, 380); ctx.fill();
      }
      embersFx(ctx, t, W, H, '#caa05a');
      floorPlane(ctx, W, H, camX, '#5d5043', '#2c261f', 'rgba(40,34,28,0.4)');
      // rubble
      ctx.fillStyle = '#423a30';
      for (let i = 0; i < 10; i++) {
        const rx = (i * 137 - camX * 0.3) % (W + 80) - 40;
        ctx.beginPath();
        ctx.moveTo(rx, FLOOR + 10); ctx.lineTo(rx + 22, FLOOR - 6 - (i % 3) * 5); ctx.lineTo(rx + 44, FLOOR + 10);
        ctx.fill();
      }
    } };

  // ---- SITE OMEGA ----
  S.omega = { name: 'SITE OMEGA', floorY: FLOOR, music: 'fight',
    draw(ctx, t, W, H, camX) {
      ctx.fillStyle = '#0b1016'; ctx.fillRect(0, 0, W, H);
      // wall panels
      for (let i = 0; i < 12; i++) {
        const px = (i * 130 - camX * 0.2) % (W + 130) - 65;
        ctx.fillStyle = i % 2 ? '#141c26' : '#101720';
        ctx.fillRect(px, 100, 126, FLOOR - 100);
        ctx.strokeStyle = '#1f2c3c'; ctx.strokeRect(px, 100, 126, FLOOR - 100);
      }
      // the Electric Cosmic Converter (center)
      const cx = W / 2 - camX * 0.25;
      const pulse = 0.6 + Math.sin(t * 2.2) * 0.25;
      ctx.save();
      ctx.fillStyle = '#1a2533';
      ctx.fillRect(cx - 130, 140, 260, 380);
      ctx.strokeStyle = '#33485f'; ctx.lineWidth = 5;
      ctx.strokeRect(cx - 130, 140, 260, 380);
      const cg = ctx.createRadialGradient(cx, 330, 10, cx, 330, 130);
      cg.addColorStop(0, `rgba(160,230,255,${pulse})`);
      cg.addColorStop(0.6, `rgba(80,160,255,${pulse * 0.5})`);
      cg.addColorStop(1, 'rgba(20,40,80,0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, 330, 120, 0, 6.29); ctx.fill();
      // arcing energy
      ctx.strokeStyle = `rgba(170,235,255,${pulse})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        let lx = cx - 80, ly = 330 + Math.sin(t * 5 + i * 2) * 60;
        ctx.moveTo(lx, ly);
        for (let s = 0; s < 6; s++) {
          lx += 27; ly += (Math.sin(t * 13 + i * 3 + s * 7) * 28);
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
      // coil rings
      ctx.strokeStyle = '#2c3f56'; ctx.lineWidth = 8;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath(); ctx.ellipse(cx, 330, 95 + r * 14, 30 + r * 5, 0, 0, 6.29); ctx.stroke();
      }
      ctx.restore();
      // warning stripes + consoles
      for (let i = 0; i < 6; i++) {
        const px = (i * 260 - camX * 0.3) % (W + 200) - 100;
        if (Math.abs(px - cx) < 180) continue;
        ctx.fillStyle = '#16202c';
        ctx.fillRect(px, FLOOR - 90, 110, 90);
        ctx.fillStyle = Math.sin(t * 4 + i) > 0 ? '#48d4a0' : '#2a7a5c';
        ctx.fillRect(px + 12, FLOOR - 78, 86, 30);
      }
      floorPlane(ctx, W, H, camX, '#1b2531', '#0b0f15', 'rgba(80,140,200,0.14)');
    } };

  // ---- NIGHTMARE CATHEDRAL ----
  S.cathedral = { name: 'NIGHTMARE CATHEDRAL', floorY: FLOOR, music: 'boss',
    draw(ctx, t, W, H, camX) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#120a1e'); g.addColorStop(1, '#241236');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // floating shards
      for (let i = 0; i < 8; i++) {
        const fx = (i * 190 - camX * 0.07) % (W + 100) - 50;
        const fy = 70 + (i * 53) % 120 + Math.sin(t * 0.8 + i) * 14;
        ctx.fillStyle = 'rgba(90,50,140,0.5)';
        ctx.beginPath();
        ctx.moveTo(fx, fy); ctx.lineTo(fx + 16, fy + 30); ctx.lineTo(fx - 8, fy + 34);
        ctx.fill();
      }
      // stained glass windows (pulsing)
      for (let i = 0; i < 5; i++) {
        const wx = (i * 290 - camX * 0.16) % (W + 240) - 120;
        const glow = 0.5 + Math.sin(t * 1.5 + i * 1.7) * 0.3;
        const wg = ctx.createLinearGradient(wx, 140, wx, 460);
        wg.addColorStop(0, `rgba(190,90,220,${glow})`);
        wg.addColorStop(0.5, `rgba(90,40,160,${glow * 0.8})`);
        wg.addColorStop(1, `rgba(255,60,90,${glow * 0.5})`);
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(wx, 460); ctx.lineTo(wx, 200);
        ctx.arc(wx + 50, 200, 50, Math.PI, 0);
        ctx.lineTo(wx + 100, 460); ctx.fill();
        ctx.strokeStyle = '#0d0716'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(wx + 50, 150); ctx.lineTo(wx + 50, 460); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx, 300); ctx.lineTo(wx + 100, 300); ctx.stroke();
        // pillars between
        ctx.fillStyle = '#1c1029';
        ctx.fillRect(wx + 115, 130, 44, FLOOR - 130);
      }
      // candles
      for (let i = 0; i < 9; i++) {
        const cx2 = (i * 150 - camX * 0.3) % (W + 100) - 50;
        ctx.fillStyle = '#d8cfa8';
        ctx.fillRect(cx2, FLOOR - 26, 5, 26);
        const fl = 3 + Math.sin(t * 9 + i * 3) * 1.4;
        const fg = ctx.createRadialGradient(cx2 + 2, FLOOR - 30, 0, cx2 + 2, FLOOR - 30, 13);
        fg.addColorStop(0, 'rgba(255,210,120,0.95)'); fg.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.arc(cx2 + 2, FLOOR - 30, 9 + fl, 0, 6.29); ctx.fill();
      }
      floorPlane(ctx, W, H, camX, '#2a1a3e', '#120a1c', 'rgba(150,90,200,0.12)');
      // creeping fog
      ctx.fillStyle = 'rgba(140,100,190,0.08)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse((i * 400 + t * 24) % (W + 300) - 150, FLOOR + 8, 200, 30, 0, 0, 6.29);
        ctx.fill();
      }
    } };

  // ---- TOKYO INFERNO ----
  S.tokyo = { name: 'TOKYO INFERNO', floorY: FLOOR, music: 'boss',
    draw(ctx, t, W, H, camX) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1a0b08'); g.addColorStop(0.55, '#5e1c0d'); g.addColorStop(1, '#2a0f08');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // burning skyline
      for (let i = 0; i < 11; i++) {
        const bx = ((i * 140 - camX * 0.1) % (W + 200)) - 100;
        const bh = 160 + ((i * 71) % 180);
        building(ctx, bx, FLOOR - bh - 40, 90 + (i * 17) % 50, bh, '#241008', '#ff9b3d', i, t);
        // flames on rooftops
        const flick = Math.sin(t * 7 + i * 2.4) * 8;
        const fgr = ctx.createLinearGradient(bx, FLOOR - bh - 90, bx, FLOOR - bh - 30);
        fgr.addColorStop(0, 'rgba(255,170,60,0)');
        fgr.addColorStop(1, `rgba(255,${110 + (i * 20) % 60},30,0.8)`);
        ctx.fillStyle = fgr;
        ctx.beginPath();
        ctx.moveTo(bx, FLOOR - bh - 40);
        ctx.quadraticCurveTo(bx + 22, FLOOR - bh - 86 - flick, bx + 45, FLOOR - bh - 44);
        ctx.quadraticCurveTo(bx + 64, FLOOR - bh - 78 + flick, bx + 86, FLOOR - bh - 40);
        ctx.fill();
      }
      // torii gate silhouette
      const tx = W * 0.18 - camX * 0.2;
      ctx.fillStyle = '#160a06';
      ctx.fillRect(tx, 330, 22, FLOOR - 330);
      ctx.fillRect(tx + 150, 330, 22, FLOOR - 330);
      ctx.fillRect(tx - 26, 318, 226, 22);
      ctx.beginPath();
      ctx.moveTo(tx - 40, 300); ctx.quadraticCurveTo(tx + 86, 270, tx + 212, 300);
      ctx.lineTo(tx + 212, 318); ctx.quadraticCurveTo(tx + 86, 290, tx - 40, 318);
      ctx.fill();
      embersFx(ctx, t, W, H, '#ffb05e');
      // smoke layer
      ctx.fillStyle = 'rgba(30,12,8,0.45)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse((i * 330 + t * 26) % (W + 300) - 150, 120 + i * 30, 180, 40, 0, 0, 6.29);
        ctx.fill();
      }
      floorPlane(ctx, W, H, camX, '#3c1c10', '#180a06', 'rgba(255,140,60,0.1)');
    } };

  // ---- THRONE OF GLASS ----
  S.throne = { name: 'THRONE OF GLASS', floorY: FLOOR, music: 'boss',
    draw(ctx, t, W, H, camX) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#070310'); g.addColorStop(0.7, '#1c1030'); g.addColorStop(1, '#0d0618');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      stars(ctx, W, 130, 9, FLOOR);
      // nebula swirls
      for (let i = 0; i < 3; i++) {
        const ng = ctx.createRadialGradient(W * (0.2 + i * 0.3), 160 + i * 60, 10, W * (0.2 + i * 0.3), 160 + i * 60, 220);
        ng.addColorStop(0, ['rgba(255,150,80,0.12)', 'rgba(150,80,255,0.12)', 'rgba(80,160,255,0.1)'][i]);
        ng.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, W, H);
      }
      // the throne
      const cx = W / 2 - camX * 0.18;
      ctx.save();
      ctx.globalAlpha = 0.85;
      const tg = ctx.createLinearGradient(cx, 160, cx, 560);
      tg.addColorStop(0, 'rgba(190,220,255,0.35)');
      tg.addColorStop(1, 'rgba(120,150,220,0.12)');
      ctx.fillStyle = tg;
      ctx.strokeStyle = 'rgba(220,235,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 90, 560); ctx.lineTo(cx - 70, 280); ctx.lineTo(cx - 100, 170);
      ctx.lineTo(cx - 40, 250); ctx.lineTo(cx, 150); ctx.lineTo(cx + 40, 250);
      ctx.lineTo(cx + 100, 170); ctx.lineTo(cx + 70, 280); ctx.lineTo(cx + 90, 560);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // glass shine sweep
      const shx = cx - 90 + ((t * 60) % 200);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(shx, 170, 14, 390);
      ctx.restore();
      // floating glass steps
      for (let i = 0; i < 6; i++) {
        const sx = cx + (i - 2.5) * 170;
        const sy = 480 + Math.sin(t * 0.9 + i * 1.3) * 10;
        ctx.fillStyle = 'rgba(170,200,255,0.16)';
        ctx.strokeStyle = 'rgba(220,235,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(sx - 50, sy); ctx.lineTo(sx + 50, sy); ctx.lineTo(sx + 34, sy + 16); ctx.lineTo(sx - 34, sy + 16);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      floorPlane(ctx, W, H, camX, 'rgba(150,180,240,0.22)', 'rgba(20,16,42,0.9)', 'rgba(190,210,255,0.16)');
      // reflective floor sheen
      ctx.fillStyle = 'rgba(200,220,255,0.05)';
      ctx.fillRect(0, FLOOR, W, 30);
    } };

  // ---- CYBER CITY ROOFTOP (secret stage) ----
  S.rooftop = { name: 'CYBER CITY ROOFTOP', floorY: FLOOR, music: 'fight', secret: true,
    draw(ctx, t, W, H, camX) {
      cityScape(ctx, t, W, H, camX, {
        skyTop: '#04060f', skyBot: '#101a33', far: '#101626', near: '#161e33',
        win: '#ffd76b', neon: ['#ff4d8d', '#42e8ff', '#b06bff', '#5dff9e'] });
      rain(ctx, t, W, H);
      // helipad rooftop
      floorPlane(ctx, W, H, camX, '#1c2336', '#0c101c', 'rgba(110,140,200,0.14)');
      ctx.strokeStyle = 'rgba(255,210,90,0.5)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(W / 2 - camX * 0.3, FLOOR + 46, 110, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.font = '900 56px Arial'; ctx.fillStyle = 'rgba(255,210,90,0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('H', W / 2 - camX * 0.3, FLOOR + 66);
      // antenna
      const ax = W * 0.12 - camX * 0.32;
      ctx.strokeStyle = '#39455e'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(ax, FLOOR); ctx.lineTo(ax, FLOOR - 200); ctx.stroke();
      ctx.fillStyle = Math.sin(t * 3) > 0 ? '#ff4d4d' : '#701f1f';
      ctx.beginPath(); ctx.arc(ax, FLOOR - 204, 5, 0, 6.29); ctx.fill();
    } };

  const ORDER = ['prison', 'westminster', 'omega', 'cathedral', 'tokyo', 'throne', 'rooftop'];
  function list() {
    const ids = ORDER.filter(id => !S[id].secret || secretsUnlocked());
    return ids;
  }
  return { S, list, FLOOR, cityScape, rain, embersFx };
})();
