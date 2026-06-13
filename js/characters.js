// ============================================================
// CHARACTERS — full roster: designs, stats, movesets, dialogue
// ============================================================
// entrance: 'fly' | 'smoke' | 'teleport' | 'walk' | 'crash' | 'water' | 'ice'
// selectFx: effect played on character confirm in select screen
// special: D+special projectile / technique
// sup: full-meter finisher

const CHARACTERS = {

  julias: {
    id: 'julias', name: 'STATIC KNIGHT', alias: 'Julias',
    title: 'The Electric Cosmic Champion',
    theme: '#7fd4ff',
    stats: { hp: 1000, speed: 1.0, power: 1.0, reach: 1.0, defense: 1.0 },
    flight: true, entrance: 'fly', selectFx: 'lightning',
    special: { kind: 'projectile', gfx: 'bolt', name: 'Static Bolt', dmg: 65, speed: 760, color: '#8fe1ff', sfx: 'zap' },
    sup: { kind: 'rush', name: 'COSMOVERSAL STRIKE', dmg: 230, hits: 6, color: '#9fefff', after: 'slow', sfx: 'zap',
      quote: 'One tenth of Cosmiostasis. That is all you get.' },
    visual: { // reference: black armored suit, glowing shield emblem,
      // white-trimmed cowl, white-lined cape, energy gauntlets/boots
      skin: '#c79571', build: 0.55, heightScale: 1.0,
      mask: 'cowl', cowlTrim: '#e6f4fb', eyes: { glow: '#eafcff' }, gloves: true, aura: null,
      suit: { torso: '#171b23', arms: '#1c212b', legs: '#14181f', boots: '#0f1218', gloves: '#10141b', belt: '#39455a' },
      emblem: { type: 'shieldbolt', color: '#bfeaff', glow: true, scale: 1.75 },
      cape: { color: '#0d1015', len: 64, inner: '#dfe7ee' },
      glow: '#8fe3ff', boltAccents: '#cfeeff',
    },
    intro: ['This city is under my protection.', 'I won\'t lose anyone else.'],
    win: ['Justice has a cost. I pay it every day.', 'Stay down. Please.'],
    vs: { conrad: 'Conrad... I don\'t want to fight you again.', dreamman: 'Your "correction" ends here, Dream Man!', shadow: 'You\'re... me? Before the converter?' },
  },

  shadow: {
    id: 'shadow', name: 'THE SHADOW', alias: 'Julias (Unpowered)',
    title: 'The Urban Ghost',
    theme: '#8b93a6',
    stats: { hp: 780, speed: 1.22, power: 0.85, reach: 0.92, defense: 0.85 },
    flight: false, entrance: 'smoke', selectFx: 'smoke', evasive: true,
    special: { kind: 'projectile', gfx: 'bullet', name: '.38 Special', dmg: 55, speed: 1150, color: '#ffd27c', sfx: 'gun' },
    sup: { kind: 'rush', name: 'GHOST PROTOCOL ZERO', dmg: 190, hits: 8, color: '#aab4c8', after: 'smoke', sfx: 'slash',
      quote: 'You never saw me coming.' },
    visual: {
      skin: '#c79571', build: 0.35, heightScale: 0.98,
      mask: 'hood', eyes: { glow: '#cfd6e4' }, gloves: true,
      suit: { torso: '#0c0e13', arms: '#0e1117', legs: '#0a0c10', boots: '#171b22', gloves: '#14171d', belt: '#2c3340', cape: '#0a0c11' },
      emblem: { type: 'none' },
      cape: { color: '#0a0c11', len: 66 },
    },
    intro: ['The Syndicate taught me one thing: fear works.', 'No powers. No problem.'],
    win: ['Tell them a ghost did this.', 'The alley always wins.'],
    vs: { gungod: 'All that hardware, and you still can\'t find me.', julias: 'So that\'s what I become...' },
  },

  prisia: {
    id: 'prisia', name: 'PRISIA', alias: 'Mei Lee',
    title: 'The Light of Faith',
    theme: '#ffe9a3',
    stats: { hp: 920, speed: 0.95, power: 0.95, reach: 1.15, defense: 1.05 },
    flight: true, entrance: 'fly', selectFx: 'light',
    special: { kind: 'beam', name: 'Radiant Lance', dmg: 75, color: '#ffe9a0', sfx: 'beam' },
    sup: { kind: 'beam', name: 'ABSOLUTION', dmg: 240, color: '#fff3c4', big: true, sfx: 'beam',
      quote: 'May this light carry you somewhere kinder.' },
    visual: {
      skin: '#e8c39a', build: 0.22, heightScale: 0.97,
      mask: 'none', hair: { style: 'long', color: '#2b2118' }, eyes: { glow: '#ffeebb' }, gloves: true,
      suit: { torso: '#f2ede1', arms: '#e9e2d2', legs: '#efe9da', boots: '#cfa84f', gloves: '#d9b35c', belt: '#c79b3f' },
      emblem: { type: 'star', color: '#ffe9a0', glow: true },
      cape: { color: '#e8ddc2', len: 58 },
      weapon: { len: 46, w: 3.4, color: '#d9b35c', glow: '#ffe9a0', guard: '#fff' },
      pauldrons: '#d9b35c',
    },
    intro: ['My faith is not a weakness. It is a weapon.', 'The Artifact chose me. I choose to fight.'],
    win: ['Light endures. Always.', 'I will pray for you. I mean that kindly.'],
    vs: { dreamman: 'You are not a god. I have met none, and you are less.', reap: 'Even nightmares can learn to hope.' },
  },

  tecton: {
    id: 'tecton', name: 'TECTON', alias: 'Marcus',
    title: 'The Gaia-Blessed Prodigy',
    theme: '#a8d96c',
    stats: { hp: 1150, speed: 0.85, power: 1.2, reach: 1.0, defense: 1.2 },
    flight: false, entrance: 'crash', selectFx: 'rock',
    special: { kind: 'buff', name: 'Wild Shift', dmg: 50, color: '#a8e06c', sfx: 'special',
      forms: ['BEAR: +POWER', 'CHEETAH: +SPEED', 'HAWK: +FLIGHT'] },
    sup: { kind: 'slam', name: 'POPULATION MULTIPLIER', dmg: 260, color: '#d8a55f', sfx: 'heavy',
      quote: 'Eight billion souls stand behind this fist.' },
    visual: { // a teenager: lighter frame, young face, black hair
      skin: '#ecc5a0', build: 0.45, heightScale: 0.97,
      mask: 'none', hair: { style: 'short', color: '#17181c' }, eyes: { glow: null }, gloves: false,
      suit: { torso: '#6b5138', arms: '#7a5e40', legs: '#54422e', boots: '#3d3225', gloves: '#7a5e40', belt: '#9a7a46' },
      emblem: { type: 'leaf', color: '#a8d96c', glow: true, scale: 1.3 },
      cape: null, stone: true,
    },
    intro: ['The earth remembers everything. So do I.', 'Gaia\'s blessing isn\'t gentle.'],
    win: ['Solid ground. Solid win.', 'Get up when you\'re ready. The earth is patient.'],
    vs: { dreamman: 'You threatened my planet. Big mistake.', glacier: 'Ice against stone? Let\'s find out, Marie.' },
  },

  lucio: {
    id: 'lucio', name: 'ETERNAL GUARD', alias: 'Lucio',
    title: 'The Two-Thousand-Year Soldier',
    theme: '#cfd6e8',
    stats: { hp: 1000, speed: 1.0, power: 1.05, reach: 1.2, defense: 1.05 },
    flight: false, entrance: 'walk', selectFx: 'silver',
    special: { kind: 'projectile', gfx: 'blade', name: 'Spectral Gladius', dmg: 62, speed: 700, color: '#dfe7ff', sfx: 'slash' },
    sup: { kind: 'rush', name: "CENTURION'S REDEMPTION", dmg: 235, hits: 9, color: '#e6ecff', sfx: 'slash',
      quote: 'Two thousand years of war. Let me show you.' },
    visual: {
      skin: '#caa17a', build: 0.6, heightScale: 1.02,
      mask: 'helmet', eyes: { glow: '#dfe7ff' }, gloves: true, crest: '#a33131',
      suit: { torso: '#9aa5bd', arms: '#7e8aa3', legs: '#5d4a33', boots: '#8a93a6', gloves: '#7e8aa3', belt: '#caa15a', metal: '#9aa5bd' },
      emblem: { type: 'gear', color: '#e8eeff', glow: true },
      cape: { color: '#7d1f1f', len: 62 },
      weapon: { len: 40, w: 4.2, color: '#d7e0f4', glow: '#bcd0ff', guard: '#caa15a' },
      pauldrons: '#aab4c9',
    },
    intro: ['Rome fell. I did not.', 'I have buried empires. You are no empire.'],
    win: ['Another century, another battle.', 'Rest, soldier. You fought with honor.'],
    vs: { dreamman: 'I guarded Dreaminite for two millennia. I know your weakness.', kenzo: 'A samurai. Finally, a worthy blade.' },
  },

  breeze: {
    id: 'breeze', name: 'BREEZE MASTER', alias: 'David',
    title: 'The Arkonian Tempest',
    theme: '#9adfff',
    stats: { hp: 850, speed: 1.35, power: 0.85, reach: 1.0, defense: 0.9 },
    flight: true, entrance: 'fly', selectFx: 'wind',
    special: { kind: 'projectile', gfx: 'air', name: 'Pressure Wall', dmg: 58, speed: 620, color: '#cdeffd', sfx: 'whoosh' },
    sup: { kind: 'sphere', name: 'ZERO PRESSURE', dmg: 210, color: '#d8f4ff', after: 'freeze', sfx: 'whoosh',
      quote: 'I froze the air in your lungs. Breathe slow.' },
    visual: {
      skin: '#b5c4cf', build: 0.3, heightScale: 1.0, // arkonian gray-tinged
      mask: 'visor', eyes: { glow: '#aef' }, gloves: true, hair: { style: 'short', color: '#dfeaf2' },
      suit: { torso: '#1e5d8c', arms: '#2a72a8', legs: '#174a70', boots: '#e8f2f8', gloves: '#e8f2f8', belt: '#9adfff' },
      emblem: { type: 'wave', color: '#d6f2ff', glow: true },
      cape: null,
    },
    intro: ['Supersonic means you already lost.', 'Half Arkonian. Fully faster than you.'],
    win: ['Did you even see me?', 'The wind doesn\'t apologize.'],
    vs: { kaito: 'Race you to the stratosphere, Kaito.', julias: 'Lightning versus wind. Classic.' },
  },

  conrad: {
    id: 'conrad', name: 'CONRAD', alias: 'The Unbound',
    title: 'The Adaptive Weapon',
    theme: '#ff6b5e',
    stats: { hp: 1050, speed: 0.95, power: 1.05, reach: 0.95, defense: 0.95 },
    flight: false, entrance: 'walk', selectFx: 'rage', adaptive: true,
    special: { kind: 'projectile', gfx: 'plasma', name: 'Adaptation Burst', dmg: 60, speed: 640, color: '#ff8d7a', sfx: 'special' },
    sup: { kind: 'rush', name: 'UNBOUND RAGE', dmg: 245, hits: 10, color: '#ff7a6a', shake: true, sfx: 'heavy',
      quote: 'They kept me in a helmet for years. FEEL THIS.' },
    visual: {
      skin: '#7a4e32', build: 0.75, heightScale: 1.03,
      mask: 'none', hair: { style: 'spiky', color: '#16100c' }, eyes: { glow: '#ff8d7a' }, gloves: false,
      suit: { torso: '#1a1416', arms: '#221a1c', legs: '#161113', boots: '#2c2225', gloves: '#221a1c', belt: '#542c28' },
      emblem: { type: 'none' }, aura: 'rgba(255,90,70,0.45)',
      cape: null,
    },
    intro: ['Every hit you land makes me stronger. Go ahead.', 'I\'m free now. And I\'m angry.'],
    win: ['Adapt or fall. You fell.', '...Julias would tell me to show mercy. Fine.'],
    vs: { julias: 'You freed me. Doesn\'t mean I\'ll go easy.', dreamman: 'You put that helmet on me. I REMEMBER.' },
  },

  reap: {
    id: 'reap', name: 'REAP WALKER', alias: 'The Nightmare Ally',
    title: 'Dream-Logic Incarnate',
    theme: '#b98aff',
    stats: { hp: 950, speed: 1.05, power: 1.1, reach: 1.45, defense: 0.9 },
    flight: false, entrance: 'teleport', selectFx: 'void', toon: true,
    special: { kind: 'drop', name: '16-Ton Logic', dmg: 85, color: '#cdb6ff', sfx: 'weight' },
    sup: { kind: 'drop', name: 'DREAM LOGIC FINALE', dmg: 240, color: '#d7c5ff', big: true, sfx: 'weight',
      quote: 'In dreams, physics is just a suggestion.' },
    visual: {
      skin: '#0b0a10', build: 0.25, heightScale: 1.45,
      mask: 'shadow', eyes: { glow: '#e9defc' }, gloves: false,
      suit: { torso: '#0b0a10', arms: '#100e17', legs: '#0b0a10', boots: '#16121f', gloves: '#100e17', belt: null },
      emblem: { type: 'none' }, aura: 'rgba(150,110,255,0.4)',
      cape: { color: '#120e1c', len: 70 },
    },
    intro: ['WE SHARED A FEAR ONCE. NOW WE SHARE A FIGHT.', 'TEN FEET OF BAD DREAM, AT YOUR SERVICE.'],
    win: ['WAKE UP. IT IS OVER.', 'THE NIGHTMARE IS ON YOUR SIDE. TODAY.'],
    vs: { dreamman: 'YOU MADE ME. I UNMAKE YOU.', prisia: 'YOUR LIGHT IS WARM. STRANGE.' },
  },

  tsunami: {
    id: 'tsunami', name: 'TSUNAMI', alias: 'Priya',
    title: 'The Survivor of Mumbai',
    theme: '#3fd2c0',
    stats: { hp: 930, speed: 1.05, power: 0.95, reach: 1.1, defense: 1.0 },
    flight: true, entrance: 'water', selectFx: 'water',
    special: { kind: 'projectile', gfx: 'water', name: 'Sentient Surge', dmg: 64, speed: 600, color: '#5fe5d4', sfx: 'splash' },
    sup: { kind: 'sphere', name: 'MUMBAI REQUIEM', dmg: 250, color: '#6ff0df', sfx: 'splash',
      quote: 'For my thirty. For everyone I couldn\'t save.' },
    visual: {
      skin: '#9a6844', build: 0.3, heightScale: 0.98,
      mask: 'scarred', hair: { style: 'bun', color: '#160f0a' }, eyes: { glow: '#7df2e3' }, gloves: true,
      suit: { torso: '#0e5e57', arms: '#11756b', legs: '#0a4a45', boots: '#15837a', gloves: '#15837a', belt: '#3fd2c0' },
      emblem: { type: 'wave', color: '#8ff5e8', glow: true },
      cape: null,
    },
    intro: ['The water remembers Mumbai. So do I.', 'I carry thirty names into every fight.'],
    win: ['Stay down. The tide already decided.', 'This one\'s for my team.'],
    vs: { dreamman: 'You boiled the bay with my friends in it. No mercy.', glacier: 'Ice is just water that gave up, Marie.' },
  },

  kaito: {
    id: 'kaito', name: 'KAITO', alias: 'The Molecular Hero',
    title: 'Tokyo\'s Last Light',
    theme: '#e8edf4',
    stats: { hp: 870, speed: 1.25, power: 0.9, reach: 0.95, defense: 0.9 },
    flight: true, entrance: 'fly', selectFx: 'wind',
    special: { kind: 'projectile', gfx: 'air', name: 'Vacuum Razor', dmg: 60, speed: 800, color: '#eef3fa', sfx: 'whoosh' },
    sup: { kind: 'rush', name: 'VACUUM BREAK', dmg: 220, hits: 7, color: '#f2f6fc', sfx: 'whoosh',
      quote: 'Even erased, I keep fighting.' },
    visual: {
      skin: '#e0b48c', build: 0.35, heightScale: 0.99,
      mask: 'none', hair: { style: 'spiky', color: '#14161c' }, eyes: { glow: null }, gloves: true,
      suit: { torso: '#eceff4', arms: '#dde2ea', legs: '#c9cfd9', boots: '#9aa3b1', gloves: '#9aa3b1', belt: '#7d8694' },
      emblem: { type: 'none' },
      cape: null,
    },
    intro: ['Tokyo still stands while I do.', 'Molecules. Air. Victory. In that order.'],
    win: ['That was for Tokyo.', 'You fought hard. Be proud.'],
    vs: { dreamman: 'You erased me once. Never again.', breeze: 'Show me that Arkonian speed, David!' },
  },

  glacier: {
    id: 'glacier', name: 'GLACIER', alias: 'Marie',
    title: 'The Sub-Zero Bastion',
    theme: '#bfe8ff',
    stats: { hp: 1100, speed: 0.8, power: 1.1, reach: 1.05, defense: 1.3 },
    flight: false, entrance: 'ice', selectFx: 'ice',
    special: { kind: 'projectile', gfx: 'ice', name: 'Shard Volley', dmg: 66, speed: 680, color: '#cfeeff', sfx: 'ice' },
    sup: { kind: 'slam', name: 'ABSOLUTE ZERO', dmg: 230, color: '#dff4ff', after: 'freeze', sfx: 'ice',
      quote: 'Thirty feet of ice says you\'re done.' },
    visual: {
      skin: '#e7cdb6', build: 0.55, heightScale: 1.01,
      mask: 'none', hair: { style: 'long', color: '#dff2ff' }, eyes: { glow: '#bfe8ff' }, gloves: true,
      suit: { torso: '#7db8d9', arms: '#92c8e4', legs: '#5d9dbf', boots: '#cfeeff', gloves: '#cfeeff', belt: '#eaf7ff' },
      emblem: { type: 'snow', color: '#ffffff', glow: true },
      cape: { color: '#a8d4ea', len: 55 }, aura: 'rgba(160,220,255,0.35)',
      pauldrons: '#cfeeff',
    },
    intro: ['Cold is patient. Cold always wins.', 'I am the wall they break against.'],
    win: ['Frozen solid. Fight\'s over.', 'You\'ll thaw. Eventually.'],
    vs: { tsunami: 'Water obeys cold, Priya. Remember that.', tecton: 'Even mountains crack in winter, Marcus.' },
  },

  gungod: {
    id: 'gungod', name: 'GUNGOD', alias: 'The Arsenal',
    title: 'Syndicate\'s Finest Mercenary',
    theme: '#ff9b3d',
    stats: { hp: 1080, speed: 0.85, power: 1.1, reach: 1.05, defense: 1.1 },
    flight: false, entrance: 'walk', selectFx: 'gun',
    special: { kind: 'projectile', gfx: 'bullet', name: 'Energy Rifle', dmg: 58, speed: 1000, color: '#ffba6b', sfx: 'gun' },
    sup: { kind: 'beam', name: 'ORBITAL RAILGUN', dmg: 245, color: '#ffc27d', big: true, sfx: 'gun',
      quote: 'Shoulder cannon. Zero survivors. Invoice pending.' },
    visual: {
      skin: '#a8775a', build: 0.9, heightScale: 1.05,
      mask: 'visor', eyes: { glow: '#ffb866' }, gloves: true, railgun: true,
      suit: { torso: '#3a4150', arms: '#4a5263', legs: '#323845', boots: '#262b35', gloves: '#262b35', belt: '#ff9b3d' },
      emblem: { type: 'gear', color: '#ffb866', glow: true },
      cape: null, pauldrons: '#566173',
    },
    intro: ['Contract says I break you. Nothing personal.', 'Drones up. Rifle hot. Let\'s work.'],
    win: ['Payment received.', 'Hardware beats heroics. Every time.'],
    vs: { shadow: 'The ghost of the alleys. Big bounty on you.', julias: 'You cost me my best contract, Knight.' },
  },

  outsider: {
    id: 'outsider', name: 'THE OUTSIDER', alias: 'Cyber-Shinobi',
    title: 'The Digital Phantom',
    theme: '#5dff9e',
    stats: { hp: 820, speed: 1.3, power: 0.9, reach: 0.95, defense: 0.85 },
    flight: false, entrance: 'smoke', selectFx: 'smoke', evasive: true,
    special: { kind: 'dashstrike', name: 'Packet Slash', dmg: 70, color: '#7dffb2', sfx: 'slash' },
    sup: { kind: 'rush', name: 'GHOST PROTOCOL', dmg: 215, hits: 8, color: '#8dffc0', after: 'smoke', sfx: 'teleport',
      quote: 'Deleted. Like you were never here.' },
    visual: {
      skin: '#caa384', build: 0.3, heightScale: 0.99,
      mask: 'full', eyes: { glow: '#5dff9e' }, gloves: true,
      suit: { torso: '#101813', arms: '#142019', legs: '#0d140f', boots: '#1c2b21', gloves: '#1c2b21', belt: '#2a4a36' },
      emblem: { type: 'none' }, aura: 'rgba(90,255,160,0.25)',
      cape: { color: '#0d1410', len: 50 },
      weapon: { len: 34, w: 3, color: '#9dffc8', glow: '#5dff9e', guard: '#1c2b21' },
    },
    intro: ['I exist between frames.', 'Smoke in. Cut. Smoke out.'],
    win: ['Connection terminated.', 'You fought a rumor. Rumors win.'],
    vs: { kenzo: 'Old blade meets new code, samurai.', shadow: 'Two ghosts. One alley.' },
  },

  kenzo: {
    id: 'kenzo', name: 'KENZO', alias: 'The Upgraded Samurai',
    title: 'Arkonian Steel, Human Soul',
    theme: '#ff5d5d',
    stats: { hp: 900, speed: 1.15, power: 1.15, reach: 1.25, defense: 0.9 },
    flight: false, entrance: 'walk', selectFx: 'slash',
    special: { kind: 'dashstrike', name: 'Iaido Flash', dmg: 78, color: '#ff8d8d', sfx: 'slash' },
    sup: { kind: 'rush', name: 'IAIDO: HEAVEN SPLITTER', dmg: 240, hits: 3, color: '#ffadad', sfx: 'slash',
      quote: 'One draw. One cut. One thousand years of practice.' },
    visual: {
      skin: '#d9ad85', build: 0.45, heightScale: 1.0,
      mask: 'oni', eyes: { glow: '#ff8d8d' }, gloves: true,
      suit: { torso: '#5c1f1f', arms: '#6b2525', legs: '#2a2a33', boots: '#1c1c24', gloves: '#3a3f4a', belt: '#d9c98c', metal: '#3a3f4a' },
      emblem: { type: 'none' },
      cape: null, pauldrons: '#6b2525',
      weapon: { len: 50, w: 3.2, color: '#e8ecf4', glow: '#ffb3b3', guard: '#d9c98c' },
    },
    intro: ['Draw your weapon. I have already drawn mine.', 'The Arkonians upgraded my body. The soul was already sharp.'],
    win: ['The blade decides. It chose me.', 'Sheathe. Bow. Leave.'],
    vs: { lucio: 'Two thousand years, Roman? I respect that.', outsider: 'Your code cannot parry steel.' },
  },

  dreamman: {
    id: 'dreamman', name: 'DREAM MAN', alias: 'The Great Corrector',
    title: 'He Who Culls',
    theme: '#ff9b3d',
    stats: { hp: 1250, speed: 1.05, power: 1.25, reach: 1.15, defense: 1.15 },
    flight: true, entrance: 'teleport', selectFx: 'void', boss: true,
    special: { kind: 'projectile', gfx: 'void', name: 'Entropy Lance', dmg: 72, speed: 700, color: '#c08aff', sfx: 'special' },
    sup: { kind: 'beam', name: 'THE CORRECTION', dmg: 255, color: '#ffae5e', big: true, after: 'reverse', sfx: 'super',
      quote: 'Sixty percent. Starting with you.' },
    visual: {
      skin: '#cfb6a0', build: 0.65, heightScale: 1.07,
      mask: 'helmet', eyes: { glow: '#ffae5e' }, gloves: true, crest: '#6b3fa8',
      suit: { torso: '#3b2a55', arms: '#4a3568', legs: '#2e2144', boots: '#241a36', gloves: '#241a36', belt: '#ff9b3d', metal: '#6e5a96' },
      emblem: { type: 'dm', color: '#ffae5e', glow: true },
      cape: { color: '#2a1d40', len: 70 }, aura: 'rgba(255,160,80,0.4)',
      pauldrons: '#5d4a85',
    },
    intro: ['Humanity is a wound. I am the surgeon.', 'I have seen every dream. Yours are small.'],
    win: ['The Correction proceeds on schedule.', 'You were part of the sixty percent. Inevitable.'],
    vs: { julias: 'The converter made you a battery, child. Nothing more.', kaito: 'I erased you once. I kept the receipt.', conrad: 'My finest tool, dulled by freedom.' },
  },

  // ---------------- SECRET CHARACTERS ----------------
  cosmio: {
    id: 'cosmio', name: 'COSMIOSTASIS JULIAS', alias: 'The Full Power',
    title: 'One Hundred Percent',
    theme: '#ffffff', secret: true,
    stats: { hp: 1100, speed: 1.25, power: 1.35, reach: 1.1, defense: 1.1 },
    flight: true, entrance: 'fly', selectFx: 'lightning',
    special: { kind: 'beam', name: 'Cosmic Lattice', dmg: 80, color: '#ffffff', sfx: 'beam' },
    sup: { kind: 'beam', name: 'COSMIOSTASIS', dmg: 280, color: '#ffffff', big: true, sfx: 'super',
      quote: 'Not one tenth this time. All of it.' },
    visual: {
      skin: '#c79571', build: 0.5, heightScale: 1.0,
      mask: 'cowl', eyes: { glow: '#ffffff' }, gloves: true,
      suit: { torso: '#1a2030', arms: '#202a3e', legs: '#161c2a', boots: '#2e3a52', gloves: '#2a3548', belt: '#cfe6ff' },
      emblem: { type: 'shieldbolt', color: '#ffffff', glow: true },
      cape: { color: '#11141f', len: 64 }, aura: 'rgba(255,255,255,0.55)',
    },
    intro: ['White lines of creation. Try to keep up.', 'This is what the converter REALLY made.'],
    win: ['The cosmos keeps the score.', 'One hundred percent. Zero doubt.'],
    vs: { dreamman: 'You wanted a god, Dream Man? Look up.' },
  },

  dreamfix: {
    id: 'dreamfix', name: 'DREAM MAN (REPAIRED)', alias: 'The Atoning',
    title: 'The Mended Dreamer',
    theme: '#8fd0ff', secret: true,
    stats: { hp: 1150, speed: 1.1, power: 1.15, reach: 1.15, defense: 1.1 },
    flight: true, entrance: 'teleport', selectFx: 'light',
    special: { kind: 'projectile', gfx: 'void', name: 'Lucid Lance', dmg: 70, speed: 720, color: '#9fd8ff', sfx: 'special' },
    sup: { kind: 'sphere', name: 'THE RESTORATION', dmg: 240, color: '#bfe6ff', sfx: 'super',
      quote: 'I culled nothing today. Only your pride.' },
    visual: {
      skin: '#cfb6a0', build: 0.65, heightScale: 1.07,
      mask: 'helmet', eyes: { glow: '#bfe6ff' }, gloves: true, crest: '#5d8fc0',
      suit: { torso: '#2a3a55', arms: '#355068', legs: '#213044', boots: '#1a2536', gloves: '#1a2536', belt: '#8fd0ff', metal: '#7d9ac0' },
      emblem: { type: 'dm', color: '#bfe6ff', glow: true },
      cape: { color: '#1d2c40', len: 70 }, aura: 'rgba(140,200,255,0.4)',
      pauldrons: '#4a6585',
    },
    intro: ['I dreamed of correction. I woke to repair.', 'The armor is mended. So am I. Mostly.'],
    win: ['Growth. Even for gods.', 'I spare you. It still feels new.'],
    vs: { julias: 'You broke me, Knight. Thank you.' },
  },
};

const ROSTER = ['julias','shadow','prisia','tecton','lucio','breeze','conrad','reap',
                'tsunami','kaito','glacier','gungod','outsider','kenzo','dreamman'];
const SECRET_ROSTER = ['cosmio','dreamfix'];

// ---- fighting styles & signature stances ----
// style picks the attack-animation set (see STYLE_TRACKS in fighter.js);
// stance is the character's signature idle pose.
const CHAR_STYLE = {
  julias:   ['allround', 'idle'],          // disciplined all-range champion
  shadow:   ['ninja',    'stance_ninja'],  // low stealth crouch, palm strikes
  prisia:   ['caster',   'stance_caster'], // upright, leading palm of light
  tecton:   ['heavy',    'stance_heavy'],  // wide grappler, overhead smashes
  lucio:    ['blade',    'stance_blade'],  // gladius forward, legion guard
  breeze:   ['flow',     'stance_flow'],   // bouncing speedster, spin kicks
  conrad:   ['boxer',    'stance_boxer'],  // chin tucked, hooks and knees
  reap:     ['toon',     'stance_toon'],   // looming slouch, stretch punches
  tsunami:  ['flow',     'stance_flow'],   // flowing hydro forms
  kaito:    ['flow',     'stance_flow'],   // airy martial arts
  glacier:  ['heavy',    'stance_heavy'],  // immovable bastion
  gungod:   ['heavy',    'stance_gun'],    // braced military frame
  outsider: ['ninja',    'stance_ninja'],  // cyber-shinobi crouch
  kenzo:    ['blade',    'stance_iaido'],  // side-on, hand at the hilt
  dreamman: ['caster',   'stance_regal'],  // hands behind back, untouchable
  cosmio:   ['allround', 'idle'],
  dreamfix: ['caster',   'stance_regal'],
};
for (const [id, [style, stance]] of Object.entries(CHAR_STYLE)) {
  CHARACTERS[id].style = style;
  CHARACTERS[id].stance = stance;
}
// feminine proportions
for (const id of ['prisia', 'tsunami', 'glacier']) CHARACTERS[id].visual.fem = true;

// ---- costume construction: per-character gear & armor pieces ----
// details: chestplate, abs, strap, pouches, kneepads, bracers, skirt
// chest/skirt/bracer/trunks: optional suit colors for those pieces
const CHAR_GEAR = {
  julias:   { details: ['chestplate', 'abs', 'kneepads', 'bracers'], chest: '#212a38', bracer: '#2a3344', trunks: '#0e1116' },
  shadow:   { details: ['strap', 'pouches', 'kneepads', 'bracers'], bracer: '#1e242e', trunks: '#08090d' },
  prisia:   { details: ['chestplate', 'skirt', 'bracers'], chest: '#f7f2e4', skirt: '#efe9da', bracer: '#d9b35c', trunks: '#e6dfcf' },
  tecton:   { details: ['strap', 'kneepads', 'bracers'], bracer: '#5a4630', trunks: '#473827' },
  lucio:    { details: ['chestplate', 'skirt', 'kneepads'], chest: '#b3bfd8', skirt: '#7d1f1f', bracer: '#8a93a6', trunks: '#4a3b28' },
  breeze:   { details: ['chestplate', 'bracers', 'kneepads'], chest: '#2a72a8', bracer: '#e8f2f8', trunks: '#123a58' },
  conrad:   { details: ['abs', 'kneepads', 'bracers'], bracer: '#2c2225', trunks: '#120e10' },
  reap:     { details: [] },
  tsunami:  { details: ['chestplate', 'bracers', 'kneepads'], chest: '#117c70', bracer: '#15837a', trunks: '#083833' },
  kaito:    { details: ['chestplate', 'kneepads', 'bracers'], chest: '#f4f6fa', bracer: '#9aa3b1', trunks: '#aeb6c2' },
  glacier:  { details: ['chestplate', 'skirt', 'bracers', 'kneepads'], chest: '#9fd2ea', skirt: '#cfeeff', bracer: '#cfeeff', trunks: '#4d8aa8' },
  gungod:   { details: ['chestplate', 'pouches', 'kneepads', 'bracers', 'strap'], chest: '#4d5668', bracer: '#262b35', trunks: '#262c38' },
  outsider: { details: ['strap', 'bracers', 'kneepads', 'pouches'], bracer: '#1c2b21', trunks: '#0a0f0c' },
  kenzo:    { details: ['chestplate', 'skirt', 'bracers'], chest: '#702a2a', skirt: '#2a2a33', bracer: '#3a3f4a', trunks: '#1f1f28' },
  dreamman: { details: ['chestplate', 'abs', 'kneepads', 'bracers'], chest: '#4a3568', bracer: '#241a36', trunks: '#241a36' },
  cosmio:   { details: ['chestplate', 'abs', 'kneepads', 'bracers'], chest: '#28344a', bracer: '#2e3a52', trunks: '#10141f' },
  dreamfix: { details: ['chestplate', 'abs', 'kneepads', 'bracers'], chest: '#355068', bracer: '#1a2536', trunks: '#16202e' },
};
for (const [id, gear] of Object.entries(CHAR_GEAR)) {
  const v = CHARACTERS[id].visual;
  v.details = gear.details;
  if (gear.chest) v.suit.chest = gear.chest;
  if (gear.skirt) v.suit.skirt = gear.skirt;
  if (gear.bracer) v.suit.bracer = gear.bracer;
  if (gear.trunks) v.suit.trunks = gear.trunks;
}

// fighting-style display names (shown on the fight HUD, MK-style)
const STYLE_NAMES = {
  julias: 'HYPER-FLOW', shadow: 'GHOST ARTS', prisia: 'LUMINANT ARTS',
  tecton: 'GAIA BREAKER', lucio: 'LEGION FORM', breeze: 'TEMPEST RUSH',
  conrad: 'UNBOUND BOXING', reap: 'DREAM LOGIC', tsunami: 'TIDAL FORM',
  kaito: 'VACUUM STYLE', glacier: 'GLACIAL BASTION', gungod: 'ORDNANCE CQC',
  outsider: 'CYBER NINJUTSU', kenzo: 'IAIDO', dreamman: 'THE CORRECTION',
  cosmio: 'COSMIOSTASIS', dreamfix: 'LUCID FORM',
};
for (const [id, name] of Object.entries(STYLE_NAMES)) CHARACTERS[id].styleName = name;

function rosterIds() {
  const unlocked = localStorage.getItem('skcr_unlocked') === '1';
  return unlocked ? ROSTER.concat(SECRET_ROSTER) : ROSTER.slice();
}
function unlockSecrets() { localStorage.setItem('skcr_unlocked', '1'); }
function secretsUnlocked() { return localStorage.getItem('skcr_unlocked') === '1'; }
