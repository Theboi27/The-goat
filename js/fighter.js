// ============================================================
// FIGHTER — combat entity: state machine, frame-data moves,
// hit detection, counters, combos, meters, projectiles, AI.
// ============================================================

// Frame data in seconds: windup -> active -> recover.
// track: keyframe pose animation across the whole move duration.
const MOVES = {
  lp: { dmg: 38, windup: 0.07, active: 0.06, recover: 0.12, reach: 62, h: 88,
    kb: 90, kup: 0, stun: 0.26, sfx: 'punch', power: 0.7, cancel: true,
    track: [[0, 'jab_w'], [0.45, 'jab_x'], [1, 'idle']] },
  hp: { dmg: 72, windup: 0.16, active: 0.08, recover: 0.24, reach: 70, h: 92,
    kb: 230, kup: 60, stun: 0.42, sfx: 'heavy', power: 1.3,
    track: [[0, 'cross_w'], [0.5, 'cross_x'], [1, 'idle']] },
  lk: { dmg: 44, windup: 0.09, active: 0.07, recover: 0.15, reach: 78, h: 60,
    kb: 120, kup: 0, stun: 0.3, sfx: 'kick', power: 0.85, cancel: true,
    track: [[0, 'fkick_w'], [0.45, 'fkick_x'], [1, 'idle']] },
  hk: { dmg: 84, windup: 0.2, active: 0.09, recover: 0.28, reach: 92, h: 96,
    kb: 300, kup: 170, stun: 0.5, sfx: 'heavy', power: 1.6,
    track: [[0, 'round_w'], [0.55, 'round_x'], [1, 'idle']] },
  upper: { dmg: 78, windup: 0.15, active: 0.08, recover: 0.3, reach: 56, h: 110,
    kb: 140, kup: 430, stun: 0.5, sfx: 'heavy', power: 1.5, launcher: true,
    track: [[0, 'upper_w'], [0.5, 'upper_x'], [1, 'idle']] },
  air_lp: { dmg: 42, windup: 0.06, active: 0.08, recover: 0.1, reach: 64, h: 80,
    kb: 110, kup: -80, stun: 0.3, sfx: 'punch', power: 0.8, air: true,
    track: [[0, 'jab_w'], [0.4, 'jab_x'], [1, 'fall']] },
  air_hk: { dmg: 80, windup: 0.12, active: 0.1, recover: 0.18, reach: 86, h: 70,
    kb: 260, kup: -260, stun: 0.45, sfx: 'heavy', power: 1.5, air: true,
    track: [[0, 'round_w'], [0.5, 'round_x'], [1, 'fall']] },
};

class Projectile {
  constructor(owner, def, x, y, dir) {
    this.owner = owner; this.def = def;
    this.x = x; this.y = y; this.dir = dir;
    this.vx = def.speed * dir; this.t = 0; this.dead = false;
    this.trail = [];
  }
  update(dt) {
    this.t += dt;
    this.x += this.vx * dt;
    this.trail.unshift([this.x, this.y]);
    if (this.trail.length > 7) this.trail.pop();
    if (this.x < -80 || this.x > 1360 || this.t > 3) this.dead = true;
  }
  draw(ctx) {
    const d = this.def, g = d.gfx;
    ctx.save();
    ctx.shadowColor = d.color; ctx.shadowBlur = 14;
    if (g === 'bolt') {
      ctx.strokeStyle = d.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      let px = this.x - this.dir * 38, py = this.y;
      ctx.moveTo(px, py);
      for (let i = 0; i < 4; i++) {
        px += this.dir * 11; py = this.y + (i % 2 ? 8 : -8) * (0.5 + Math.random());
        ctx.lineTo(px, py);
      }
      ctx.lineTo(this.x + this.dir * 8, this.y);
      ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (g === 'bullet') {
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, 12, 3.5, 0, 0, 6.29); ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,140,0.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(this.x - this.dir * 60, this.y); ctx.lineTo(this.x, this.y); ctx.stroke();
    } else if (g === 'water') {
      ctx.fillStyle = d.color;
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < this.trail.length; i++) {
        const [tx, ty] = this.trail[i];
        ctx.beginPath();
        ctx.arc(tx, ty + Math.sin(this.t * 14 + i) * 5, 13 - i * 1.5, 0, 6.29);
        ctx.fill();
      }
    } else if (g === 'ice') {
      ctx.fillStyle = d.color;
      ctx.translate(this.x, this.y); ctx.rotate(this.t * 9 * this.dir);
      for (let i = 0; i < 3; i++) {
        ctx.rotate(2.09);
        ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(16, 0); ctx.lineTo(0, 3); ctx.fill();
      }
    } else if (g === 'air') {
      ctx.strokeStyle = d.color; ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(this.x - this.dir * i * 8, this.y, 14 + i * 4, -1.1 + this.dir * 0.5, 1.1 + this.dir * 0.5);
        ctx.stroke();
      }
    } else if (g === 'blade') {
      ctx.strokeStyle = d.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.translate(this.x, this.y); ctx.rotate(this.t * 14 * this.dir);
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke();
    } else if (g === 'plasma' || g === 'void') {
      const rg = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, 16);
      rg.addColorStop(0, '#fff'); rg.addColorStop(0.4, d.color); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(this.x, this.y, 16, 0, 6.29); ctx.fill();
    }
    ctx.restore();
  }
}

class Fighter {
  constructor(charId, player, x, facing, isAI, aiLevel = 1) {
    this.ch = CHARACTERS[charId];
    this.player = player;        // 0 or 1 (input map index)
    this.isAI = isAI;
    this.aiLevel = aiLevel;
    this.x = x; this.airH = 0; this.vy = 0; this.vx = 0;
    this.facing = facing;
    this.maxHp = this.ch.stats.hp;
    this.hp = this.maxHp;
    this.meter = 0;              // super meter 0..100
    this.stamina = 100;          // hyper-dash resource
    this.state = 'idle';
    this.stateT = 0;
    this.move = null;            // current attack move def
    this.moveDur = 0;
    this.hitConfirmed = false;
    this.combo = 0;
    this.comboT = 0;
    this.blockT = -9;            // time block was pressed (for perfect counter)
    this.t = 0;                  // personal clock
    this.hitstop = 0;
    this.flashT = 0;
    this.slowT = 0;              // Static State debuff
    this.freezeT = 0;            // frozen debuff
    this.reverseT = 0;           // reversed controls debuff
    this.adaptStacks = 0;        // Conrad passive
    this.buffT = 0; this.buffKind = 0; // Tecton shapeshift
    this.flying = false;
    this.aiTimer = 0; this.aiAction = 'approach';
    this.entranceDone = false;
    this.pose = Humanoid.pose('idle');
    this.prevPose = null;
    this.winTimer = 0;
    this.superFlash = 0;
    this.dashTrail = [];
  }

  get grounded() { return this.airH <= 0.01 && !this.flying; }
  get busy() { return ['attack','special','super','hit','launch','down','getup','entrance','ko'].includes(this.state); }
  get speedMul() {
    let m = this.ch.stats.speed;
    if (this.buffT > 0 && this.buffKind === 1) m *= 1.45;
    if (this.slowT > 0) m *= 0.1;
    if (this.freezeT > 0) m = 0;
    return m;
  }
  get powerMul() {
    let m = this.ch.stats.power;
    if (this.buffT > 0 && this.buffKind === 0) m *= 1.4;
    if (this.ch.adaptive) m *= 1 + this.adaptStacks * 0.04;
    return m;
  }

  setState(s, dur = 0) {
    this.state = s; this.stateT = 0; this.moveDur = dur;
  }

  input(action, type = 'held') {
    if (this.isAI) return this.aiInput && this.aiInput[action];
    return type === 'held' ? Input.held(this.player, action) : Input.pressed(this.player, action);
  }
  pressed(action) {
    if (this.isAI) return this.aiPressed && this.aiPressed[action];
    return Input.pressed(this.player, action);
  }

  // ---------------- UPDATE ----------------
  update(dt, opp, game) {
    this.t += dt;
    if (this.hitstop > 0) { this.hitstop -= dt; this.updatePoseOnly(dt * 0.05); return; }
    // debuff timers
    if (this.slowT > 0) this.slowT -= dt;
    if (this.freezeT > 0) { this.freezeT -= dt; this.updatePoseOnly(0); return; }
    if (this.reverseT > 0) this.reverseT -= dt;
    if (this.buffT > 0) this.buffT -= dt;
    if (this.flashT > 0) this.flashT -= dt;
    if (this.superFlash > 0) this.superFlash -= dt;
    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    this.stamina = Math.min(100, this.stamina + dt * 26);

    const effDt = this.slowT > 0 ? dt * 0.1 : dt;
    this.stateT += effDt;

    if (this.isAI && game.fightActive) this.runAI(dt, opp, game);

    // face the opponent when not mid-move
    if (!this.busy && game.fightActive) this.facing = opp.x >= this.x ? 1 : -1;

    switch (this.state) {
      case 'idle': case 'walk': case 'crouch': case 'block': case 'fly':
        this.motion(effDt, opp, game); break;
      case 'jump': case 'fall':
        this.airMotion(effDt, opp, game); break;
      case 'dash': this.dashUpdate(effDt, game); break;
      case 'attack': this.attackUpdate(effDt, opp, game); break;
      case 'special': this.specialUpdate(effDt, opp, game); break;
      case 'super': this.superUpdate(effDt, opp, game); break;
      case 'hit':
        if (this.stateT > this.moveDur) this.setState(this.grounded ? 'idle' : 'fall');
        this.physics(effDt); break;
      case 'launch':
        this.physics(effDt);
        if (this.grounded && this.vy >= 0) {
          AudioSys.sfx('land'); FX.shake(7);
          FX.debris(this.x, game.stage.floorY, '#666', 5);
          this.setState(this.hp <= 0 ? 'ko' : 'down', 0.7);
        }
        break;
      case 'down':
        if (this.stateT > this.moveDur) this.setState('getup', 0.35);
        break;
      case 'getup':
        if (this.stateT > this.moveDur) this.setState('idle');
        break;
      case 'entrance': this.entranceUpdate(effDt, game); break;
      case 'win': this.winTimer += dt; break;
      case 'ko': this.physics(effDt); break;
    }

    // clamp arena
    this.x = Math.max(70, Math.min(1210, this.x));
    this.updatePoseOnly(effDt);
  }

  physics(dt) {
    if (!this.flying) {
      this.vy += 1900 * dt;
      this.airH -= this.vy * dt;
      if (this.airH <= 0) { this.airH = 0; this.vy = 0; }
    }
    this.x += this.vx * dt;
    this.vx *= Math.pow(0.04, dt);
  }

  motion(dt, opp, game) {
    if (!game.fightActive) { this.setIdlePose(); return; }
    const rev = this.reverseT > 0 ? -1 : 1;
    const left = this.input('left'), right = this.input('right');
    const upHeld = this.input('up'), downHeld = this.input('downK');
    let mx = 0;
    if (left) mx -= 1; if (right) mx += 1;
    mx *= rev;

    // flight toggle
    if (this.ch.flight && this.state === 'fly') {
      const fs = 330 * this.speedMul;
      this.x += mx * fs * dt;
      if (upHeld) this.airH = Math.min(280, this.airH + fs * dt);
      if (downHeld) this.airH -= fs * dt;
      this.stamina -= dt * 14;
      if (this.airH <= 0 || this.stamina <= 0 || this.pressed('up')) {
        this.flying = false; this.airH = Math.max(0, this.airH);
        this.setState(this.airH > 0 ? 'fall' : 'idle');
      }
      if (this.tryAttacks(opp, game)) return;
      return;
    }

    // block (hold down/S while grounded)
    if (downHeld && this.grounded) {
      if (this.state !== 'block') { this.blockT = this.t; this.setState('block'); }
      return;
    } else if (this.state === 'block') this.setState('idle');

    // jump / start flight
    if (this.pressed('up') && this.grounded) {
      if (this.ch.flight && upHeld && this.lastJumpT && this.t - this.lastJumpT < 0.3) {
        this.flying = true; this.setState('fly'); AudioSys.sfx('whoosh');
        FX.smokePuff(this.x, game.stage.floorY, 'rgba(200,220,255,0.4)', 6, 0.7);
      } else {
        this.vy = -720; this.airH = 0.1; this.setState('jump');
        AudioSys.sfx('jump');
        this.lastJumpT = this.t;
      }
      return;
    }

    // dash
    if (this.pressed('dash') && this.stamina >= 30) {
      this.stamina -= 30;
      this.dashDir = mx !== 0 ? Math.sign(mx) : this.facing;
      this.setState('dash', 0.18);
      AudioSys.sfx('dash');
      this.dashTrail = [];
      return;
    }

    if (this.tryAttacks(opp, game)) return;

    // walk
    if (mx !== 0) {
      this.x += mx * 250 * this.speedMul * dt;
      this.setState('walk');
    } else if (this.state === 'walk') this.setState('idle');
  }

  airMotion(dt, opp, game) {
    this.physics(dt);
    const rev = this.reverseT > 0 ? -1 : 1;
    let mx = 0;
    if (this.input('left')) mx -= 1;
    if (this.input('right')) mx += 1;
    this.x += mx * rev * 220 * this.speedMul * dt;
    if (this.vy > 0 && this.state === 'jump') this.setState('fall');
    if (this.grounded) { this.setState('idle'); AudioSys.sfx('land'); }
    // start flight mid-air
    if (this.ch.flight && this.pressed('up') && this.stamina > 20) {
      this.flying = true; this.setState('fly'); AudioSys.sfx('whoosh');
    }
    this.tryAttacks(opp, game, true);
  }

  dashUpdate(dt, game) {
    const sp = 950 * this.speedMul;
    this.x += this.dashDir * sp * dt;
    this.dashTrail.push({ x: this.x, airH: this.airH, t: 0.18 });
    if (this.stateT > this.moveDur) this.setState(this.grounded ? 'idle' : 'fall');
  }

  tryAttacks(opp, game, inAir = false) {
    if (!game.fightActive) return false;
    inAir = inAir || this.flying || this.airH > 4;
    const down = this.input('downK');
    if (this.pressed('lp')) return this.startMove(inAir ? 'air_lp' : (down ? 'upper' : 'lp'));
    if (this.pressed('hp')) return this.startMove(inAir ? 'air_lp' : (down ? 'upper' : 'hp'));
    if (this.pressed('lk')) return this.startMove(inAir ? 'air_hk' : 'lk');
    if (this.pressed('hk')) return this.startMove(inAir ? 'air_hk' : 'hk');
    if (this.pressed('special')) return this.startSpecial(opp, game);
    if (this.pressed('superK') && this.meter >= 100) return this.startSuper(opp, game);
    return false;
  }

  startMove(key) {
    const m = MOVES[key];
    this.move = m; this.moveKey = key;
    this.hitConfirmed = false;
    this.setState('attack', m.windup + m.active + m.recover);
    return true;
  }

  attackUpdate(dt, opp, game) {
    const m = this.move;
    const t = this.stateT;
    // whoosh at active start
    if (!this.whooshed && t >= m.windup) { AudioSys.sfx('whoosh'); this.whooshed = true; }
    if (t < m.windup + m.active && t >= m.windup && !this.hitConfirmed) {
      this.checkHit(opp, game, m);
    }
    if (!this.grounded && !this.flying) this.physics(dt);
    if (t >= this.moveDur) {
      this.whooshed = false;
      this.setState(this.grounded ? 'idle' : 'fall');
    } else if (this.hitConfirmed && m.cancel && t > m.windup + m.active) {
      // combo-cancel window: chain into another attack (the Link System)
      if (this.pressed('lp') || this.pressed('hp') || this.pressed('lk') ||
          this.pressed('hk') || this.pressed('special')) {
        this.whooshed = false;
        this.tryAttacks(opp, game);
      }
    }
  }

  checkHit(opp, game, m) {
    const reach = m.reach * this.ch.stats.reach * (this.ch.toon ? 1.25 : 1);
    const hx = this.x + this.facing * reach;
    const hy = game.stage.floorY - this.airH - m.h;
    // opponent body box
    const ow = 46, oTop = game.stage.floorY - opp.airH - 170 * (opp.ch.visual.heightScale || 1);
    const oBot = game.stage.floorY - opp.airH;
    if (Math.abs(hx - opp.x) < ow + 18 && hy > oTop - 26 && hy < oBot + 10) {
      this.hitConfirmed = true;
      game.resolveHit(this, opp, m, hx, hy);
    }
  }

  // ---------------- SPECIALS ----------------
  startSpecial(opp, game) {
    if (this.specialCd > this.t) return false;
    const sp = this.ch.special;
    this.specialCd = this.t + 0.9;
    this.setState('special', 0.5);
    AudioSys.sfx(sp.sfx || 'special');
    this.specialFired = false;
    return true;
  }

  specialUpdate(dt, opp, game) {
    const sp = this.ch.special;
    if (!this.specialFired && this.stateT > 0.18) {
      this.specialFired = true;
      const y = game.stage.floorY - this.airH - 110;
      if (sp.kind === 'projectile') {
        game.projectiles.push(new Projectile(this, sp, this.x + this.facing * 40, y, this.facing));
      } else if (sp.kind === 'beam') {
        game.fireBeam(this, opp, sp.dmg * this.powerMul, sp.color, false);
      } else if (sp.kind === 'drop') {
        game.dropWeight(this, opp, sp.dmg * this.powerMul, sp.color, false);
      } else if (sp.kind === 'dashstrike') {
        const tx = opp.x - this.facing * 60;
        FX.smokePuff(this.x, game.stage.floorY - this.airH - 60, '#9af', 8, 0.8);
        this.x = Math.max(70, Math.min(1210, tx));
        FX.smokePuff(this.x, game.stage.floorY - this.airH - 60, '#9af', 8, 0.8);
        AudioSys.sfx('teleport');
        const m = { dmg: sp.dmg, kb: 200, kup: 80, stun: 0.4, power: 1.4, sfx: 'slash', reach: 60, h: 90 };
        this.checkHit(opp, game, m);
      } else if (sp.kind === 'buff') {
        this.buffKind = (this.buffKind + 1) % 3;
        this.buffT = 5;
        const labels = sp.forms;
        FX.popup(this.x, game.stage.floorY - 220, labels[this.buffKind], sp.color, 24);
        FX.smokePuff(this.x, game.stage.floorY, 'rgba(150,220,100,0.5)', 12, 1);
        if (this.buffKind === 2) { this.flying = true; this.setState('fly'); return; }
      }
    }
    if (this.stateT > this.moveDur) this.setState(this.grounded ? 'idle' : 'fall');
  }

  // ---------------- SUPERS ----------------
  startSuper(opp, game) {
    this.meter = 0;
    const s = this.ch.sup;
    this.setState('super', s.kind === 'rush' ? 1.6 : 1.3);
    this.superPhase = 0;
    this.superFlash = 0.9;
    game.superBanner = { name: s.name, color: s.color, t: 1.4, quote: s.quote, owner: this };
    AudioSys.sfx('super');
    FX.flash('rgba(0,0,0,0.65)', 0.5);
    FX.slowmo(0.4, 0.2);
    return true;
  }

  superUpdate(dt, opp, game) {
    const s = this.ch.sup;
    const t = this.stateT;
    if (s.kind === 'rush') {
      if (t > 0.45 && this.superPhase < s.hits) {
        const interval = (1.5 - 0.45) / s.hits;
        if (t > 0.45 + this.superPhase * interval) {
          this.superPhase++;
          // teleporting flurry around the opponent
          this.x = opp.x - this.facing * 55 * (this.superPhase % 2 === 0 ? 1 : -1);
          this.facing = opp.x >= this.x ? 1 : -1;
          const dmg = (s.dmg / s.hits) * this.powerMul;
          game.applyDamage(this, opp, dmg, s.kind, {
            kb: this.superPhase === s.hits ? 420 : 60,
            kup: this.superPhase === s.hits ? 320 : 40,
            stun: 0.4, power: this.superPhase === s.hits ? 2 : 1, sfx: s.sfx });
        }
      }
    } else if (s.kind === 'beam') {
      if (!this.superFired && t > 0.5) {
        this.superFired = true;
        game.fireBeam(this, opp, s.dmg * this.powerMul, s.color, true, s.after);
      }
    } else if (s.kind === 'slam') {
      if (!this.superFired && t > 0.55) {
        this.superFired = true;
        game.groundSlam(this, opp, s.dmg * this.powerMul, s.color, s.after);
      }
    } else if (s.kind === 'drop') {
      if (!this.superFired && t > 0.4) {
        this.superFired = true;
        game.dropWeight(this, opp, s.dmg * this.powerMul, s.color, true);
      }
    } else if (s.kind === 'sphere') {
      if (!this.superFired && t > 0.5) {
        this.superFired = true;
        game.sphereCrush(this, opp, s.dmg * this.powerMul, s.color, s.after);
      }
    }
    if (t >= this.moveDur) {
      this.superFired = false; this.superPhase = 0;
      if (s.after === 'slow') { opp.slowT = 3.5; FX.popup(opp.x, 300, 'STATIC STATE', '#9fefff', 30); }
      this.setState(this.grounded ? 'idle' : 'fall');
    }
  }

  // ---------------- DAMAGE INTAKE ----------------
  takeHit(dmg, m, attacker, game) {
    // blocking?
    const blocking = this.state === 'block' && (attacker.x - this.x) * this.facing > 0;
    if (blocking) {
      const sinceBlock = this.t - this.blockT;
      if (sinceBlock < 0.18) {
        // PERFECT COUNTER
        AudioSys.sfx('counter');
        FX.flash('rgba(180,240,255,0.35)', 0.25);
        FX.slowmo(0.45, 0.18);
        FX.popup(this.x, game.stage.floorY - 240, 'COUNTER!', '#aef6ff', 36);
        FX.impact(this.x + this.facing * 50, game.stage.floorY - 110, '#aef6ff', 1.6);
        attacker.hitstop = 0.32;
        attacker.vx = -attacker.facing * 320;
        attacker.setState('hit', 0.55);
        this.meter = Math.min(100, this.meter + 18);
        return 0;
      }
      AudioSys.sfx('block');
      FX.impact(this.x + this.facing * 38, game.stage.floorY - this.airH - 100, '#cfd8e8', 0.4);
      this.x -= attacker.facing * -1 * 0; // hold ground
      this.vx = attacker.facing * 90;
      this.meter = Math.min(100, this.meter + 2);
      return dmg * 0.12;
    }
    return dmg;
  }

  // ---------------- ENTRANCES ----------------
  beginEntrance(game) {
    this.setState('entrance', 1.6);
    this.entranceDone = false;
    const e = this.ch.entrance;
    this.entX = this.x;
    if (e === 'fly') { this.airH = 420; this.x = this.entX - this.facing * 120; }
    else if (e === 'walk') { this.x = this.entX - this.facing * 260; }
    else if (e === 'crash') { this.airH = 520; }
    else { /* smoke, teleport, water, ice appear in place */ this.entHidden = true; }
  }

  entranceUpdate(dt, game) {
    const e = this.ch.entrance;
    const k = Math.min(1, this.stateT / 1.1);
    const ease = 1 - Math.pow(1 - k, 3);
    if (e === 'fly') {
      this.airH = 420 * (1 - ease);
      this.x = this.entX - this.facing * 120 * (1 - ease);
      if (k >= 1 && !this.entranceDone) {
        this.entranceDone = true; AudioSys.sfx('land');
        FX.smokePuff(this.x, game.stage.floorY, 'rgba(180,200,230,0.5)', 8, 0.8);
      }
    } else if (e === 'walk') {
      this.x = this.entX - this.facing * 260 * (1 - k);
    } else if (e === 'crash') {
      this.airH = Math.max(0, 520 * (1 - k * k * 1.6));
      if (this.airH <= 0 && !this.entranceDone) {
        this.entranceDone = true;
        AudioSys.sfx('heavy'); FX.shake(14);
        FX.debris(this.x, game.stage.floorY, '#8a6f4d', 14);
        FX.impact(this.x, game.stage.floorY - 20, '#d8a55f', 1.8);
      }
    } else if (this.entHidden) {
      if (this.stateT > 0.55) {
        this.entHidden = false;
        if (e === 'smoke') { AudioSys.sfx('smoke'); FX.smokePuff(this.x, game.stage.floorY - 60, '#9aa3ad', 18, 1.2); }
        else if (e === 'teleport') {
          AudioSys.sfx('teleport');
          FX.flash('rgba(180,140,255,0.18)', 0.2);
          for (let i = 0; i < 3; i++)
            FX.lightning(this.x + FX.rnd(-40, 40), game.stage.floorY - 220, this.x, game.stage.floorY - 80, this.ch.theme);
        }
        else if (e === 'water') { AudioSys.sfx('splash'); FX.smokePuff(this.x, game.stage.floorY - 40, 'rgba(95,229,212,0.7)', 16, 1.1); }
        else if (e === 'ice') { AudioSys.sfx('ice'); FX.debris(this.x, game.stage.floorY, '#cfeeff', 12); FX.smokePuff(this.x, game.stage.floorY - 50, 'rgba(207,238,255,0.6)', 10, 1); }
      }
    }
    if (this.stateT >= this.moveDur) this.setState('idle');
  }

  // ---------------- AI ----------------
  runAI(dt, opp, game) {
    this.aiInput = {}; this.aiPressed = {};
    this.aiTimer -= dt;
    const dist = Math.abs(opp.x - this.x);
    const dir = opp.x > this.x ? 'right' : 'left';
    const lvl = this.aiLevel; // 1..3
    if (this.aiTimer <= 0) {
      this.aiTimer = FX.rnd(0.12, 0.4 - lvl * 0.06);
      const r = Math.random();
      if (opp.state === 'attack' && dist < 130 && r < 0.24 + lvl * 0.12) this.aiAction = 'block';
      else if (dist > 320) this.aiAction = r < 0.3 ? 'special' : (r < 0.45 && this.stamina > 40 ? 'dashin' : 'approach');
      else if (dist < 130) {
        if (this.meter >= 100 && r < 0.3 + lvl * 0.1) this.aiAction = 'super';
        else if (r < 0.62) this.aiAction = 'attack';
        else if (r < 0.78) this.aiAction = 'mixup';
        else this.aiAction = 'retreat';
      }
      else this.aiAction = r < 0.7 ? 'approach' : (r < 0.85 ? 'jumpin' : 'special');
    }
    switch (this.aiAction) {
      case 'approach': this.aiInput[dir] = true; break;
      case 'retreat': this.aiInput[dir === 'right' ? 'left' : 'right'] = true; break;
      case 'block': this.aiInput.downK = true; break;
      case 'dashin': this.aiPressed.dash = true; this.aiInput[dir] = true; this.aiAction = 'approach'; break;
      case 'jumpin': this.aiPressed.up = true; this.aiInput[dir] = true; this.aiAction = 'approach'; break;
      case 'special': this.aiPressed.special = true; this.aiAction = 'approach'; break;
      case 'super': this.aiPressed.superK = true; this.aiAction = 'approach'; break;
      case 'attack': {
        const r = Math.random();
        this.aiPressed[r < 0.35 ? 'lp' : r < 0.6 ? 'lk' : r < 0.82 ? 'hp' : 'hk'] = true;
        if (Math.random() < 0.45) this.aiAction = 'attack'; // pressure strings
        break;
      }
      case 'mixup': this.aiInput.downK = true; this.aiPressed.lp = true; this.aiAction = 'attack'; break;
    }
  }

  // ---------------- POSE / DRAW ----------------
  setIdlePose() { this.targetTrack = null; }

  updatePoseOnly(dt) {
    let target;
    const breathe = Math.sin(this.t * 2.6) * 1.2;
    switch (this.state) {
      case 'idle': target = { ...Humanoid.pose('idle') }; target.hipY += breathe * 0.6; break;
      case 'walk': {
        const k = (this.t * 5 * this.speedMul) % 2;
        target = k < 1 ? Humanoid.lerp(Humanoid.pose('walk1'), Humanoid.pose('walk2'), k)
                       : Humanoid.lerp(Humanoid.pose('walk2'), Humanoid.pose('walk1'), k - 1);
        break;
      }
      case 'jump': target = Humanoid.pose('jump'); break;
      case 'fall': target = Humanoid.pose('fall'); break;
      case 'crouch': target = Humanoid.pose('crouch'); break;
      case 'block': target = Humanoid.pose('block'); break;
      case 'dash': target = Humanoid.pose('dash'); break;
      case 'fly': target = Humanoid.pose('fly'); break;
      case 'attack': target = Humanoid.sample(this.move.track, this.stateT / this.moveDur); break;
      case 'special': {
        const sp = this.ch.special;
        const tk = sp.kind === 'dashstrike'
          ? [[0, 'sword_w'], [0.5, 'sword_x'], [1, 'idle']]
          : [[0, 'cast_w'], [0.4, 'cast'], [1, 'idle']];
        target = Humanoid.sample(tk, this.stateT / this.moveDur);
        break;
      }
      case 'super': {
        const s = this.ch.sup;
        const tk = s.kind === 'rush' ? [[0, 'charge'], [0.25, 'dash'], [0.8, 'cross_x'], [1, 'idle']]
          : s.kind === 'slam' ? [[0, 'charge'], [0.35, 'slam_w'], [0.55, 'slam_x'], [1, 'idle']]
          : [[0, 'charge'], [0.4, 'cast'], [0.85, 'cast'], [1, 'idle']];
        target = Humanoid.sample(tk, this.stateT / this.moveDur);
        break;
      }
      case 'hit': target = Humanoid.lerp(Humanoid.pose('hit'), Humanoid.pose('hit2'),
        Math.min(1, this.stateT * 4)); break;
      case 'launch': target = Humanoid.pose('launch'); break;
      case 'down': case 'ko': target = Humanoid.pose('down'); break;
      case 'getup': target = Humanoid.sample([[0, 'down'], [0.6, 'getup'], [1, 'idle']],
        this.stateT / this.moveDur); break;
      case 'entrance': {
        const e = this.ch.entrance;
        target = e === 'fly' || e === 'crash' ? Humanoid.pose(this.airH > 5 ? 'fly' : 'idle')
          : e === 'walk' ? null : Humanoid.pose('stance_t');
        if (e === 'walk') {
          const k = (this.t * 4.4) % 2;
          target = k < 1 ? Humanoid.lerp(Humanoid.pose('walk1'), Humanoid.pose('walk2'), k)
                         : Humanoid.lerp(Humanoid.pose('walk2'), Humanoid.pose('walk1'), k - 1);
        }
        break;
      }
      case 'win': {
        const wk = Math.min(1, this.winTimer * 1.6);
        target = Humanoid.lerp(Humanoid.pose('idle'), Humanoid.pose(this.ch.boss ? 'win2' : 'win'), wk);
        break;
      }
      default: target = Humanoid.pose('idle');
    }
    // critically-damped blend toward target = fluid, lag-free transitions
    const k = Math.min(1, dt * 18);
    this.pose = this.pose ? Humanoid.lerp(this.pose, target, Math.max(k, this.hitstop > 0 ? 0 : k)) : target;
  }

  draw(ctx, game) {
    if (this.entHidden) return;
    const floorY = game.stage.floorY;
    // dash afterimages
    for (const tr of this.dashTrail) {
      tr.t -= 0.016;
      if (tr.t > 0) {
        Humanoid.draw(ctx, this.ch, Humanoid.pose('dash'),
          { x: tr.x, y: floorY, facing: this.facing, scale: 2.5, t: this.t,
            alpha: tr.t * 1.6, airH: tr.airH, shadow: false, aura: this.ch.theme });
      }
    }
    this.dashTrail = this.dashTrail.filter(tr => tr.t > 0);

    let aura = null;
    if (this.superFlash > 0) aura = this.ch.sup.color;
    else if (this.buffT > 0) aura = ['#e09c4a', '#ffe97a', '#9adfff'][this.buffKind];
    else if (this.ch.adaptive && this.adaptStacks > 3) aura = 'rgba(255,90,70,0.8)';
    if (this.freezeT > 0) aura = '#bfe8ff';

    const flashing = this.flashT > 0 && (this.t * 30 | 0) % 2 === 0;
    Humanoid.draw(ctx, this.ch, this.pose, {
      x: this.x, y: floorY, facing: this.facing, scale: 2.5, t: this.t,
      airH: this.airH, aura, flash: flashing,
      windX: this.state === 'walk' || this.state === 'dash' ? 0.6 : 0,
      alpha: this.state === 'dash' ? 0.85 : 1,
    });

    // frozen overlay
    if (this.freezeT > 0) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#bfe8ff';
      ctx.beginPath();
      ctx.ellipse(this.x, floorY - this.airH - 105, 52, 115, 0, 0, 6.29);
      ctx.fill();
      ctx.restore();
    }
    // static-state sparks
    if (this.slowT > 0 && Math.random() < 0.25) {
      FX.lightning(this.x - 30, floorY - this.airH - 180, this.x + 30, floorY - this.airH - 40, '#9fefff');
    }
  }
}
