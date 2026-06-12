// ============================================================
// HUMANOID — parametric human character renderer.
// Skeleton-driven: poses are joint-angle sets, interpolated for
// fluid animation. Costume layers (suit, armor, cape, mask,
// emblem, weapons, auras) are drawn per-character.
//
// Pose convention (local space, +x = facing direction, y up = -):
//   hipY  : hip height above ground
//   torso : lean angle (0 vertical, + leans forward)
//   head  : head tilt relative to torso
//   aLu/aLf, aRu/aRf : arm angles (upper from torso: 0=down,
//                      +=forward; forearm: relative bend)
//   lLt/lLk, lRt/lRk : legs (thigh from hip 0=down +=forward;
//                      knee relative bend, usually negative=back)
// ============================================================
const Humanoid = (() => {

  // body segment lengths at scale 1
  const B = { torso: 34, neck: 5, headR: 8.5, uArm: 16, fArm: 15, hand: 4.2,
              thigh: 25, shin: 24, foot: 9, shoulderW: 11, hipW: 6.5 };

  // ---------------- POSE LIBRARY ----------------
  const P = {};
  function def(name, p) { P[name] = p; return p; }

  def('idle', { hipY: 50, torso: 0.06, head: -0.04,
    aLu: 0.55, aLf: 1.95, aRu: 0.15, aRf: 1.7,
    lLt: 0.38, lLk: -0.3, lRt: -0.34, lRk: 0.34 });

  def('walk1', { hipY: 51, torso: 0.1, head: -0.06,
    aLu: 0.45, aLf: 1.8, aRu: -0.1, aRf: 1.5,
    lLt: 0.6, lLk: -0.35, lRt: -0.5, lRk: 0.75 });
  def('walk2', { hipY: 50, torso: 0.1, head: -0.06,
    aLu: 0.2, aLf: 1.6, aRu: 0.35, aRf: 1.75,
    lLt: -0.45, lLk: 0.7, lRt: 0.55, lRk: -0.3 });

  def('jump', { hipY: 50, torso: 0.18, head: -0.1,
    aLu: 0.9, aLf: 1.4, aRu: -0.6, aRf: 1.0,
    lLt: 1.0, lLk: -1.9, lRt: 0.3, lRk: -1.2 });
  def('fall', { hipY: 50, torso: -0.12, head: 0.06,
    aLu: 1.6, aLf: 0.7, aRu: -1.1, aRf: 0.5,
    lLt: 0.55, lLk: -0.8, lRt: -0.3, lRk: 0.3 });

  def('crouch', { hipY: 27, torso: 0.5, head: -0.4,
    aLu: 0.7, aLf: 2.0, aRu: 0.35, aRf: 1.85,
    lLt: 1.5, lLk: -2.5, lRt: -0.9, lRk: 2.2 });

  def('block', { hipY: 49, torso: -0.12, head: 0.06,
    aLu: 1.05, aLf: 2.35, aRu: 0.8, aRf: 2.5,
    lLt: 0.42, lLk: -0.35, lRt: -0.38, lRk: 0.4 });

  // punches
  def('jab_w', { hipY: 50, torso: 0.0, head: -0.02,
    aLu: 0.65, aLf: 2.1, aRu: -0.25, aRf: 2.3,
    lLt: 0.38, lLk: -0.3, lRt: -0.34, lRk: 0.34 });
  def('jab_x', { hipY: 50, torso: 0.28, head: -0.1,
    aLu: 1.62, aLf: 0.04, aRu: 0.2, aRf: 2.2,
    lLt: 0.5, lLk: -0.35, lRt: -0.5, lRk: 0.5 });
  def('cross_w', { hipY: 49, torso: -0.28, head: 0.1,
    aLu: 0.8, aLf: 2.2, aRu: -0.85, aRf: 1.5,
    lLt: 0.45, lLk: -0.35, lRt: -0.45, lRk: 0.45 });
  def('cross_x', { hipY: 51, torso: 0.5, head: -0.18,
    aLu: 0.25, aLf: 2.1, aRu: 1.75, aRf: 0.02,
    lLt: 0.7, lLk: -0.4, lRt: -0.7, lRk: 0.7 });
  def('upper_w', { hipY: 38, torso: 0.45, head: -0.2,
    aLu: 0.6, aLf: 2.2, aRu: -0.5, aRf: 2.6,
    lLt: 1.0, lLk: -1.6, lRt: -0.6, lRk: 1.3 });
  def('upper_x', { hipY: 56, torso: -0.25, head: 0.05,
    aLu: 0.4, aLf: 2.0, aRu: 2.6, aRf: 0.45,
    lLt: 0.5, lLk: -0.25, lRt: -0.55, lRk: 0.6 });

  // kicks
  def('fkick_w', { hipY: 50, torso: 0.1, head: -0.05,
    aLu: 0.6, aLf: 2.0, aRu: 0.2, aRf: 1.8,
    lLt: 0.95, lLk: -2.1, lRt: -0.15, lRk: 0.15 });
  def('fkick_x', { hipY: 52, torso: -0.3, head: 0.12,
    aLu: 0.95, aLf: 1.7, aRu: -0.7, aRf: 1.1,
    lLt: 1.62, lLk: -0.06, lRt: -0.28, lRk: 0.3 });
  def('round_w', { hipY: 50, torso: 0.25, head: -0.1,
    aLu: 0.4, aLf: 1.9, aRu: 0.5, aRf: 1.9,
    lLt: 0.55, lLk: -1.5, lRt: -0.3, lRk: 0.3 });
  def('round_x', { hipY: 55, torso: -0.62, head: 0.25,
    aLu: 1.2, aLf: 1.2, aRu: -1.3, aRf: 0.8,
    lLt: 1.85, lLk: -0.12, lRt: -0.5, lRk: 0.55 });

  // reactions
  def('hit', { hipY: 48, torso: -0.4, head: -0.35,
    aLu: -0.5, aLf: 1.1, aRu: -0.85, aRf: 0.8,
    lLt: 0.5, lLk: -0.4, lRt: -0.45, lRk: 0.5 });
  def('hit2', { hipY: 46, torso: -0.6, head: -0.5,
    aLu: -0.9, aLf: 0.7, aRu: -1.2, aRf: 0.5,
    lLt: 0.7, lLk: -0.5, lRt: -0.6, lRk: 0.7 });
  def('launch', { hipY: 50, torso: -1.05, head: -0.4,
    aLu: -1.5, aLf: 0.4, aRu: -1.9, aRf: 0.3,
    lLt: 1.3, lLk: -0.6, lRt: 0.8, lRk: -0.9 });
  def('down', { hipY: 9, torso: -1.42, head: -0.15,
    aLu: -1.7, aLf: 0.15, aRu: -1.35, aRf: 0.2,
    lLt: 1.5, lLk: -0.25, lRt: 1.35, lRk: -0.15 });
  def('getup', { hipY: 30, torso: 0.65, head: -0.45,
    aLu: 1.1, aLf: 1.3, aRu: 0.7, aRf: 1.5,
    lLt: 1.4, lLk: -2.4, lRt: -0.8, lRk: 2.0 });

  // movement / power
  def('dash', { hipY: 46, torso: 0.55, head: -0.25,
    aLu: 1.3, aLf: 0.9, aRu: -1.0, aRf: 0.7,
    lLt: 1.1, lLk: -0.7, lRt: -1.0, lRk: 1.4 });
  def('fly', { hipY: 50, torso: 1.18, head: -0.85,
    aLu: 2.6, aLf: 0.1, aRu: 0.4, aRf: 0.5,
    lLt: -0.35, lLk: 0.3, lRt: -0.5, lRk: 0.45 });
  def('cast', { hipY: 49, torso: 0.22, head: -0.1,
    aLu: 1.5, aLf: 0.1, aRu: 1.35, aRf: 0.15,
    lLt: 0.55, lLk: -0.4, lRt: -0.55, lRk: 0.55 });
  def('cast_w', { hipY: 47, torso: -0.2, head: 0.05,
    aLu: -0.6, aLf: 1.6, aRu: -0.8, aRf: 1.8,
    lLt: 0.45, lLk: -0.35, lRt: -0.45, lRk: 0.5 });
  def('charge', { hipY: 42, torso: 0.15, head: -0.1,
    aLu: 0.85, aLf: 2.5, aRu: 0.6, aRf: 2.6,
    lLt: 0.85, lLk: -1.1, lRt: -0.75, lRk: 1.0 });
  def('slam_w', { hipY: 56, torso: -0.15, head: 0.0,
    aLu: 2.9, aLf: 0.3, aRu: 2.8, aRf: 0.35,
    lLt: 0.5, lLk: -0.4, lRt: -0.5, lRk: 0.5 });
  def('slam_x', { hipY: 30, torso: 0.8, head: -0.5,
    aLu: 1.0, aLf: 0.1, aRu: 0.9, aRf: 0.15,
    lLt: 1.5, lLk: -2.3, lRt: -1.0, lRk: 2.0 });

  def('win', { hipY: 51, torso: -0.06, head: 0.08,
    aLu: 3.0, aLf: 0.15, aRu: 0.2, aRf: 0.3,
    lLt: 0.25, lLk: -0.15, lRt: -0.25, lRk: 0.2 });
  def('win2', { hipY: 50, torso: 0.05, head: -0.05,
    aLu: 0.9, aLf: 2.6, aRu: 0.9, aRf: 2.6,
    lLt: 0.35, lLk: -0.25, lRt: -0.35, lRk: 0.3 });
  def('kneel', { hipY: 24, torso: 0.45, head: -0.55,
    aLu: 0.45, aLf: 0.6, aRu: 0.5, aRf: 0.7,
    lLt: 1.55, lLk: -2.6, lRt: -1.1, lRk: 2.3 });
  def('stance_t', { hipY: 50, torso: 0.02, head: 0,
    aLu: 1.0, aLf: 0.4, aRu: -1.0, aRf: 0.4,
    lLt: 0.15, lLk: -0.1, lRt: -0.15, lRk: 0.1 });
  def('sword_w', { hipY: 48, torso: -0.1, head: 0.02,
    aLu: 2.3, aLf: 0.6, aRu: 2.1, aRf: 0.8,
    lLt: 0.45, lLk: -0.35, lRt: -0.4, lRk: 0.4 });
  def('sword_x', { hipY: 49, torso: 0.45, head: -0.15,
    aLu: 1.25, aLf: 0.05, aRu: 1.1, aRf: 0.1,
    lLt: 0.7, lLk: -0.45, lRt: -0.65, lRk: 0.65 });

  const KEYS = ['hipY','torso','head','aLu','aLf','aRu','aRf','lLt','lLk','lRt','lRk'];
  function lerp(a, b, k) {
    const out = {};
    for (const key of KEYS) out[key] = a[key] + (b[key] - a[key]) * k;
    return out;
  }
  function pose(name) { return P[name] || P.idle; }

  // sample a keyframe track: [[t0,poseName],[t1,poseName],...] at t in [0,1]
  function sample(track, t) {
    if (t <= track[0][0]) return pose(track[0][1]);
    for (let i = 0; i < track.length - 1; i++) {
      const [t0, p0] = track[i], [t1, p1] = track[i + 1];
      if (t >= t0 && t <= t1) {
        let k = (t - t0) / Math.max(0.0001, t1 - t0);
        k = k * k * (3 - 2 * k); // smoothstep = fluid motion
        return lerp(pose(p0), pose(p1), k);
      }
    }
    return pose(track[track.length - 1][1]);
  }

  // ---------------- DRAWING ----------------
  function limbCapsule(ctx, x1, y1, x2, y2, w, color, color2) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, color2 || color);
    g.addColorStop(1, color);
    ctx.strokeStyle = g;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function shade(col, amt) {
    // lighten/darken hex color
    const c = parseInt(col.slice(1), 16);
    let r = (c >> 16) + amt, g = ((c >> 8) & 255) + amt, b = (c & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }

  // compute world joint positions for a pose
  function skeleton(p, build) {
    const s = {};
    const bw = 1 + build * 0.45;
    s.hip = [0, -p.hipY];
    const td = [Math.sin(p.torso), -Math.cos(p.torso)];
    s.neck = [s.hip[0] + td[0] * B.torso, s.hip[1] + td[1] * B.torso];
    s.chest = [s.hip[0] + td[0] * B.torso * 0.72, s.hip[1] + td[1] * B.torso * 0.72];
    s.belly = [s.hip[0] + td[0] * B.torso * 0.3, s.hip[1] + td[1] * B.torso * 0.3];
    const ha = p.torso + p.head;
    s.headC = [s.neck[0] + Math.sin(ha) * (B.neck + B.headR), s.neck[1] - Math.cos(ha) * (B.neck + B.headR)];
    s.headA = ha;
    s.shoulderL = [s.neck[0] - td[0] * 3, s.neck[1] - td[1] * 3]; // both shoulders at neck-ish; depth handled by draw order
    s.shoulderR = s.shoulderL;
    function arm(aU, aF) {
      const sh = s.shoulderL;
      const a1 = p.torso + aU;
      const el = [sh[0] + Math.sin(a1) * B.uArm, sh[1] + Math.cos(a1) * B.uArm];
      const a2 = a1 + aF;
      const hd = [el[0] + Math.sin(a2) * B.fArm, el[1] + Math.cos(a2) * B.fArm];
      return { el, hd, a2 };
    }
    const al = arm(p.aLu, p.aLf), ar = arm(p.aRu, p.aRf);
    s.elL = al.el; s.handL = al.hd; s.handLA = al.a2;
    s.elR = ar.el; s.handR = ar.hd; s.handRA = ar.a2;
    function leg(aT, aK) {
      const a1 = aT;
      const kn = [s.hip[0] + Math.sin(a1) * B.thigh, s.hip[1] + Math.cos(a1) * B.thigh];
      const a2 = a1 + aK;
      const ft = [kn[0] + Math.sin(a2) * B.shin, kn[1] + Math.cos(a2) * B.shin];
      return { kn, ft, a2 };
    }
    const ll = leg(p.lLt, p.lLk), lr = leg(p.lRt, p.lRk);
    s.knL = ll.kn; s.ftL = ll.ft; s.ftLA = ll.a2;
    s.knR = lr.kn; s.ftR = lr.ft; s.ftRA = lr.a2;
    s.bw = bw;
    return s;
  }

  function drawHead(ctx, ch, s, t) {
    const v = ch.visual;
    const [hx, hy] = s.headC;
    const r = B.headR * (v.headScale || 1);
    const ha = s.headA;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(ha * 0.5);
    // skull
    const fg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r * 1.15);
    const baseCol = v.mask === 'full' || v.mask === 'shadow' ? v.suit.torso :
                    v.mask === 'helmet' ? v.suit.metal || '#8a93a6' : v.skin;
    fg.addColorStop(0, shade(baseCol.startsWith('#') ? baseCol : '#888888', 30));
    fg.addColorStop(1, baseCol);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.92, r, 0, 0, 6.29);
    ctx.fill();
    // jaw shading
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.45, r * 0.7, r * 0.5, 0, 0, Math.PI);
    ctx.fill();

    const fx = r * 0.42; // face forward offset
    if (v.mask === 'none' || v.mask === 'scarred') {
      // hair
      if (v.hair && v.hair.style !== 'bald') {
        ctx.fillStyle = v.hair.color;
        ctx.beginPath();
        if (v.hair.style === 'short') {
          ctx.ellipse(-r * 0.12, -r * 0.42, r * 0.85, r * 0.62, -0.15, Math.PI * 0.95, Math.PI * 2.08);
          ctx.fill();
        } else if (v.hair.style === 'spiky') {
          ctx.ellipse(-r * 0.1, -r * 0.4, r * 0.85, r * 0.6, -0.1, Math.PI * 0.95, Math.PI * 2.05);
          ctx.fill();
          for (let i = 0; i < 5; i++) {
            const a = -2.4 + i * 0.42;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.7, -r * 0.3 + Math.sin(a) * r * 0.55);
            ctx.lineTo(Math.cos(a) * r * 1.25, -r * 0.45 + Math.sin(a) * r * 1.05);
            ctx.lineTo(Math.cos(a + 0.3) * r * 0.7, -r * 0.3 + Math.sin(a + 0.3) * r * 0.5);
            ctx.fill();
          }
        } else if (v.hair.style === 'long') {
          ctx.ellipse(-r * 0.15, -r * 0.35, r * 0.9, r * 0.68, -0.1, Math.PI * 0.9, Math.PI * 2.1);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-r * 0.85, -r * 0.2);
          ctx.quadraticCurveTo(-r * 1.25, r * 0.8, -r * 0.8, r * 2.0 + Math.sin(t * 3) * 1.5);
          ctx.quadraticCurveTo(-r * 0.4, r * 1.2, -r * 0.55, -r * 0.1);
          ctx.fill();
        } else if (v.hair.style === 'bun') {
          ctx.ellipse(-r * 0.1, -r * 0.42, r * 0.85, r * 0.6, -0.1, Math.PI * 0.95, Math.PI * 2.05);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-r * 0.75, -r * 0.55, r * 0.4, 0, 6.29);
          ctx.fill();
        }
      }
      // eyes (with optional glow)
      const ec = v.eyes && v.eyes.glow ? v.eyes.glow : '#2a2722';
      if (v.eyes && v.eyes.glow) { ctx.shadowColor = ec; ctx.shadowBlur = 7; }
      ctx.fillStyle = '#fdfdfa';
      ctx.beginPath(); ctx.ellipse(fx, -r * 0.12, r * 0.21, r * 0.13, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = ec;
      ctx.beginPath(); ctx.arc(fx + r * 0.07, -r * 0.12, r * 0.085, 0, 6.29); ctx.fill();
      ctx.shadowBlur = 0;
      // brow
      ctx.strokeStyle = v.hair ? v.hair.color : '#222';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(fx - r * 0.22, -r * 0.3); ctx.lineTo(fx + r * 0.24, -r * 0.34); ctx.stroke();
      // nose + mouth
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(fx + r * 0.3, -r * 0.02); ctx.lineTo(fx + r * 0.38, r * 0.18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx - r * 0.05, r * 0.45); ctx.lineTo(fx + r * 0.3, r * 0.43); ctx.stroke();
      // scars (Tsunami post-Mumbai)
      if (v.mask === 'scarred') {
        ctx.strokeStyle = 'rgba(190,90,70,0.75)';
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-r * 0.55 + i * 4, -r * 0.5);
          ctx.quadraticCurveTo(-r * 0.4 + i * 4, 0, -r * 0.5 + i * 4.5, r * 0.55);
          ctx.stroke();
        }
      }
    } else if (v.mask === 'cowl') {
      // cowl covering top half, exposed jaw
      ctx.fillStyle = v.suit.torso;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.18, r * 0.95, r * 0.85, 0, 0, 6.29);
      ctx.fill();
      ctx.fillStyle = v.skin;
      ctx.beginPath();
      ctx.ellipse(fx * 0.6, r * 0.55, r * 0.55, r * 0.42, 0, 0, Math.PI);
      ctx.fill();
      drawGlowEyes(ctx, v, fx, r);
    } else if (v.mask === 'full' || v.mask === 'shadow') {
      drawGlowEyes(ctx, v, fx, r);
    } else if (v.mask === 'helmet') {
      // crest / visor
      if (v.crest) {
        ctx.fillStyle = v.crest;
        ctx.beginPath();
        ctx.moveTo(-r * 0.9, -r * 0.5);
        ctx.quadraticCurveTo(0, -r * 1.9, r * 0.75, -r * 0.55);
        ctx.quadraticCurveTo(0, -r * 1.1, -r * 0.9, -r * 0.5);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(fx * 0.8, -r * 0.1, r * 0.5, r * 0.28, 0.1, 0, 6.29);
      ctx.fill();
      drawGlowEyes(ctx, v, fx, r);
      // cheek guards
      ctx.strokeStyle = shade(v.suit.metal || '#8a93a6', -35);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fx * 0.2, r * 0.2); ctx.lineTo(fx * 0.3, r * 0.85); ctx.stroke();
    } else if (v.mask === 'visor') {
      ctx.fillStyle = v.suit.torso;
      ctx.beginPath(); ctx.ellipse(0, -r * 0.3, r * 0.93, r * 0.7, 0, Math.PI, Math.PI * 2); ctx.fill();
      const vg = ctx.createLinearGradient(-r, -r * 0.3, r, 0);
      vg.addColorStop(0, v.eyes.glow); vg.addColorStop(1, shade('#222233', 10));
      ctx.fillStyle = vg;
      ctx.shadowColor = v.eyes.glow; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(fx * 0.55, -r * 0.1, r * 0.62, r * 0.22, 0.05, 0, 6.29);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = v.skin;
      ctx.beginPath(); ctx.ellipse(fx * 0.6, r * 0.55, r * 0.5, r * 0.4, 0, 0, Math.PI); ctx.fill();
    } else if (v.mask === 'oni') {
      // samurai mempo + helmet
      ctx.fillStyle = v.suit.metal || '#3a3f4a';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.95, r * 0.72, 0, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();
      ctx.fillStyle = '#5c1f1f';
      ctx.beginPath(); ctx.ellipse(fx * 0.4, r * 0.35, r * 0.6, r * 0.5, 0, 0, Math.PI); ctx.fill();
      drawGlowEyes(ctx, v, fx, r);
      // horns
      ctx.strokeStyle = '#d9c98c'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.85); ctx.quadraticCurveTo(-r * 0.1, -r * 1.7, r * 0.45, -r * 1.6); ctx.stroke();
    } else if (v.mask === 'hood') {
      ctx.fillStyle = v.suit.cape || v.suit.torso;
      ctx.beginPath();
      ctx.moveTo(fx + r * 0.55, -r * 0.05);
      ctx.quadraticCurveTo(r * 0.6, -r * 1.45, -r * 0.95, -r * 0.75);
      ctx.quadraticCurveTo(-r * 1.35, r * 0.4, -r * 0.5, r * 0.95);
      ctx.quadraticCurveTo(0, r * 1.15, fx + r * 0.4, r * 0.6);
      ctx.closePath();
      ctx.fill();
      // featureless black mask beneath
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.ellipse(fx * 0.55, r * 0.08, r * 0.58, r * 0.66, 0, 0, 6.29);
      ctx.fill();
      drawGlowEyes(ctx, v, fx, r, 0.6);
    }
    ctx.restore();
  }

  function drawGlowEyes(ctx, v, fx, r, dim = 1) {
    const col = (v.eyes && v.eyes.glow) || '#ffffff';
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 9 * dim;
    ctx.fillStyle = col;
    ctx.globalAlpha = dim;
    ctx.beginPath();
    ctx.ellipse(fx, -r * 0.1, r * 0.24, r * 0.1, 0.08, 0, 6.29);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(fx - r * 0.52, -r * 0.13, r * 0.17, r * 0.085, 0.05, 0, 6.29);
    ctx.fill();
    ctx.restore();
  }

  function drawCape(ctx, ch, s, t, windX) {
    const v = ch.visual;
    if (!v.cape) return;
    const [nx, ny] = s.neck;
    const len = v.cape.len || 62;
    const sway = Math.sin(t * 2.4) * 6 + windX * 14;
    ctx.save();
    const cg = ctx.createLinearGradient(nx, ny, nx - len * 0.4, ny + len);
    cg.addColorStop(0, shade(v.cape.color, 18));
    cg.addColorStop(1, shade(v.cape.color, -25));
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(nx - 6, ny + 2);
    ctx.quadraticCurveTo(nx - len * 0.55 - sway * 0.4, ny + len * 0.45,
      nx - len * 0.42 - sway, ny + len + Math.sin(t * 3.1) * 4);
    ctx.lineTo(nx - len * 0.12 - sway * 0.7, ny + len * 0.96);
    ctx.quadraticCurveTo(nx - len * 0.05 - sway * 0.3, ny + len * 0.5, nx + 7, ny + 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawWeapon(ctx, ch, s, t) {
    const v = ch.visual;
    if (!v.weapon) return;
    const [hx, hy] = s.handR;
    const a = s.handRA; // blade extends along the forearm direction
    const dx = Math.sin(a), dy = Math.cos(a);
    const L = v.weapon.len || 42;
    ctx.save();
    if (v.weapon.glow) { ctx.shadowColor = v.weapon.glow; ctx.shadowBlur = 10; }
    // grip
    ctx.strokeStyle = '#3a2c1c';
    ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(hx - dx * 5, hy - dy * 5); ctx.lineTo(hx + dx * 4, hy + dy * 4); ctx.stroke();
    // guard
    ctx.strokeStyle = v.weapon.guard || '#c9a86a';
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(hx + dx * 4 - dy * 6, hy + dy * 4 + dx * 6); ctx.lineTo(hx + dx * 4 + dy * 6, hy + dy * 4 - dx * 6); ctx.stroke();
    // blade
    const bg = ctx.createLinearGradient(hx, hy, hx + dx * L, hy + dy * L);
    bg.addColorStop(0, v.weapon.color);
    bg.addColorStop(1, shade(v.weapon.color, 60));
    ctx.strokeStyle = bg;
    ctx.lineWidth = v.weapon.w || 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx + dx * 5, hy + dy * 5);
    ctx.lineTo(hx + dx * L, hy + dy * L);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(hx + dx * 6, hy + dy * 6);
    ctx.lineTo(hx + dx * (L - 3), hy + dy * (L - 3));
    ctx.stroke();
    ctx.restore();
  }

  function drawRailgun(ctx, s) {
    // Gungod shoulder-mounted railgun
    const [nx, ny] = s.neck;
    ctx.save();
    ctx.fillStyle = '#39414f';
    ctx.strokeStyle = '#1f242d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(nx - 14, ny - 16, 34, 9, 3);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#566173';
    ctx.fillRect(nx + 18, ny - 14, 14, 5);
    ctx.fillStyle = '#ff9b3d';
    ctx.shadowColor = '#ff9b3d'; ctx.shadowBlur = 6;
    ctx.fillRect(nx + 30, ny - 13.5, 3, 4);
    ctx.restore();
  }

  // main draw entry
  // opts: x, y(ground), facing(1/-1), scale, t(time), alpha, aura, tint,
  //       flash(bool, white impact-frame silhouette), shadow(bool), stretch
  function draw(ctx, ch, p, opts) {
    const v = ch.visual;
    const sc = (opts.scale || 2.5) * (v.heightScale || 1);
    const s = skeleton(p, v.build || 0.3);
    const t = opts.t || 0;
    ctx.save();
    ctx.translate(opts.x, opts.y);
    // ground contact shadow
    if (opts.shadow !== false) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      const airK = Math.max(0, Math.min(1, (opts.airH || 0) / 200));
      ctx.globalAlpha = 0.45 * (1 - airK * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, 34 * sc / 2.5 * (1 - airK * 0.4), 7 * sc / 2.5, 0, 0, 6.29);
      ctx.fill();
      ctx.restore();
    }
    ctx.translate(0, -(opts.airH || 0));
    ctx.scale((opts.facing || 1) * sc, sc);
    if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;

    const suit = v.suit;
    const bw = s.bw;
    const wArmU = 7.5 * bw, wArmF = 6.2 * bw, wThigh = 9.5 * bw, wShin = 7.6 * bw;

    if (opts.aura) {
      ctx.shadowColor = opts.aura;
      ctx.shadowBlur = 18 + Math.sin(t * 9) * 6;
    } else if (v.aura) {
      ctx.shadowColor = v.aura;
      ctx.shadowBlur = 12 + Math.sin(t * 6) * 4;
    }

    // ---- far limbs (darker) ----
    const dk = -38;
    limbCapsule(ctx, s.hip[0], s.hip[1], s.knR[0], s.knR[1], wThigh, shade(suit.legs, dk));
    limbCapsule(ctx, s.knR[0], s.knR[1], s.ftR[0], s.ftR[1], wShin, shade(suit.legs, dk));
    drawBoot(ctx, s.ftR, s.ftRA, shade(suit.boots, dk));
    limbCapsule(ctx, s.shoulderR[0], s.shoulderR[1], s.elR[0], s.elR[1], wArmU, shade(suit.arms, dk));
    limbCapsule(ctx, s.elR[0], s.elR[1], s.handR[0], s.handR[1], wArmF, shade(suit.arms, dk));
    drawHand(ctx, s.handR, v.gloves ? shade(suit.gloves, dk) : shade(v.skin, dk));
    if (v.weapon) drawWeapon(ctx, ch, s, t);

    // ---- cape behind torso ----
    drawCape(ctx, ch, s, t, opts.windX || 0);

    // ---- torso ----
    const tg = ctx.createLinearGradient(s.hip[0] - 10, s.hip[1], s.neck[0] + 8, s.neck[1]);
    tg.addColorStop(0, shade(suit.torso, -22));
    tg.addColorStop(0.55, suit.torso);
    tg.addColorStop(1, shade(suit.torso, 26));
    ctx.fillStyle = tg;
    const td = [Math.sin(p.torso), -Math.cos(p.torso)];
    const perp = [-td[1], td[0]];
    const shW = B.shoulderW * bw, hpW = B.hipW * bw + 1.5;
    ctx.beginPath();
    ctx.moveTo(s.hip[0] - perp[0] * hpW, s.hip[1] - perp[1] * hpW);
    ctx.quadraticCurveTo(s.belly[0] - perp[0] * (hpW + 2), s.belly[1] - perp[1] * (hpW + 2),
      s.neck[0] - perp[0] * shW, s.neck[1] - perp[1] * shW + 2);
    ctx.quadraticCurveTo(s.neck[0], s.neck[1] - 4, s.neck[0] + perp[0] * shW, s.neck[1] + perp[1] * shW + 2);
    ctx.quadraticCurveTo(s.belly[0] + perp[0] * (hpW + 2), s.belly[1] + perp[1] * (hpW + 2),
      s.hip[0] + perp[0] * hpW, s.hip[1] + perp[1] * hpW);
    ctx.closePath();
    ctx.fill();
    // pecs/abs definition
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(s.chest[0], s.chest[1] - 4);
    ctx.lineTo(s.belly[0], s.belly[1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s.chest[0] + perp[0] * 4.5, s.chest[1] + perp[1] * 4.5 + 1, 4.5, 3, p.torso, 0.2, Math.PI - 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(s.chest[0] - perp[0] * 4.5, s.chest[1] - perp[1] * 4.5 + 1, 4.5, 3, p.torso, 0.2, Math.PI - 0.4);
    ctx.stroke();
    // belt
    if (suit.belt) {
      ctx.strokeStyle = suit.belt;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.hip[0] - perp[0] * (hpW + 1), s.hip[1] - perp[1] * (hpW + 1) - 2);
      ctx.lineTo(s.hip[0] + perp[0] * (hpW + 1), s.hip[1] + perp[1] * (hpW + 1) - 2);
      ctx.stroke();
      ctx.fillStyle = shade(suit.belt, 50);
      ctx.fillRect(s.hip[0] + perp[0] * 2 - 2, s.hip[1] + perp[1] * 2 - 4, 4, 4);
    }
    // stone armor patches (Tecton)
    if (v.stone) {
      ctx.fillStyle = '#6d6258';
      ctx.strokeStyle = '#4d453d';
      ctx.lineWidth = 1;
      const spots = [[s.neck[0] - perp[0] * shW * 0.8, s.neck[1] - perp[1] * shW * 0.8, 6],
        [s.neck[0] + perp[0] * shW * 0.8, s.neck[1] + perp[1] * shW * 0.8, 6.5],
        [s.chest[0] + perp[0] * 2, s.chest[1], 5], [s.belly[0] - perp[0] * 4, s.belly[1], 4]];
      for (const [px, py, pr] of spots) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * 6.28;
          const rr = pr * (0.8 + ((i * 7 + 3) % 5) * 0.08);
          if (i === 0) ctx.moveTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr);
          else ctx.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // root vines
      ctx.strokeStyle = '#4e7a3a'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.hip[0], s.hip[1]);
      ctx.quadraticCurveTo(s.belly[0] + 6, s.belly[1], s.chest[0] - 4, s.chest[1] - 2);
      ctx.stroke();
    }
    // emblem
    drawEmblem(ctx, v, s, perp, t);
    // pauldrons (armored characters)
    if (v.pauldrons) {
      ctx.fillStyle = v.pauldrons;
      ctx.strokeStyle = shade(v.pauldrons, -40);
      ctx.lineWidth = 1.2;
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(s.neck[0] + perp[0] * shW * sgn, s.neck[1] + perp[1] * shW * sgn + 1.5, 7.5, 5.5, p.torso * 0.5, Math.PI, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    }

    // ---- near leg ----
    limbCapsule(ctx, s.hip[0], s.hip[1], s.knL[0], s.knL[1], wThigh, suit.legs, shade(suit.legs, 16));
    limbCapsule(ctx, s.knL[0], s.knL[1], s.ftL[0], s.ftL[1], wShin, suit.legs, shade(suit.legs, 8));
    drawBoot(ctx, s.ftL, s.ftLA, suit.boots);

    // ---- head ----
    drawHead(ctx, ch, s, t);
    if (v.railgun) drawRailgun(ctx, s);

    // ---- near arm ----
    limbCapsule(ctx, s.shoulderL[0], s.shoulderL[1], s.elL[0], s.elL[1], wArmU, suit.arms, shade(suit.arms, 18));
    limbCapsule(ctx, s.elL[0], s.elL[1], s.handL[0], s.handL[1], wArmF, suit.arms, shade(suit.arms, 10));
    drawHand(ctx, s.handL, v.gloves ? suit.gloves : v.skin);

    // impact-frame white silhouette
    if (opts.flash) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = 0.85;
      // can't easily clip to drawn pixels without layers; approximate with additive glow
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.ellipse(s.belly[0], s.belly[1], 30, 55, 0, 0, 6.29);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBoot(ctx, ft, ang, color) {
    ctx.save();
    ctx.translate(ft[0], ft[1]);
    const lean = Math.sin(ang);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-3.5 + lean * 2, -3, B.foot + 3, 5.5, 2.5);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-3.5 + lean * 2, 1, B.foot + 3, 1.5);
    ctx.restore();
  }

  function drawHand(ctx, hd, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(hd[0], hd[1], B.hand, 0, 6.29);
    ctx.fill();
  }

  function drawEmblem(ctx, v, s, perp, t) {
    if (!v.emblem || v.emblem.type === 'none') return;
    const e = v.emblem;
    const [cx, cy] = s.chest;
    ctx.save();
    ctx.translate(cx + perp[0] * 0.5, cy);
    ctx.fillStyle = e.color;
    ctx.strokeStyle = e.color;
    if (e.glow) { ctx.shadowColor = e.color; ctx.shadowBlur = 8; }
    if (e.type === 'bolt' || e.type === 'shieldbolt') {
      if (e.type === 'shieldbolt') {
        ctx.strokeStyle = e.color; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-5.5, -6); ctx.lineTo(5.5, -6); ctx.lineTo(5, 3);
        ctx.quadraticCurveTo(0, 8, -5, 3); ctx.closePath(); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(1.5, -5); ctx.lineTo(-2.5, 0.5); ctx.lineTo(-0.2, 0.8);
      ctx.lineTo(-1.5, 5.5); ctx.lineTo(2.8, -0.5); ctx.lineTo(0.5, -0.8);
      ctx.closePath(); ctx.fill();
    } else if (e.type === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const rr = i % 2 === 0 ? 6 : 2.4;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
    } else if (e.type === 'wave') {
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-5, 1);
      ctx.quadraticCurveTo(-2, -4, 0, 0);
      ctx.quadraticCurveTo(2, 4, 5, -1);
      ctx.stroke();
    } else if (e.type === 'dm') {
      ctx.font = '900 9px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('DM', 0, 3.5);
    } else if (e.type === 'leaf') {
      ctx.beginPath();
      ctx.ellipse(0, 0, 5.5, 2.6, -0.7, 0, 6.29);
      ctx.fill();
    } else if (e.type === 'snow') {
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(a) * 5.5, -Math.sin(a) * 5.5);
        ctx.lineTo(Math.cos(a) * 5.5, Math.sin(a) * 5.5);
        ctx.stroke();
      }
    } else if (e.type === 'gear') {
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, 6.29); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, 6.29); ctx.fill();
    }
    ctx.restore();
  }

  return { draw, pose, lerp, sample, POSES: P, B, shade };
})();
