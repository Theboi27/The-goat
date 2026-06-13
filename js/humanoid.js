// ============================================================
// HUMANOID — parametric human character renderer.
// Skeleton-driven: poses are joint-angle sets, interpolated for
// fluid animation. Bodies are drawn with tapered muscle limbs,
// deltoids, necks and jawlines so figures read as human.
//
// Pose convention (local space, +x = facing direction, y up = -):
//   hipY  : hip height above ground
//   torso : lean angle (0 vertical, + leans forward)
//   head  : head tilt relative to torso
//   aLu/aLf, aRu/aRf : arm angles (upper from torso: 0=down,
//                      +=forward; forearm: relative bend)
//   lLt/lLk, lRt/lRk : legs (thigh from hip 0=down +=forward;
//                      knee relative bend, usually negative=back)
//   stretch : toon-force arm extension (far arm only, default 1)
// ============================================================
const Humanoid = (() => {

  // body segment lengths at scale 1 (heroic ~7.5-head proportions)
  const B = { torso: 34, neck: 5, headR: 8.1, uArm: 16, fArm: 15, hand: 4.2,
              thigh: 25, shin: 24, foot: 9, shoulderW: 11.8, hipW: 6.5 };

  // ---------------- POSE LIBRARY ----------------
  const P = {};
  function def(name, p) { p.stretch = p.stretch ?? 1; P[name] = p; return p; }

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

  // ---- punches ----
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
  def('hook_w', { hipY: 49, torso: -0.32, head: 0.12,
    aLu: 0.75, aLf: 2.35, aRu: -1.25, aRf: 1.85,
    lLt: 0.45, lLk: -0.35, lRt: -0.42, lRk: 0.45 });
  def('hook_x', { hipY: 50, torso: 0.42, head: -0.15,
    aLu: 0.4, aLf: 2.4, aRu: 1.9, aRf: 0.85,
    lLt: 0.62, lLk: -0.4, lRt: -0.6, lRk: 0.62 });
  def('elbow_x', { hipY: 50, torso: 0.48, head: -0.18,
    aLu: 0.3, aLf: 2.2, aRu: 1.5, aRf: 2.9,
    lLt: 0.6, lLk: -0.4, lRt: -0.55, lRk: 0.55 });
  def('palm_w', { hipY: 49, torso: -0.16, head: 0.05,
    aLu: -0.45, aLf: 1.7, aRu: 0.35, aRf: 1.9,
    lLt: 0.4, lLk: -0.32, lRt: -0.36, lRk: 0.36 });
  def('palm_x', { hipY: 50, torso: 0.3, head: -0.1,
    aLu: 1.55, aLf: 0.02, aRu: 0.2, aRf: 2.3,
    lLt: 0.55, lLk: -0.38, lRt: -0.5, lRk: 0.5 });
  def('stretchP_w', { hipY: 49, torso: -0.2, head: 0.08,
    aLu: 0.6, aLf: 2.0, aRu: -0.9, aRf: 1.6,
    lLt: 0.4, lLk: -0.3, lRt: -0.36, lRk: 0.36, stretch: 0.85 });
  def('stretchP_x', { hipY: 50, torso: 0.32, head: -0.12,
    aLu: 0.35, aLf: 2.1, aRu: 1.66, aRf: 0.02,
    lLt: 0.55, lLk: -0.36, lRt: -0.52, lRk: 0.52, stretch: 1.85 });
  def('stretchB_x', { hipY: 51, torso: 0.48, head: -0.2,
    aLu: 0.3, aLf: 2.2, aRu: 1.72, aRf: 0.0,
    lLt: 0.7, lLk: -0.42, lRt: -0.68, lRk: 0.68, stretch: 2.4 });
  def('axe_w', { hipY: 52, torso: -0.18, head: 0.1,
    aLu: 3.0, aLf: 0.25, aRu: 2.92, aRf: 0.3,
    lLt: 0.45, lLk: -0.35, lRt: -0.45, lRk: 0.45 });
  def('axe_x', { hipY: 42, torso: 0.75, head: -0.42,
    aLu: 0.95, aLf: 0.22, aRu: 0.88, aRf: 0.28,
    lLt: 0.9, lLk: -0.9, lRt: -0.75, lRk: 0.9 });

  // ---- kicks ----
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
  def('knee_w', { hipY: 49, torso: -0.1, head: 0.0,
    aLu: 0.9, aLf: 1.9, aRu: 0.4, aRf: 2.0,
    lLt: 0.2, lLk: -0.4, lRt: -0.25, lRk: 0.3 });
  def('knee_x', { hipY: 52, torso: 0.22, head: -0.12,
    aLu: 0.85, aLf: 1.4, aRu: -0.55, aRf: 1.1,
    lLt: 1.78, lLk: -2.5, lRt: -0.3, lRk: 0.35 });
  def('spin_w', { hipY: 48, torso: 0.32, head: -0.12,
    aLu: 0.5, aLf: 1.8, aRu: 0.7, aRf: 1.7,
    lLt: 0.45, lLk: -1.25, lRt: -0.3, lRk: 0.32 });
  def('spin_x', { hipY: 56, torso: -0.78, head: 0.3,
    aLu: -1.4, aLf: 0.6, aRu: 1.35, aRf: 0.8,
    lLt: 2.1, lLk: -0.15, lRt: -0.55, lRk: 0.6 });
  def('sweep_w', { hipY: 32, torso: 0.5, head: -0.3,
    aLu: 0.8, aLf: 1.6, aRu: 0.4, aRf: 1.8,
    lLt: 1.2, lLk: -2.2, lRt: -0.85, lRk: 1.9 });
  def('sweep_x', { hipY: 26, torso: 0.62, head: -0.35,
    aLu: 1.3, aLf: 0.6, aRu: -0.6, aRf: 1.0,
    lLt: 1.68, lLk: -0.06, lRt: -1.05, lRk: 2.1 });

  // ---- weapon strikes ----
  def('slashH_w', { hipY: 49, torso: -0.22, head: 0.08,
    aLu: 0.55, aLf: 1.9, aRu: -0.95, aRf: 0.55,
    lLt: 0.42, lLk: -0.34, lRt: -0.4, lRk: 0.4 });
  def('slashH_x', { hipY: 50, torso: 0.38, head: -0.14,
    aLu: 0.3, aLf: 2.2, aRu: 1.72, aRf: 0.08,
    lLt: 0.6, lLk: -0.4, lRt: -0.58, lRk: 0.58 });
  def('slashV_w', { hipY: 51, torso: -0.12, head: 0.06,
    aLu: 0.5, aLf: 1.8, aRu: 2.9, aRf: 0.4,
    lLt: 0.4, lLk: -0.32, lRt: -0.4, lRk: 0.4 });
  def('slashV_x', { hipY: 47, torso: 0.55, head: -0.3,
    aLu: 0.7, aLf: 1.5, aRu: 0.95, aRf: 0.15,
    lLt: 0.75, lLk: -0.5, lRt: -0.7, lRk: 0.75 });
  def('lunge_w', { hipY: 48, torso: -0.15, head: 0.05,
    aLu: 0.6, aLf: 1.9, aRu: -0.45, aRf: 0.9,
    lLt: 0.28, lLk: -0.25, lRt: -0.3, lRk: 0.3 });
  def('lunge_x', { hipY: 46, torso: 0.55, head: -0.2,
    aLu: -0.5, aLf: 1.0, aRu: 1.52, aRf: 0.04,
    lLt: 1.0, lLk: -0.5, lRt: -0.92, lRk: 0.85 });
  def('sword_w', { hipY: 48, torso: -0.1, head: 0.02,
    aLu: 2.3, aLf: 0.6, aRu: 2.1, aRf: 0.8,
    lLt: 0.45, lLk: -0.35, lRt: -0.4, lRk: 0.4 });
  def('sword_x', { hipY: 49, torso: 0.45, head: -0.15,
    aLu: 1.25, aLf: 0.05, aRu: 1.1, aRf: 0.1,
    lLt: 0.7, lLk: -0.45, lRt: -0.65, lRk: 0.65 });

  // ---- reactions ----
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

  // ---- movement / power ----
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

  // ---- signature fighting stances ----
  def('stance_boxer', { hipY: 50, torso: 0.14, head: -0.08,
    aLu: 0.78, aLf: 2.5, aRu: 0.45, aRf: 2.55,
    lLt: 0.3, lLk: -0.26, lRt: -0.26, lRk: 0.3 });
  def('stance_ninja', { hipY: 39, torso: 0.45, head: -0.3,
    aLu: 1.05, aLf: 1.0, aRu: -0.5, aRf: 1.6,
    lLt: 1.0, lLk: -1.6, lRt: -0.7, lRk: 1.2 });
  def('stance_blade', { hipY: 49, torso: 0.1, head: -0.04,
    aLu: 0.5, aLf: 1.85, aRu: 1.2, aRf: 0.42,
    lLt: 0.45, lLk: -0.35, lRt: -0.4, lRk: 0.4 });
  def('stance_iaido', { hipY: 47, torso: 0.08, head: -0.02,
    aLu: 0.35, aLf: 1.25, aRu: 0.55, aRf: 1.45,
    lLt: 0.55, lLk: -0.42, lRt: -0.5, lRk: 0.5 });
  def('stance_heavy', { hipY: 46, torso: 0.2, head: -0.08,
    aLu: 0.55, aLf: 1.25, aRu: 0.28, aRf: 1.05,
    lLt: 0.6, lLk: -0.5, lRt: -0.55, lRk: 0.6 });
  def('stance_flow', { hipY: 49, torso: 0.05, head: -0.02,
    aLu: 1.1, aLf: 1.0, aRu: -0.35, aRf: 1.2,
    lLt: 0.4, lLk: -0.3, lRt: -0.35, lRk: 0.35 });
  def('stance_caster', { hipY: 51, torso: 0.0, head: 0.0,
    aLu: 1.25, aLf: 0.35, aRu: -0.15, aRf: 0.6,
    lLt: 0.3, lLk: -0.24, lRt: -0.3, lRk: 0.26 });
  def('stance_gun', { hipY: 48, torso: 0.16, head: -0.05,
    aLu: 1.3, aLf: 1.5, aRu: 0.9, aRf: 1.9,
    lLt: 0.5, lLk: -0.4, lRt: -0.46, lRk: 0.48 });
  def('stance_regal', { hipY: 52, torso: -0.05, head: 0.05,
    aLu: -0.55, aLf: 0.45, aRu: -0.6, aRf: 0.5,
    lLt: 0.15, lLk: -0.1, lRt: -0.15, lRk: 0.1 });
  def('stance_toon', { hipY: 47, torso: 0.35, head: -0.25,
    aLu: 0.2, aLf: 0.15, aRu: -0.15, aRf: 0.1,
    lLt: 0.35, lLk: -0.3, lRt: -0.3, lRk: 0.3 });

  const KEYS = ['hipY','torso','head','aLu','aLf','aRu','aRf','lLt','lLk','lRt','lRk','stretch'];
  function lerp(a, b, k) {
    const out = {};
    for (const key of KEYS) {
      const av = a[key] ?? (key === 'stretch' ? 1 : 0);
      const bv = b[key] ?? (key === 'stretch' ? 1 : 0);
      out[key] = av + (bv - av) * k;
    }
    return out;
  }
  function pose(name) { return P[name] || P.idle; }

  // sample a keyframe track at t in [0,1].
  // mode 'attack': the strike segment snaps out fast (ease-out quart)
  // and the recovery eases — anticipation, snap, follow-through.
  function sample(track, t, mode) {
    if (t <= track[0][0]) return pose(track[0][1]);
    for (let i = 0; i < track.length - 1; i++) {
      const [t0, p0] = track[i], [t1, p1] = track[i + 1];
      if (t >= t0 && t <= t1) {
        let k = (t - t0) / Math.max(0.0001, t1 - t0);
        if (mode === 'attack' && i === 0) {
          k = 1 - Math.pow(1 - k, 4);          // explosive extension
        } else {
          k = k * k * (3 - 2 * k);              // smooth everything else
        }
        return lerp(pose(p0), pose(p1), k);
      }
    }
    return pose(track[track.length - 1][1]);
  }

  // ---------------- DRAWING HELPERS ----------------
  function shade(col, amt) {
    const c = parseInt(col.slice(1), 16);
    let r = (c >> 16) + amt, g = ((c >> 8) & 255) + amt, b = (c & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }

  // tapered muscle limb with rounded caps + soft top highlight
  function taper(ctx, a, b, w1, w2, col, hi = 0.14) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, shade(col, 12));
    g.addColorStop(1, shade(col, -10));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(a[0], a[1], w1 / 2, ang + Math.PI / 2, ang - Math.PI / 2);
    ctx.arc(b[0], b[1], w2 / 2, ang - Math.PI / 2, ang + Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    if (hi > 0) {
      const nx = Math.sin(ang), ny = -Math.cos(ang);
      ctx.save();
      ctx.globalAlpha = hi;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.min(w1, w2) * 0.32;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a[0] + nx * w1 * 0.2 + (b[0] - a[0]) * 0.18, a[1] + ny * w1 * 0.2 + (b[1] - a[1]) * 0.18);
      ctx.lineTo(a[0] + nx * w2 * 0.2 + (b[0] - a[0]) * 0.8, a[1] + ny * w2 * 0.2 + (b[1] - a[1]) * 0.8);
      ctx.stroke();
      ctx.restore();
    }
  }

  // limb with a real muscle belly: bicep/quad/calf bulge swelling at
  // `at` along the bone, easing into the joints — reads as anatomy
  function muscle(ctx, a, b, w1, wB, w2, at, col, hi = 0.12) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const ang = Math.atan2(dy, dx);
    const m = [a[0] + dx * at, a[1] + dy * at];
    const d1 = ang - Math.PI / 2, d2 = ang + Math.PI / 2;
    const off = (p, d, w) => [p[0] + Math.cos(d) * w / 2, p[1] + Math.sin(d) * w / 2];
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, shade(col, 12));
    g.addColorStop(1, shade(col, -10));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(a[0], a[1], w1 / 2, d2, d1);
    const s1 = off(b, d1, w2), c1 = off(m, d1, wB);
    ctx.quadraticCurveTo(c1[0], c1[1], s1[0], s1[1]);
    ctx.arc(b[0], b[1], w2 / 2, d1, d2);
    const s0 = off(a, d2, w1), c2 = off(m, d2, wB);
    ctx.quadraticCurveTo(c2[0], c2[1], s0[0], s0[1]);
    ctx.closePath();
    ctx.fill();
    if (hi > 0) {
      ctx.save();
      ctx.globalAlpha = hi;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.min(w1, w2) * 0.3;
      ctx.lineCap = 'round';
      const h0 = off([a[0] + dx * 0.2, a[1] + dy * 0.2], d1, w1 * 0.45);
      const h1 = off([a[0] + dx * 0.78, a[1] + dy * 0.78], d1, w2 * 0.45);
      const hc = off(m, d1, wB * 0.55);
      ctx.beginPath();
      ctx.moveTo(h0[0], h0[1]);
      ctx.quadraticCurveTo(hc[0], hc[1], h1[0], h1[1]);
      ctx.stroke();
      ctx.restore();
    }
  }

  function joint(ctx, p, w, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(p[0], p[1], w / 2, 0, 6.29);
    ctx.fill();
  }

  // compute world joint positions for a pose
  function skeleton(p, build, fem) {
    const s = {};
    const bw = (1 + build * 0.45) * (fem ? 0.9 : 1);
    s.hip = [0, -p.hipY];
    const td = [Math.sin(p.torso), -Math.cos(p.torso)];
    s.neck = [s.hip[0] + td[0] * B.torso, s.hip[1] + td[1] * B.torso];
    s.chest = [s.hip[0] + td[0] * B.torso * 0.72, s.hip[1] + td[1] * B.torso * 0.72];
    s.belly = [s.hip[0] + td[0] * B.torso * 0.3, s.hip[1] + td[1] * B.torso * 0.3];
    const ha = p.torso + p.head;
    s.headC = [s.neck[0] + Math.sin(ha) * (B.neck + B.headR), s.neck[1] - Math.cos(ha) * (B.neck + B.headR)];
    s.headA = ha;
    s.shoulderL = [s.neck[0] - td[0] * 3, s.neck[1] - td[1] * 3];
    s.shoulderR = s.shoulderL;
    function arm(aU, aF, st) {
      const sh = s.shoulderL;
      const a1 = p.torso + aU;
      const el = [sh[0] + Math.sin(a1) * B.uArm * st, sh[1] + Math.cos(a1) * B.uArm * st];
      const a2 = a1 + aF;
      const hd = [el[0] + Math.sin(a2) * B.fArm * st, el[1] + Math.cos(a2) * B.fArm * st];
      return { el, hd, a2 };
    }
    const al = arm(p.aLu, p.aLf, 1), ar = arm(p.aRu, p.aRf, p.stretch || 1);
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

  // ---------------- HEAD / FACE ----------------
  // Clean oval skull with a soft jaw, 3/4-view two-eye faces, neat
  // hair caps — drawn to read as an attractive human face at distance.
  function headOutline(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.82, -r * 0.08);
    ctx.quadraticCurveTo(-r * 0.88, -r * 1.04, 0, -r * 1.02);
    ctx.quadraticCurveTo(r * 0.88, -r * 1.0, r * 0.8, -r * 0.02);
    ctx.quadraticCurveTo(r * 0.78, r * 0.5, r * 0.42, r * 0.8);
    ctx.quadraticCurveTo(r * 0.08, r * 1.0, -r * 0.28, r * 0.74);
    ctx.quadraticCurveTo(-r * 0.78, r * 0.46, -r * 0.82, -r * 0.08);
    ctx.closePath();
  }

  function faceFeatures(ctx, v, r, opts = {}) {
    const fem = v.fem;
    const ec = (v.eyes && v.eyes.glow) || '#5b4334';
    const glow = v.eyes && v.eyes.glow;
    // two eyes for a 3/4 view — this is what makes the face read human.
    // Whites kept large and lines light so it never reads as sunglasses.
    const eyes = [
      { x: r * 0.38, w: r * 0.2, h: r * 0.12 },     // near eye
      { x: -r * 0.18, w: r * 0.17, h: r * 0.105 },  // far eye
    ];
    for (const e of eyes) {
      ctx.fillStyle = '#fbf8f1';
      ctx.beginPath(); ctx.ellipse(e.x, -r * 0.14, e.w, e.h, 0, 0, 6.29); ctx.fill();
      if (glow) { ctx.shadowColor = ec; ctx.shadowBlur = 2.5; }
      ctx.fillStyle = ec;
      ctx.beginPath(); ctx.arc(e.x + r * 0.03, -r * 0.135, e.h * 0.55, 0, 6.29); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(10,8,8,0.85)';
      ctx.beginPath(); ctx.arc(e.x + r * 0.035, -r * 0.135, e.h * 0.26, 0, 6.29); ctx.fill();
      // faint upper lid only (no heavy band)
      ctx.strokeStyle = fem ? 'rgba(22,14,12,0.7)' : 'rgba(60,38,28,0.3)';
      ctx.lineWidth = fem ? 1.3 : 0.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(e.x - e.w * 0.7, -r * 0.2);
      ctx.quadraticCurveTo(e.x, -r * 0.14 - e.h * 1.35, e.x + e.w * 0.78, -r * 0.21);
      ctx.stroke();
      // brow: thin, lifted well clear of the eye
      ctx.strokeStyle = v.hair ? shade(v.hair.color, 26) : 'rgba(44,36,30,0.75)';
      ctx.lineWidth = fem ? 1.2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(e.x - e.w * 0.7, -r * 0.42);
      ctx.quadraticCurveTo(e.x + e.w * 0.1, -r * (fem ? 0.52 : 0.48), e.x + e.w * 0.9, -r * 0.4);
      ctx.stroke();
    }
    // subtle nose: bridge shadow + tip
    ctx.strokeStyle = 'rgba(60,35,25,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(r * 0.17, r * 0.02);
    ctx.quadraticCurveTo(r * 0.24, r * 0.22, r * 0.13, r * 0.3);
    ctx.stroke();
    // mouth
    if (fem) {
      ctx.strokeStyle = 'rgba(176,84,94,0.95)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.06, r * 0.52);
      ctx.quadraticCurveTo(r * 0.12, r * 0.6, r * 0.3, r * 0.5);
      ctx.stroke();
      // cheek blush
      ctx.fillStyle = 'rgba(220,120,110,0.13)';
      ctx.beginPath(); ctx.ellipse(r * 0.42, r * 0.18, r * 0.16, r * 0.1, 0, 0, 6.29); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-r * 0.3, r * 0.16, r * 0.14, r * 0.09, 0, 0, 6.29); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(50,28,22,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, r * 0.53);
      ctx.quadraticCurveTo(r * 0.12, r * 0.58, r * 0.32, r * 0.5);
      ctx.stroke();
    }
    if (opts.scars) {
      ctx.strokeStyle = 'rgba(190,90,70,0.65)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.52 + i * 3.6, -r * 0.46);
        ctx.quadraticCurveTo(-r * 0.4 + i * 3.6, 0, -r * 0.48 + i * 4, r * 0.44);
        ctx.stroke();
      }
    }
  }

  function drawHair(ctx, v, r, t) {
    if (!v.hair || v.hair.style === 'bald') return;
    const col = v.hair.color;
    const hg = ctx.createLinearGradient(0, -r * 1.15, 0, r * 0.3);
    hg.addColorStop(0, shade(col, 30));
    hg.addColorStop(1, col);
    ctx.fillStyle = hg;
    const style = v.hair.style;
    if (style === 'long') {
      // flowing back mass first (behind the skull silhouette is already
      // drawn, so this reads as hair falling behind the shoulders)
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.55);
      ctx.quadraticCurveTo(-r * 1.25, r * 0.3, -r * 1.0, r * 1.3);
      ctx.quadraticCurveTo(-r * 0.92, r * 2.0 + Math.sin(t * 2.6) * 1.6, -r * 0.5, r * 2.3 + Math.sin(t * 3) * 2);
      ctx.quadraticCurveTo(-r * 0.42, r * 1.2, -r * 0.5, r * 0.4);
      ctx.quadraticCurveTo(-r * 0.6, -r * 0.1, -r * 0.7, -r * 0.55);
      ctx.fill();
    }
    // neat cap hugging the skull, hairline showing the forehead
    ctx.beginPath();
    ctx.moveTo(r * 0.66, -r * 0.56);
    ctx.quadraticCurveTo(r * 0.95, -r * 1.06, 0, -r * 1.12);
    ctx.quadraticCurveTo(-r * 0.98, -r * 1.12, -r * 0.9, -r * 0.05);
    ctx.quadraticCurveTo(-r * 0.85, r * 0.18, -r * 0.68, r * 0.2);
    ctx.lineTo(-r * 0.62, -r * 0.2);
    ctx.quadraticCurveTo(-r * 0.55, -r * 0.78, 0, -r * 0.8);
    ctx.quadraticCurveTo(r * 0.4, -r * 0.78, r * 0.66, -r * 0.56);
    ctx.closePath();
    ctx.fill();
    if (style === 'spiky') {
      for (let i = 0; i < 5; i++) {
        const a = -2.45 + i * 0.42;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.7, -r * 0.4 + Math.sin(a) * r * 0.52);
        ctx.lineTo(Math.cos(a - 0.1) * r * 1.3, -r * 0.5 + Math.sin(a - 0.18) * r * 1.05);
        ctx.lineTo(Math.cos(a + 0.32) * r * 0.7, -r * 0.36 + Math.sin(a + 0.32) * r * 0.48);
        ctx.closePath();
        ctx.fill();
      }
    } else if (style === 'bun') {
      ctx.beginPath();
      ctx.arc(-r * 0.82, -r * 0.62, r * 0.36, 0, 6.29);
      ctx.fill();
    }
    // soft shine
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = r * 0.12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.92);
    ctx.quadraticCurveTo(r * 0.15, -r * 1.0, r * 0.5, -r * 0.72);
    ctx.stroke();
  }

  function drawHead(ctx, ch, s, t) {
    const v = ch.visual;
    const [hx, hy] = s.headC;
    const r = B.headR * (v.headScale || 1);
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(s.headA * 0.5);
    const baseCol = v.mask === 'full' || v.mask === 'shadow' ? v.suit.torso :
                    v.mask === 'helmet' ? v.suit.metal || '#8a93a6' : v.skin;
    // skull + jaw
    const fg = ctx.createLinearGradient(-r, -r * 0.8, r * 0.9, r * 0.6);
    fg.addColorStop(0, shade(baseCol, -12));
    fg.addColorStop(0.45, baseCol);
    fg.addColorStop(1, shade(baseCol, 20));
    ctx.fillStyle = fg;
    headOutline(ctx, r);
    ctx.fill();

    if (v.mask === 'none' || v.mask === 'scarred') {
      // ear
      ctx.fillStyle = shade(v.skin, -14);
      ctx.beginPath();
      ctx.ellipse(-r * 0.6, r * 0.08, r * 0.13, r * 0.21, 0.08, 0, 6.29);
      ctx.fill();
      drawHair(ctx, v, r, t);
      faceFeatures(ctx, v, r, { scars: v.mask === 'scarred' });
    } else if (v.mask === 'cowl') {
      // armored hood-cowl with light trim; jaw and mouth exposed
      ctx.fillStyle = v.suit.torso;
      ctx.beginPath();
      ctx.moveTo(r * 0.78, r * 0.08);
      ctx.quadraticCurveTo(r * 0.95, -r * 1.1, 0, -r * 1.14);
      ctx.quadraticCurveTo(-r * 1.05, -r * 1.16, -r * 0.95, r * 0.1);
      ctx.quadraticCurveTo(-r * 0.9, r * 0.55, -r * 0.45, r * 0.62);
      ctx.quadraticCurveTo(-r * 0.1, r * 0.42, r * 0.45, r * 0.42);
      ctx.quadraticCurveTo(r * 0.72, r * 0.36, r * 0.78, r * 0.08);
      ctx.closePath();
      ctx.fill();
      // hood peak
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 1.1);
      ctx.quadraticCurveTo(0, -r * 1.42, r * 0.35, -r * 1.05);
      ctx.quadraticCurveTo(0, -r * 1.16, -r * 0.2, -r * 1.1);
      ctx.fill();
      // light trim along the hood's outer edge (not across the face)
      if (v.cowlTrim) {
        ctx.strokeStyle = v.cowlTrim;
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(r * 0.8, r * 0.04);
        ctx.quadraticCurveTo(r * 0.96, -r * 1.08, 0, -r * 1.13);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // exposed jaw + mouth
      ctx.fillStyle = v.skin;
      ctx.beginPath();
      ctx.moveTo(-r * 0.28, r * 0.62);
      ctx.quadraticCurveTo(0, r * 0.96, r * 0.4, r * 0.74);
      ctx.quadraticCurveTo(r * 0.6, r * 0.52, r * 0.5, r * 0.45);
      ctx.quadraticCurveTo(0, r * 0.56, -r * 0.28, r * 0.62);
      ctx.fill();
      ctx.strokeStyle = 'rgba(50,28,22,0.6)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.68); ctx.quadraticCurveTo(r * 0.16, r * 0.72, r * 0.32, r * 0.64);
      ctx.stroke();
      drawGlowEyes(ctx, v, r * 0.42, r);
    } else if (v.mask === 'shadow') {
      // uncanny: round staring white eyes and a too-wide grin
      ctx.save();
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 9;
      ctx.fillStyle = '#fdfdfd';
      ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.14, r * 0.18, 0, 6.29); ctx.fill();
      ctx.beginPath(); ctx.arc(-r * 0.13, -r * 0.24, r * 0.125, 0, 6.29); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#0b0a10';
      ctx.beginPath(); ctx.arc(r * 0.46, -r * 0.12, r * 0.045, 0, 6.29); ctx.fill();
      ctx.beginPath(); ctx.arc(-r * 0.1, -r * 0.27, r * 0.033, 0, 6.29); ctx.fill();
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 7;
      ctx.fillStyle = '#fdfdfd';
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, r * 0.26);
      ctx.quadraticCurveTo(r * 0.12, r * 0.92, r * 0.6, r * 0.14);
      ctx.quadraticCurveTo(r * 0.12, r * 0.6, -r * 0.6, r * 0.26);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(11,10,16,0.8)';
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 7; i++) {
        const k = i / 7;
        const sx = -r * 0.55 + r * 1.1 * k;
        const sy = r * 0.32 + Math.sin(k * Math.PI) * r * 0.26;
        ctx.beginPath();
        ctx.moveTo(sx, sy - r * 0.07);
        ctx.lineTo(sx, sy + r * 0.07);
        ctx.stroke();
      }
      ctx.restore();
    } else if (v.mask === 'full') {
      drawGlowEyes(ctx, v, r * 0.42, r);
    } else if (v.mask === 'helmet') {
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
      ctx.ellipse(r * 0.34, -r * 0.12, r * 0.52, r * 0.26, 0.08, 0, 6.29);
      ctx.fill();
      drawGlowEyes(ctx, v, r * 0.42, r);
      ctx.strokeStyle = shade(v.suit.metal || '#8a93a6', -35);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(r * 0.08, r * 0.2); ctx.lineTo(r * 0.12, r * 0.82); ctx.stroke();
    } else if (v.mask === 'visor') {
      ctx.fillStyle = v.suit.torso;
      ctx.beginPath(); ctx.ellipse(0, -r * 0.32, r * 0.9, r * 0.68, 0, Math.PI, Math.PI * 2); ctx.fill();
      const vg = ctx.createLinearGradient(-r, -r * 0.3, r, 0);
      vg.addColorStop(0, v.eyes.glow); vg.addColorStop(1, shade('#222233', 10));
      ctx.fillStyle = vg;
      ctx.shadowColor = v.eyes.glow; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(r * 0.22, -r * 0.12, r * 0.6, r * 0.2, 0.05, 0, 6.29);
      ctx.fill();
      ctx.shadowBlur = 0;
      // exposed jaw with mouth
      ctx.fillStyle = v.skin;
      ctx.beginPath();
      ctx.moveTo(-r * 0.34, r * 0.46);
      ctx.quadraticCurveTo(r * 0.02, r * 0.92, r * 0.4, r * 0.4);
      ctx.quadraticCurveTo(r * 0.06, r * 0.52, -r * 0.34, r * 0.46);
      ctx.fill();
      ctx.strokeStyle = 'rgba(50,28,22,0.55)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-r * 0.04, r * 0.6); ctx.quadraticCurveTo(r * 0.14, r * 0.65, r * 0.3, r * 0.56);
      ctx.stroke();
    } else if (v.mask === 'oni') {
      ctx.fillStyle = v.suit.metal || '#3a3f4a';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.36, r * 0.92, r * 0.7, 0, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();
      ctx.fillStyle = '#5c1f1f';
      ctx.beginPath(); ctx.ellipse(r * 0.18, r * 0.34, r * 0.58, r * 0.48, 0, 0, Math.PI); ctx.fill();
      drawGlowEyes(ctx, v, r * 0.42, r);
      ctx.strokeStyle = '#d9c98c'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.85); ctx.quadraticCurveTo(-r * 0.1, -r * 1.7, r * 0.45, -r * 1.6); ctx.stroke();
    } else if (v.mask === 'hood') {
      ctx.fillStyle = v.suit.cape || v.suit.torso;
      ctx.beginPath();
      ctx.moveTo(r * 0.95, -r * 0.05);
      ctx.quadraticCurveTo(r * 0.6, -r * 1.45, -r * 0.95, -r * 0.75);
      ctx.quadraticCurveTo(-r * 1.35, r * 0.4, -r * 0.5, r * 0.95);
      ctx.quadraticCurveTo(0, r * 1.15, r * 0.8, r * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.ellipse(r * 0.22, r * 0.08, r * 0.58, r * 0.66, 0, 0, 6.29);
      ctx.fill();
      drawGlowEyes(ctx, v, r * 0.42, r, 0.6);
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
    // inner fold shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(nx - 2, ny + 6);
    ctx.quadraticCurveTo(nx - len * 0.3 - sway * 0.5, ny + len * 0.5, nx - len * 0.26 - sway * 0.85, ny + len * 0.94);
    ctx.stroke();
    // bright inner lining along the trailing edge (hero-cape look)
    if (v.cape.inner) {
      ctx.strokeStyle = v.cape.inner;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(nx - 7, ny + 4);
      ctx.quadraticCurveTo(nx - len * 0.56 - sway * 0.4, ny + len * 0.46,
        nx - len * 0.43 - sway, ny + len + Math.sin(t * 3.1) * 4);
      ctx.stroke();
    }
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
    ctx.strokeStyle = '#3a2c1c';
    ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(hx - dx * 5, hy - dy * 5); ctx.lineTo(hx + dx * 4, hy + dy * 4); ctx.stroke();
    ctx.strokeStyle = v.weapon.guard || '#c9a86a';
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(hx + dx * 4 - dy * 6, hy + dy * 4 + dx * 6); ctx.lineTo(hx + dx * 4 + dy * 6, hy + dy * 4 - dx * 6); ctx.stroke();
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
  function draw(ctx, ch, p, opts) {
    const v = ch.visual;
    const sc = (opts.scale || 2.5) * (v.heightScale || 1);
    const s = skeleton(p, v.build || 0.3, v.fem);
    const t = opts.t || 0;
    ctx.save();
    ctx.translate(opts.x, opts.y);
    if (opts.shadow !== false) {
      ctx.save();
      const airK = Math.max(0, Math.min(1, (opts.airH || 0) / 200));
      ctx.globalAlpha = 0.45 * (1 - airK * 0.7);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
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
    const fem = v.fem;
    const lw = fem ? 0.88 : 1;
    // limb widths: shoulder->wrist, hip->ankle tapers
    const wArmU = 8.2 * bw * lw, wArmW = 5.2 * bw * lw;
    const wThigh = 10.5 * bw * lw, wAnkle = 5.6 * bw * lw;
    const wKnee = 7.6 * bw * lw, wElbow = 6.4 * bw * lw;

    if (opts.aura) {
      ctx.shadowColor = opts.aura;
      ctx.shadowBlur = 18 + Math.sin(t * 9) * 6;
    } else if (v.aura) {
      ctx.shadowColor = v.aura;
      ctx.shadowBlur = 12 + Math.sin(t * 6) * 4;
    }

    // muscle-belly emphasis scales with build, softer on feminine frames
    const mus = 1 + (v.build || 0.3) * 0.32 - (fem ? 0.2 : 0);
    const biW = wArmU * 1.28 * mus, caW = wKnee * 1.3 * mus;
    const quW = wThigh * 1.12 * mus, frW = wElbow * 1.14 * mus;

    // ---- far limbs (darker for depth) ----
    const dk = -42;
    muscle(ctx, s.hip, s.knR, wThigh, quW, wKnee, 0.35, shade(suit.legs, dk), 0);
    joint(ctx, s.knR, wKnee, shade(suit.legs, dk));
    muscle(ctx, s.knR, s.ftR, wKnee, caW, wAnkle, 0.3, shade(suit.legs, dk), 0);
    drawBoot(ctx, s.ftR, s.ftRA, shade(suit.boots, dk));
    joint(ctx, s.shoulderR, wArmU * 1.05, shade(suit.arms, dk)); // far deltoid
    muscle(ctx, s.shoulderR, s.elR, wArmU, biW, wElbow, 0.42, shade(suit.arms, dk), 0);
    joint(ctx, s.elR, wElbow, shade(suit.arms, dk));
    muscle(ctx, s.elR, s.handR, wElbow, frW, wArmW, 0.3, shade(suit.arms, dk), 0);
    drawFist(ctx, s.handR, s.handRA, v.gloves ? shade(suit.gloves, dk) : shade(v.skin, dk));
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
    // hourglass for feminine builds; strong V-taper for everyone else
    const shW = B.shoulderW * bw * (fem ? 0.78 : 1);
    const hpW = B.hipW * bw + (fem ? 4.0 : 1.2);
    const waW = fem ? Math.min(shW, hpW) * 0.52 : hpW * 0.82; // waist pinch
    ctx.beginPath();
    ctx.moveTo(s.hip[0] - perp[0] * hpW, s.hip[1] - perp[1] * hpW);
    ctx.quadraticCurveTo(s.belly[0] - perp[0] * waW, s.belly[1] - perp[1] * waW,
      s.neck[0] - perp[0] * shW, s.neck[1] - perp[1] * shW + 2);
    ctx.quadraticCurveTo(s.neck[0], s.neck[1] - 4.5, s.neck[0] + perp[0] * shW, s.neck[1] + perp[1] * shW + 2);
    ctx.quadraticCurveTo(s.belly[0] + perp[0] * waW, s.belly[1] + perp[1] * waW,
      s.hip[0] + perp[0] * hpW, s.hip[1] + perp[1] * hpW);
    ctx.closePath();
    ctx.fill();
    // trapezius slope: connects neck into the shoulders so the figure
    // reads athletic instead of pin-headed
    ctx.fillStyle = shade(suit.torso, 16);
    ctx.beginPath();
    ctx.moveTo(s.neck[0] - perp[0] * shW * 0.92, s.neck[1] - perp[1] * shW * 0.92 + 2.5);
    ctx.quadraticCurveTo(s.neck[0] - perp[0] * shW * 0.3, s.neck[1] - perp[1] * shW * 0.3 - 6.5,
      s.neck[0], s.neck[1] - 6);
    ctx.quadraticCurveTo(s.neck[0] + perp[0] * shW * 0.3, s.neck[1] + perp[1] * shW * 0.3 - 6.5,
      s.neck[0] + perp[0] * shW * 0.92, s.neck[1] + perp[1] * shW * 0.92 + 2.5);
    ctx.quadraticCurveTo(s.neck[0], s.neck[1] + 1,
      s.neck[0] - perp[0] * shW * 0.92, s.neck[1] - perp[1] * shW * 0.92 + 2.5);
    ctx.closePath();
    ctx.fill();
    // rim light on chest
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(s.neck[0] + perp[0] * shW * 0.85, s.neck[1] + perp[1] * shW * 0.85 + 3);
    ctx.quadraticCurveTo(s.chest[0] + perp[0] * (shW * 0.75), s.chest[1] + perp[1] * shW * 0.75,
      s.belly[0] + perp[0] * waW * 0.9, s.belly[1] + perp[1] * waW * 0.9);
    ctx.stroke();
    ctx.restore();
    if (fem) {
      // bust: soft highlight above, gentle shadow curve beneath
      for (const sgn of [-1, 1]) {
        ctx.fillStyle = 'rgba(255,255,255,0.09)';
        ctx.beginPath();
        ctx.ellipse(s.chest[0] + perp[0] * 3.6 * sgn, s.chest[1] + perp[1] * 3.6 * sgn + 0.5,
          4.2, 3.2, p.torso, 0, 6.29);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.16)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(s.chest[0] + perp[0] * 3.6 * sgn, s.chest[1] + perp[1] * 3.6 * sgn + 1.5,
          4.2, 3.0, p.torso, 0.3, Math.PI - 0.5);
        ctx.stroke();
      }
    } else {
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
    }
    // belt
    if (suit.belt) {
      ctx.strokeStyle = suit.belt;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.hip[0] - perp[0] * (hpW + 0.5), s.hip[1] - perp[1] * (hpW + 0.5) - 2);
      ctx.lineTo(s.hip[0] + perp[0] * (hpW + 0.5), s.hip[1] + perp[1] * (hpW + 0.5) - 2);
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
      ctx.strokeStyle = '#4e7a3a'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.hip[0], s.hip[1]);
      ctx.quadraticCurveTo(s.belly[0] + 6, s.belly[1], s.chest[0] - 4, s.chest[1] - 2);
      ctx.stroke();
    }
    drawEmblem(ctx, v, s, perp, t);
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

    // ---- neck ----
    const neckCol = (v.mask === 'full' || v.mask === 'shadow' || v.mask === 'cowl' || v.mask === 'hood')
      ? suit.torso : v.skin;
    taper(ctx, [s.neck[0], s.neck[1] + 1.5], s.headC, 5.2 * bw * lw, 4.2 * bw * lw, neckCol, 0);

    // ---- near leg (quad + calf bellies) ----
    muscle(ctx, s.hip, s.knL, wThigh, quW, wKnee, 0.35, suit.legs);
    joint(ctx, s.knL, wKnee, suit.legs);
    muscle(ctx, s.knL, s.ftL, wKnee, caW, wAnkle, 0.3, shade(suit.legs, 4));
    drawBoot(ctx, s.ftL, s.ftLA, suit.boots);

    // ---- head ----
    drawHead(ctx, ch, s, t);
    if (v.railgun) drawRailgun(ctx, s);

    // ---- near arm (deltoid + bicep/forearm bellies + fist) ----
    joint(ctx, s.shoulderL, wArmU * 1.12, shade(suit.arms, 14));
    muscle(ctx, s.shoulderL, s.elL, wArmU, biW, wElbow, 0.42, suit.arms);
    joint(ctx, s.elL, wElbow, suit.arms);
    muscle(ctx, s.elL, s.handL, wElbow, frW, wArmW, 0.3, shade(suit.arms, 5));
    drawFist(ctx, s.handL, s.handLA, v.gloves ? suit.gloves : v.skin);

    // powered-suit glow: gauntlet bands and boot soles (hero-tech look)
    if (v.glow) {
      const band = (a, b, k0, k1, w) => {
        ctx.save();
        ctx.strokeStyle = v.glow;
        ctx.shadowColor = v.glow; ctx.shadowBlur = 8;
        ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a[0] + (b[0] - a[0]) * k0, a[1] + (b[1] - a[1]) * k0);
        ctx.lineTo(a[0] + (b[0] - a[0]) * k1, a[1] + (b[1] - a[1]) * k1);
        ctx.stroke();
        ctx.restore();
      };
      band(s.elL, s.handL, 0.62, 0.85, wArmW * 0.85);
      band(s.elR, s.handR, 0.62, 0.85, wArmW * 0.7);
      band(s.knL, s.ftL, 0.8, 0.97, wAnkle * 0.8);
      band(s.knR, s.ftR, 0.8, 0.97, wAnkle * 0.65);
    }
    // lightning glyph on the shoulder
    if (v.boltAccents) {
      ctx.save();
      ctx.fillStyle = v.boltAccents;
      ctx.shadowColor = v.boltAccents; ctx.shadowBlur = 5;
      ctx.translate(s.shoulderL[0], s.shoulderL[1] - 1);
      ctx.beginPath();
      ctx.moveTo(1.4, -3.6); ctx.lineTo(-2.0, 0.4); ctx.lineTo(-0.2, 0.6);
      ctx.lineTo(-1.2, 4.0); ctx.lineTo(2.2, -0.4); ctx.lineTo(0.4, -0.6);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // impact-frame additive glow
    if (opts.flash) {
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
    const g = ctx.createLinearGradient(0, -4, 0, 3);
    g.addColorStop(0, shade(color, 14));
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-4 + lean * 2, -3.5);
    ctx.lineTo(B.foot + 1 + lean * 2, -2.5);
    ctx.quadraticCurveTo(B.foot + 4 + lean * 2, -0.5, B.foot + 2 + lean * 2, 2);
    ctx.lineTo(-4 + lean * 2, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-4 + lean * 2, 1.2, B.foot + 6, 1.4);
    ctx.restore();
  }

  function drawFist(ctx, hd, ang, color) {
    ctx.save();
    ctx.translate(hd[0], hd[1]);
    ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-4.0, -3.0, 8.0, 7.2, 2.8);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(-3.5, 0.8, 7.0, 1.2); // knuckle line
    ctx.restore();
  }

  function drawEmblem(ctx, v, s, perp, t) {
    if (!v.emblem || v.emblem.type === 'none') return;
    const e = v.emblem;
    const [cx, cy] = s.chest;
    ctx.save();
    ctx.translate(cx + perp[0] * 0.5, cy);
    ctx.scale(e.scale || 1, e.scale || 1);
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
