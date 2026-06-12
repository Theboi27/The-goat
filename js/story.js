// ============================================================
// STORY MODE — "THE COST OF JUSTICE"
// Sequence of cinematic text scenes and fights across 3 acts.
// ============================================================
const STORY = [
  { type: 'title', text: 'ACT I\nTHE URBAN GHOST' },
  { type: 'scene', bg: 'rooftop', lines: [
    'Rain hammers the Syndicate-controlled city.',
    'On a rooftop above the neon, a figure watches: no powers,',
    'no backup — only a featureless black mask and a plan.',
    'They call him THE SHADOW. The Syndicate calls him a problem.' ] },
  { type: 'fight', p1: 'shadow', p2: 'outsider', stage: 'rooftop', tag: 'SYNDICATE ENFORCER',
    pre: ['The alleys are mine. Walk away.', 'The Syndicate pays me to delete ghosts.'] },
  { type: 'scene', bg: 'rooftop', lines: [
    'The enforcer falls. But the Syndicate sends its finest:',
    'a walking arsenal of drones, energy rifles and a',
    'shoulder-mounted railgun. The mercenary they call GUNGOD.' ] },
  { type: 'fight', p1: 'shadow', p2: 'gungod', stage: 'prison', tag: 'BOSS',
    pre: ['You\'re the bounty of the year, little ghost.', 'Then come collect.'] },
  { type: 'scene', bg: 'omega', lines: [
    'Site Omega. The Shadow infiltrates too deep.',
    'Captured, he is thrown into the ELECTRIC COSMIC CONVERTER.',
    'The screen turns white. The explosion frees Conrad from',
    'his control helmet — and forges something new:',
    'STATIC KNIGHT.' ], flash: true },
  { type: 'fight', p1: 'julias', p2: 'conrad', stage: 'omega', tag: 'THE FREED WEAPON',
    pre: ['Conrad! Stand down — you\'re free now!', 'Free? Then why am I still ANGRY?'] },

  { type: 'title', text: 'ACT II\nTHE GREAT CORRECTION' },
  { type: 'scene', bg: 'tokyo', lines: [
    'A broadcast cuts through every screen on Earth.',
    '"Humanity is a wound. I will cull sixty percent."',
    'DREAM MAN. The Great Correction begins.',
    'In Tokyo, the hero KAITO rises to meet him alone.' ] },
  { type: 'fight', p1: 'kaito', p2: 'dreamman', stage: 'tokyo', tag: 'A DOOMED STAND', doomed: true,
    pre: ['Tokyo still stands while I do!', 'Then Tokyo falls today, child.'] },
  { type: 'scene', bg: 'tokyo', lines: [
    'Kaito fights beyond every limit...',
    'and Dream Man unmakes him with a thought.',
    'Erased from existence. Tokyo burns in silence.',
    'In Mumbai, the bay boils with acid. TSUNAMI drags',
    'her teammates from the water and chases the Dream Echo',
    'responsible across the ruins of Westminster.' ] },
  { type: 'fight', p1: 'tsunami', p2: 'dreamfix', stage: 'westminster', tag: 'DREAM ECHO',
    rename: 'DREAM ECHO',
    pre: ['Thirty teammates in that water. MOVE.', 'The Correction does not negotiate.'] },
  { type: 'scene', bg: 'omega', lines: [
    'Priya saves who she can. The acid takes the rest —',
    'and half her face. She does not stop fighting.',
    'In Nevada, TECTON plants himself before Site Omega.',
    'The earth itself answers his rage. ADRENALINE MODE.' ] },
  { type: 'fight', p1: 'tecton', p2: 'gungod', stage: 'omega', tag: 'DEFEND SITE OMEGA',
    pre: ['This facility is under MY feet. Leave.', 'Contract says otherwise, big man.'] },

  { type: 'title', text: 'ACT III\nTHE DREAM WORLD' },
  { type: 'scene', bg: 'cathedral', lines: [
    'Julias, Prisia, Tecton, Priya and Lucio step',
    'through the Dream Portal. Reality bends.',
    'Here, grief takes shape. Nightmare Reflections',
    'wear the faces of the fallen.' ] },
  { type: 'fight', p1: 'prisia', p2: 'reap', stage: 'cathedral', tag: 'THE REAP WALKER',
    pre: ['I do not fear you, shadow.', 'YOU SHOULD. EVERYONE DOES. THAT IS THE PROBLEM.'] },
  { type: 'scene', bg: 'cathedral', lines: [
    'The Reap Walker freezes mid-strike. In Prisia\'s light',
    'it recognizes something familiar: the same fear,',
    'the same grief. The nightmare laughs — an honest laugh —',
    'and turns to fight BESIDE them.' ] },
  { type: 'fight', p1: 'julias', p2: 'julias', stage: 'cathedral', tag: 'NIGHTMARE REFLECTION',
    rename: 'NIGHTMARE JULIAS', mirror: true,
    pre: ['You\'re... me.', 'I\'m the part of you that watched everyone die.'] },
  { type: 'scene', bg: 'throne', lines: [
    'The Throne of Glass. The center of the Dream World.',
    'Dream Man waits, armor glowing with orange imbues,',
    'Dreaminite shifting purple across his shoulders.',
    '"You brought hope here. I will correct that."' ] },
  { type: 'fight', p1: 'julias', p2: 'dreamman', stage: 'throne', tag: 'PHASE 1 — THE SURGEON', phase: 1,
    pre: ['Your "correction" ends here, Dream Man!', 'Methodical. Painless. Begin.'] },
  { type: 'fight', p1: 'julias', p2: 'dreamman', stage: 'throne', tag: 'PHASE 2 — THE GOD WAKES', phase: 2,
    pre: ['Your armor is cracking!', 'It was never the armor you should fear.'] },
  { type: 'fight', p1: 'julias', p2: 'dreamman', stage: 'throne', tag: 'PHASE 3 — THE VOID', phase: 3,
    pre: ['No more armor. No more games.', 'I am pure thought, child. Strike a THOUGHT.'] },
  { type: 'scene', bg: 'throne', lines: [
    'The Throne of Glass shatters like a held breath.',
    'Dream Man — beaten — looks at his broken hands and,',
    'for the first time in eons, dreams of repairing',
    'instead of correcting.',
    ' ',
    'The cost of justice was paid in full.',
    ' ',
    'SECRET CHARACTERS UNLOCKED:',
    'COSMIOSTASIS JULIAS — DREAM MAN (REPAIRED)',
    'SECRET STAGE UNLOCKED: CYBER CITY ROOFTOP' ], end: true },
];
