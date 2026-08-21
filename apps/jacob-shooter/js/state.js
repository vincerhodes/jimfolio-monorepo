// Single mutable game-state object + shared constants + pure helpers.
// Modules import G and mutate it directly — one handle for the smoke test too.
import { W, H } from './dom.js';
import { LEVELS, DIFFICULTIES } from '../data.js';

// ---------- state ----------
export const G = {
  running: false, won: false, lost: false,
  player: null, chosen: null, levelIndex: 0,
  bullets: [], enemies: [], enemyBullets: [], particles: [], flashes: [], powerups: [],
  killsTotal: 0, waveIndex: -1, waveQueue: [],
  boss: null, shake: 0, vignette: 0, lastTime: 0, bulletSeq: 0, gameClock: 0,
  mode: 'game', shootout: null, bossDropCd: 0,
  startLevel: 0, lastShout: -999, // lastShout: gameClock of last shooting shout
  runBoosts: { spd: 1, dmg: 0, rof: 1, maxHp: 0 }, // shootout-win picks, persist for the run
  difficulty: DIFFICULTIES.firstteam,
  keys: {},
  mouse: { x: W / 2, y: H / 2, down: false, t: -999 }, // t = gameClock of last mouse activity
  joy: { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 },
  touchShoot: false, shootTouchId: null,
  best: { kills: 0, wins: 0, levelReached: 0 },
};

// ---------- high score (persisted bits of state) ----------
try {
  const raw = localStorage.getItem('jacobShooterBest');
  if (raw) G.best = JSON.parse(raw);
} catch (e) { /* no storage */ }
G.best.levelReached = Math.min(LEVELS.length - 1, G.best.levelReached || 0); // migrate old saves

// ---------- constants ----------
export const SKIN_TONES = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];

export const POWERUP_TYPES = {
  health: { glyph: '❤', color: '#ff4d6d', label: 'HEART' },
  rapid:  { glyph: '⚡', color: '#ffe94a', label: 'RAPID' },
  spread: { glyph: '✸', color: '#4ae3ff', label: 'SPREAD' },
  shield: { glyph: '🛡', color: '#6a9bff', label: 'SHIELD' },
  star:   { glyph: '★', color: '#ffd24a', label: 'SPECIAL' },
  bomb:   { glyph: '💣', color: '#ff7847', label: 'BOMB' },
  homing: { glyph: '🎯', color: '#f368e0', label: 'HOMING' },
  fire:   { glyph: '🔥', color: '#ff6b35', label: 'FIRE' },
  boots:  { glyph: '👟', color: '#a3e635', label: 'SPEED' },
  gold:   { glyph: '💛', color: '#ffd700', label: 'MAX ❤' },
};
export const DROP_CHANCE = 0.22;
export const EFFECT_DUR = { rapid: 8, spread: 8, shield: 5, homing: 8, fire: 8, boots: 8 };

export const JOY_R = 50;

// shootout geometry (H is fixed at 600)
export const SO_GOAL_HALF = 160;  // goal half-width
export const SO_GOAL_Y = 76;      // goal line
export const SO_KEEPER_Y = 94;
export const SO_SPOT_Y = H - 110; // penalty spot
export const SO_ZONE_DX = 105;    // keeper/dive zone offset from center
export const SO_SAVEAIM_DUR = 1.8; // AI aim: ~0.9s oscillate + ~0.9s settled on its zone

// ---------- helpers ----------
export function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

export function skinFor(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SKIN_TONES[h % SKIN_TONES.length];
}

// ❤❤❤½ style health readout (shots cost half a heart).
export function heartsText(hp) {
  const full = Math.floor(Math.max(0, hp));
  return '❤'.repeat(full) + (hp - full >= 0.5 ? '½' : '');
}

// Particle burst — shared by game + shootout, lives here with the state it mutates.
export function burst(x, y, color, n, power = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (60 + Math.random() * 180) * power;
    G.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.35 + Math.random() * 0.35, color, size: 2 + Math.random() * 3 });
  }
}
