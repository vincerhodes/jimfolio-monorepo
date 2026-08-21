// Roster + kit data for JACOB SHOOTER v2

export const KITS = {
  arsenal:    { name: 'Arsenal',     shirt: '#ef0107', trim: '#ffffff' },
  spurs:      { name: 'Spurs',       shirt: '#f5f5f5', trim: '#001c58' },
  chelsea:    { name: 'Chelsea',     shirt: '#034694', trim: '#ffffff' },
  liverpool:  { name: 'Liverpool',   shirt: '#c8102e', trim: '#f6eb61' },
  manutd:     { name: 'Man Utd',     shirt: '#da291c', trim: '#fbe122' },
  mancity:    { name: 'Man City',    shirt: '#6cabdd', trim: '#1c2c5b' },
  realmadrid: { name: 'Real Madrid', shirt: '#ffffff', trim: '#c9a227' },
  barcelona:  { name: 'Barcelona',   shirt: '#a50044', trim: '#004d98' },
  bayern:     { name: 'Bayern',      shirt: '#dc052d', trim: '#ffffff' },
  france:     { name: 'France',      shirt: '#0055A4', trim: '#ffffff' },
  germany:    { name: 'Germany',     shirt: '#ffffff', trim: '#000000' },
  spain:      { name: 'Spain',       shirt: '#C60B1E', trim: '#FFC400' },
  italy:      { name: 'Italy',       shirt: '#0064AA', trim: '#ffffff' },
  brazil:     { name: 'Brazil',      shirt: '#FFDF00', trim: '#009C3B' },
  argentina:  { name: 'Argentina',   shirt: '#75AADB', trim: '#ffffff' },
  portugal:   { name: 'Portugal',    shirt: '#E42518', trim: '#046A38' },
  netherlands:{ name: 'Netherlands', shirt: '#FF6600', trim: '#ffffff' },
};

// Pickable Arsenal 2026 XI.
// stats: spd (move), rof (shots/sec), hp, dmg (per bullet), bspeed (bullet velocity)
export const ARSENAL_XI = [
  { name: 'Saka',      pos: 'RW',  spd: 235, rof: 6.5, hp: 5, dmg: 1, bspeed: 540, blurb: 'Starboy. Balanced and deadly.' },
  { name: 'Ødegaard',  pos: 'CAM', spd: 215, rof: 8.5, hp: 4, dmg: 1, bspeed: 560, blurb: 'Captain. Rapid fire maestro.' },
  { name: 'Gyökeres',  pos: 'ST',  spd: 205, rof: 4.0, hp: 6, dmg: 2, bspeed: 600, blurb: 'Heavy artillery. Every shot hurts.' },
  { name: 'Martinelli',pos: 'LW',  spd: 270, rof: 5.5, hp: 4, dmg: 1, bspeed: 540, blurb: 'Fastest legs in North London.' },
  { name: 'Rice',      pos: 'DM',  spd: 195, rof: 5.0, hp: 8, dmg: 1, bspeed: 520, blurb: 'A tank with a cannon.' },
  { name: 'Saliba',    pos: 'CB',  spd: 180, rof: 4.0, hp: 10, dmg: 1, bspeed: 500, blurb: 'Rolls Royce defence. Huge HP.' },
  { name: 'Havertz',   pos: 'CF',  spd: 210, rof: 6.0, hp: 6, dmg: 1, bspeed: 530, blurb: 'Big-game energy.' },
  { name: 'Zubimendi', pos: 'CM',  spd: 220, rof: 7.0, hp: 5, dmg: 1, bspeed: 550, blurb: 'Metronome with a trigger.' },
  { name: 'Timber',    pos: 'RB',  spd: 245, rof: 6.0, hp: 5, dmg: 1, bspeed: 540, blurb: 'Quick feet, quicker shots.' },
  { name: 'Gabriel',   pos: 'CB',  spd: 185, rof: 4.5, hp: 9, dmg: 2, bspeed: 510, blurb: 'Hits like a set-piece header.' },
  { name: 'Raya',      pos: 'GK',  spd: 200, rof: 7.5, hp: 5, dmg: 1, bspeed: 580, blurb: 'Sweeper-keeper, sweeper-shooter.' },
];

// Enemy waves. Each: team kit + pool of players.
// role: 'runner' (fast, fragile), 'bruiser' (slow, tanky), anything else = standard.
export const WAVES = [
  { team: 'spurs', pool: [
    { name: 'Son',        role: 'runner' },
    { name: 'Maddison' },
    { name: 'Kulusevski' },
    { name: 'Solanke' },
    { name: 'Porro',      role: 'runner' },
    { name: 'Romero',     role: 'bruiser' },
  ]},
  { team: 'chelsea', pool: [
    { name: 'Palmer' },
    { name: 'Jackson',    role: 'runner' },
    { name: 'Neto',       role: 'runner' },
    { name: 'Enzo' },
    { name: 'Caicedo',    role: 'bruiser' },
    { name: 'Cucurella' },
  ]},
  { team: 'liverpool', pool: [
    { name: 'Salah',      role: 'runner' },
    { name: 'Gakpo',      role: 'runner' },
    { name: 'Mac Allister' },
    { name: 'Szoboszlai' },
    { name: 'Van Dijk',   role: 'bruiser' },
    { name: 'Konaté',     role: 'bruiser' },
  ]},
  { team: 'manutd', pool: [
    { name: 'Bruno' },
    { name: 'Amad',       role: 'runner' },
    { name: 'Mainoo' },
    { name: 'Højlund',    role: 'bruiser' },
    { name: 'Martínez',   role: 'bruiser' },
    { name: 'Dalot',      role: 'runner' },
  ]},
  { team: 'mancity', pool: [
    { name: 'Foden' },
    { name: 'Doku',       role: 'runner' },
    { name: 'Grealish' },
    { name: 'Rodri',      role: 'bruiser' },
    { name: 'Dias',       role: 'bruiser' },
    { name: 'Bernardo',   role: 'runner' },
  ]},
];

// Per-role enemy tuning.
export const ENEMY_ROLES = {
  standard: { hp: 2, speed: 95,  r: 14 },
  runner:   { hp: 1, speed: 150, r: 13 },
  bruiser:  { hp: 4, speed: 62,  r: 17 },
};

// Position-based special abilities. Activated with E, cooldown shown bottom-left.
export const SPECIALS = {
  ST:  { kind: 'cannon',    name: 'Cannon Volley', cd: 12, desc: 'Huge piercing shot, 5 dmg' },
  CF:  { kind: 'cannon',    name: 'Cannon Volley', cd: 12, desc: 'Huge piercing shot, 5 dmg' },
  RW:  { kind: 'turbo',     name: 'Turbo Sprint',  cd: 10, desc: '+60% speed for 3s' },
  LW:  { kind: 'turbo',     name: 'Turbo Sprint',  cd: 10, desc: '+60% speed for 3s' },
  CAM: { kind: 'slowmo',    name: 'Maestro',       cd: 15, desc: 'Slows rivals to 40% for 3s' },
  CM:  { kind: 'shockwave', name: 'Slide Tackle',  cd: 12, desc: 'Shockwave: knockback + 2 dmg' },
  DM:  { kind: 'shockwave', name: 'Slide Tackle',  cd: 12, desc: 'Shockwave: knockback + 2 dmg' },
  CB:  { kind: 'wall',      name: 'The Wall',      cd: 14, desc: 'Shield 4s + knockback' },
  GK:  { kind: 'save',      name: 'Penalty Save',  cd: 12, desc: 'Clears incoming shots + 2s invuln' },
};
export function specialFor(pos) { return SPECIALS[pos] || SPECIALS.CM; }

// Difficulty presets. enemyFire multiplies enemy fire cooldown (lower = shoots faster).
export const DIFFICULTIES = {
  academy:     { name: 'Academy',     desc: 'Chill mode',
                 enemySpeed: 0.8,  enemyFire: 1.6,  enemyHp: 1,   dmgTaken: 0.5, bossHp: 0.75 },
  firstteam:   { name: 'First Team',  desc: 'Standard game',
                 enemySpeed: 1.0,  enemyFire: 1.0,  enemyHp: 1,   dmgTaken: 1.0, bossHp: 1.0 },
  invincibles: { name: 'Invincibles', desc: 'Proper hard. 03/04 energy.',
                 enemySpeed: 1.25, enemyFire: 0.65, enemyHp: 1.5, dmgTaken: 1.0, bossHp: 1.4 },
};

// Bosses. volley = shots per volley (normal/enraged), chargeCd = seconds between charges.
export const HAALAND = {
  name: 'Haaland', team: 'mancity', r: 36, hp: 220, speed: 100,
  volley: 3, enrageVolley: 5, chargeCd: 4.5, enrageChargeCd: 3, bulletSpeed: 270,
  skin: '#ffdbac',
};
export const MBAPPE = {
  name: 'Mbappé', team: 'realmadrid', r: 44, hp: 280, speed: 125,
  volley: 4, enrageVolley: 6, chargeCd: 3.0, enrageChargeCd: 2.0, bulletSpeed: 330,
  skin: '#c68642',
};
export const YAMAL = {
  name: 'Lamine Yamal', team: 'spain', r: 34, hp: 300, speed: 150,
  volley: 5, enrageVolley: 7, chargeCd: 2.5, enrageChargeCd: 1.8, bulletSpeed: 300,
  skin: '#8d5524',
};
export const MESSI = {
  name: 'Messi', team: 'argentina', r: 32, hp: 340, speed: 160,
  volley: 5, enrageVolley: 7, chargeCd: 2.2, enrageChargeCd: 1.5, bulletSpeed: 360,
  skin: '#f1c27d',
};

// Level 2: Champions League.
export const CL_WAVES = [
  { team: 'barcelona', pool: [
    { name: 'Lamine Yamal', role: 'runner' },
    { name: 'Raphinha',     role: 'runner' },
    { name: 'Pedri' },
    { name: 'Lewandowski' },
    { name: 'Koundé',       role: 'bruiser' },
    { name: 'Araújo',       role: 'bruiser' },
  ]},
  { team: 'bayern', pool: [
    { name: 'Musiala' },
    { name: 'Sané',        role: 'runner' },
    { name: 'Davies',      role: 'runner' },
    { name: 'Kimmich' },
    { name: 'Kane',        role: 'bruiser' },
    { name: 'Upamecano',   role: 'bruiser' },
  ]},
  { team: 'realmadrid', pool: [
    { name: 'Bellingham' },
    { name: 'Vini Jr',     role: 'runner' },
    { name: 'Rodrygo',     role: 'runner' },
    { name: 'Valverde' },
    { name: 'Rüdiger',     role: 'bruiser' },
    { name: 'Courtois',    role: 'bruiser' },
  ]},
];

// Level 3: Euros (national teams).
export const EUROS_WAVES = [
  { team: 'france', pool: [
    { name: 'Dembélé',    role: 'runner' },
    { name: 'Olise' },
    { name: 'Doué',       role: 'runner' },
    { name: 'Kolo Muani' },
    { name: 'Camavinga' },
    { name: 'Mendy',      role: 'bruiser' },
  ]},
  { team: 'germany', pool: [
    { name: 'Wirtz' },
    { name: 'Gnabry',     role: 'runner' },
    { name: 'Woltemade' },
    { name: 'Pavlovic' },
    { name: 'Füllkrug',   role: 'bruiser' },
    { name: 'Tah',        role: 'bruiser' },
  ]},
  { team: 'spain', pool: [
    { name: 'Nico Williams', role: 'runner' },
    { name: 'Olmo' },
    { name: 'Merino' },
    { name: 'Oyarzabal' },
    { name: 'Cubarsí',    role: 'bruiser' },
    { name: 'Le Normand', role: 'bruiser' },
  ]},
  { team: 'italy', pool: [
    { name: 'Chiesa',     role: 'runner' },
    { name: 'Barella' },
    { name: 'Tonali' },
    { name: 'Retegui' },
    { name: 'Bastoni',    role: 'bruiser' },
    { name: 'Calafiori',  role: 'bruiser' },
  ]},
];

// Level 4: World Cup.
export const WC_WAVES = [
  { team: 'brazil', pool: [
    { name: 'Estêvão',    role: 'runner' },
    { name: 'Endrick',    role: 'runner' },
    { name: 'Paquetá' },
    { name: 'Bruno Guimarães' },
    { name: 'Casemiro',   role: 'bruiser' },
    { name: 'Marquinhos', role: 'bruiser' },
  ]},
  { team: 'portugal', pool: [
    { name: 'Rafael Leão', role: 'runner' },
    { name: 'Conceição',  role: 'runner' },
    { name: 'Vitinha' },
    { name: 'João Neves' },
    { name: 'Rúben Dias', role: 'bruiser' },
    { name: 'António Silva', role: 'bruiser' },
  ]},
  { team: 'argentina', pool: [
    { name: 'Julián Álvarez', role: 'runner' },
    { name: 'Lautaro' },
    { name: 'De Paul' },
    { name: 'Molina' },
    { name: 'Paredes' },
    { name: 'Otamendi',   role: 'bruiser' },
  ]},
  { team: 'netherlands', pool: [
    { name: 'Xavi Simons', role: 'runner' },
    { name: 'Malen',      role: 'runner' },
    { name: 'Depay' },
    { name: 'Reijnders' },
    { name: 'De Jong' },
    { name: 'Van de Ven', role: 'bruiser' },
  ]},
];

export const LEVELS = [
  { name: 'Premier League', waves: WAVES, boss: HAALAND },
  { name: 'Champions League', waves: CL_WAVES, boss: MBAPPE },
  { name: 'Euros', waves: EUROS_WAVES, boss: YAMAL },
  { name: 'World Cup', waves: WC_WAVES, boss: MESSI },
];
