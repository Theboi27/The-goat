# Static Knight: Cosmic Reckoning

A high-fidelity 2.5D cinematic fighting game built on the **Hyper-Flow engine** — pure
HTML5 Canvas + WebAudio, zero dependencies. Open `index.html` in any modern browser
and fight.

![genre](https://img.shields.io/badge/genre-2.5D%20fighter-blueviolet)

## Play

```bash
# any static server works, or just double-click index.html
npx http-server .
```

## Game Modes

| Mode | Description |
| --- | --- |
| **Story — "The Cost of Justice"** | Three cinematic acts: The Urban Ghost, The Great Correction, The Dream World. Ends in the three-phase Throne of Glass battle against Dream Man. Beating it unlocks the secrets. |
| **Arcade** | A 7-fight ladder ending with Dream Man at the Throne of Glass. Character ending + unlocks on completion. |
| **Versus (2 Players)** | Local 1v1 on one keyboard. |
| **Versus CPU** | Fight the machine, with a CPU roulette pick. |

## The Hyper-Flow Combat System

- **Link System** — chain-combo routes (LP → LK → HP → HK, plus launcher and special/finisher cancels) with air juggles, damage scaling, an on-screen combo counter and end-of-string damage summary.
- **Impact frames** — every clean hit freezes both fighters for a few frames with a radial spark burst, white flash and screen shake. Heavy hits hit *hard*.
- **Perfect Counter** — tap Block right before a hit lands: slow-mo flash, attacker staggered, meter bonus.
- **Hyper-Dash** — teleporting dash with afterimages, limited by the Stamina meter to prevent spamming.
- **Omnidirectional Flight** — fliers (Static Knight, Kaito, Breeze Master, Prisia, Tsunami, Dream Man…) press jump again mid-air to fly freely.
- **Finishers** — fill the super meter and unleash a cinematic named finisher (Cosmoversal Strike, Mumbai Requiem, Population Multiplier, 16-ton Dream Logic…). Some apply Static State slow, Absolute Zero freeze, or Dream Man's Relativity control-reversal.
- Per-character **entrance animations** (smoke bomb, fly-in, teleport, seismic crash, water/ice burst, walk-up) and **pre-fight dialogue** with matchup-specific lines.
- Tournament-style character select: title banner, two large fighter busts over engraved nameplates, a full-width portrait-tile grid with a **Random** tile, per-character confirm animations and signature sound.
- Tournament HUD: skewed health bars with a draining damage trail, ornate timer medallion, round-win gems, and each fighter's **style name** (IAIDO, UNBOUND BOXING, DREAM LOGIC…) displayed at the bottom.

## Roster (15 + 2 secret)

Static Knight, The Shadow, Prisia, Tecton, Eternal Guard, Breeze Master, Conrad
(adaptive — gets stronger as he's hit), Reap Walker (toon-force reach + 16-ton drops),
Tsunami, Kaito, Glacier, Gungod, The Outsider, Kenzo, Dream Man — plus secret
**Cosmiostasis Julias** and **Dream Man (Repaired)**, unlocked by finishing Story or Arcade.

## Arenas

Zalum Prison · Westminster Ruins · Site Omega · Nightmare Cathedral · Tokyo Inferno ·
Throne of Glass · **Cyber City Rooftop** (secret — the night city from the main menu).

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Move | A / D | ← / → |
| Jump / Fly (again mid-air) | W | ↑ |
| Block / Crouch | S (hold) | ↓ (hold) |
| Light / Heavy Punch | J / U | Num1 / Num4 (B / G) |
| Light / Heavy Kick | K / I | Num2 / Num5 (N / H) |
| Special | L | Num3 (M) |
| Finisher (full meter) | O | Num6 ( , ) |
| Hyper-Dash | Left Shift | Num0 (Right Shift) |
| Launcher | S + J | ↓ + Num1 |

## Development

```bash
node test/smoke.js        # headless engine test: menus, select, full combat
PLAYWRIGHT_BROWSERS_PATH=... node test/screenshot.js   # visual scene captures
```

All art is procedurally drawn (parametric skeleton-driven human renderer with costume
layers) and all audio is synthesized at runtime — no asset files.
