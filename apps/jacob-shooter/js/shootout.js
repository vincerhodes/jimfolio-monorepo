// ---------- penalty shootout v2 (between levels) ----------
// 5 rounds; each round = player shoots (aim/strike) THEN the AI shoots and the
// player keeps goal (3 zones: left/center/right). Save iff keeper zone === shot zone.
// goals > conceded → WIN (stat-boost pick), equal → DRAW, else LOSS. All advance.
import { W, bossbar, specialbar, specialbtn, shootoutbar, boostbar, hud } from './dom.js';
import { sfx } from './sfx.js';
import { G, SO_GOAL_HALF, SO_GOAL_Y, SO_KEEPER_Y, SO_SPOT_Y, SO_ZONE_DX, SO_SAVEAIM_DUR, burst } from './state.js';
import { KITS } from '../data.js';
// Circular import (game.js imports startShootout from here) — runtime calls only,
// never at module top level.
import { startGame, showBanner } from './game.js';

export function startShootout(keeperKit) {
  G.mode = 'shootout';
  G.bullets = []; G.enemies = []; G.enemyBullets = []; G.powerups = [];
  G.shootout = {
    kick: 1, goals: 0, conceded: 0, phase: 'aim', phaseT: 0, aimT: 0,
    aimX: W / 2, keeperX: W / 2, keeperDive: W / 2,
    keeperZone: 0, shotZone: 0, boostPick: false,
    keeperKit: keeperKit || KITS.arsenal,
    ballX: W / 2, ballY: SO_SPOT_Y, fromX: W / 2, fromY: SO_SPOT_Y, targetAimX: W / 2,
    result: '', resultGoal: false,
  };
  bossbar.classList.add('hidden');
  specialbar.classList.add('hidden');
  specialbtn.classList.add('hidden');
  boostbar.classList.add('hidden');
  shootoutbar.classList.remove('hidden');
  showBanner('PENALTY SHOOTOUT — BEST OF 5!');
  sfx.wave();
}

export function shootoutStrike() {
  const s = G.shootout;
  if (G.mode !== 'shootout' || !s || s.phase !== 'aim') return;
  s.phase = 'flight'; s.phaseT = 0;
  s.fromX = s.ballX; s.fromY = s.ballY; s.targetAimX = s.aimX;
  s.keeperDive = W / 2 + (Math.floor(Math.random() * 3) - 1) * SO_ZONE_DX; // pre-committed dive
  sfx.shoot();
}

export function skipShootout() {
  if (G.mode !== 'shootout') return;
  boostbar.classList.add('hidden');
  startGame(G.chosen, G.levelIndex + 1);
}

// WIN reward: one persistent stat boost, then the next level starts.
export function pickBoost(kind) {
  const s = G.shootout;
  if (G.mode !== 'shootout' || !s || !s.boostPick) return;
  if (kind === 'spd') G.runBoosts.spd *= 1.2;
  else if (kind === 'dmg') G.runBoosts.dmg += 1;
  else if (kind === 'rof') G.runBoosts.rof *= 1.25;
  else if (kind === 'maxHp') G.runBoosts.maxHp += 1;
  boostbar.classList.add('hidden');
  startGame(G.chosen, G.levelIndex + 1);
}

export function finishShootout() {
  const s = G.shootout;
  s.phase = 'done'; s.phaseT = 0;
  if (s.goals > s.conceded) {
    s.result = `SHOOTOUT WON ${s.goals}:${s.conceded} — PICK A BOOST!`;
    s.resultGoal = true;
    s.boostPick = true; // hold here until a boost button is picked
    sfx.win();
    boostbar.classList.remove('hidden');
  } else if (s.goals === s.conceded) {
    s.result = `SHOOTOUT DRAW ${s.goals}:${s.conceded}`;
    s.resultGoal = true;
    sfx.wave();
  } else {
    s.result = `SHOOTOUT LOST ${s.goals}:${s.conceded}`;
    s.resultGoal = false;
    sfx.lose();
  }
  showBanner(s.result);
}

// AI steps up: pre-commits a zone, marker settles onto it before the shot.
function startSavePhase(s) {
  s.phase = 'saveaim'; s.phaseT = 0; s.aimT = 0;
  s.shotZone = Math.floor(Math.random() * 3) - 1;
  s.keeperZone = 0;
  s.aimX = W / 2; s.keeperX = W / 2;
  s.ballX = W / 2; s.ballY = SO_SPOT_Y;
  s.result = '';
}

export function updateShootout(dt) {
  G.gameClock += dt;
  G.shake = Math.max(0, G.shake - 30 * dt);
  G.vignette = Math.max(0, G.vignette - 1.2 * dt);
  const s = G.shootout;
  if (!s) return;

  if (s.phase === 'aim') {
    s.aimT += dt;
    // target marker ping-pongs along the goal line, ~1 full sweep per 1.5s
    s.aimX = W / 2 + Math.sin(s.aimT * (Math.PI * 2 / 1.5)) * (SO_GOAL_HALF - 25);
    s.keeperX = W / 2 + Math.sin(s.aimT * 2.3) * 30; // idle shuffle on the line
  } else if (s.phase === 'flight') {
    s.phaseT += dt;
    const t = Math.min(1, s.phaseT / 0.4);
    s.ballX = s.fromX + (s.targetAimX - s.fromX) * t;
    s.ballY = s.fromY + (SO_GOAL_Y + 6 - s.fromY) * t;
    s.keeperX += (s.keeperDive - s.keeperX) * Math.min(1, dt * 12);
    if (t >= 1) {
      // keeper covers roughly a third of the goal per dive
      const goal = Math.abs(s.targetAimX - s.keeperDive) > 70;
      s.phase = 'result'; s.phaseT = 0;
      s.resultGoal = goal;
      if (goal) {
        s.goals++;
        s.result = 'GOAL!';
        burst(s.targetAimX, SO_GOAL_Y + 6, '#ffd700', 26, 1.5);
        sfx.pickup();
      } else {
        s.result = 'SAVED!';
        burst(s.keeperX, SO_KEEPER_Y, '#9fd0ff', 20, 1.2);
        sfx.hit();
      }
    }
  } else if (s.phase === 'result') {
    s.phaseT += dt;
    if (s.phaseT >= 1) startSavePhase(s); // AI steps up
  } else if (s.phase === 'saveaim') {
    s.phaseT += dt; s.aimT += dt;
    if (s.phaseT < SO_SAVEAIM_DUR - 0.9) {
      // marker oscillates...
      s.aimX = W / 2 + Math.sin(s.aimT * (Math.PI * 2 / 1.5)) * (SO_GOAL_HALF - 25);
    } else {
      // ...then settles onto the committed zone so the keeper can react
      const zx = W / 2 + s.shotZone * SO_ZONE_DX;
      s.aimX += (zx - s.aimX) * Math.min(1, dt * 8);
    }
    // player keeper slides toward the chosen zone
    s.keeperX += (W / 2 + s.keeperZone * SO_ZONE_DX - s.keeperX) * Math.min(1, dt * 12);
    if (s.phaseT >= SO_SAVEAIM_DUR) {
      s.phase = 'saveflight'; s.phaseT = 0;
      s.fromX = s.ballX; s.fromY = s.ballY;
      s.targetAimX = W / 2 + s.shotZone * SO_ZONE_DX;
      sfx.shoot();
    }
  } else if (s.phase === 'saveflight') {
    s.phaseT += dt;
    const t = Math.min(1, s.phaseT / 0.4);
    s.ballX = s.fromX + (s.targetAimX - s.fromX) * t;
    s.ballY = s.fromY + (SO_GOAL_Y + 6 - s.fromY) * t;
    s.keeperX += (W / 2 + s.keeperZone * SO_ZONE_DX - s.keeperX) * Math.min(1, dt * 12);
    if (t >= 1) {
      const saved = s.keeperZone === s.shotZone;
      s.phase = 'saveresult'; s.phaseT = 0;
      s.resultGoal = saved;
      if (saved) {
        s.result = 'SAVED!';
        burst(s.keeperX, SO_KEEPER_Y, '#9fd0ff', 20, 1.2);
        sfx.pickup();
      } else {
        s.conceded++;
        s.result = 'CONCEDED';
        burst(s.targetAimX, SO_GOAL_Y + 6, '#ff5b5b', 26, 1.5);
        sfx.hit();
      }
    }
  } else if (s.phase === 'saveresult') {
    s.phaseT += dt;
    if (s.phaseT >= 1) {
      if (s.kick >= 5) finishShootout();
      else {
        s.kick++;
        s.phase = 'aim'; s.phaseT = 0; s.aimT = 0;
        s.aimX = W / 2; s.keeperX = W / 2; s.keeperDive = W / 2;
        s.ballX = W / 2; s.ballY = SO_SPOT_Y;
        s.result = '';
      }
    }
  } else if (s.phase === 'done') {
    s.phaseT += dt;
    // boostPick waits for the DOM pick; draw/loss auto-advance after a beat
    if (!s.boostPick && s.phaseT >= 1.5) startGame(G.chosen, G.levelIndex + 1);
  }

  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);
  for (const f of G.flashes) f.life -= dt;
  G.flashes = G.flashes.filter(f => f.life > 0);

  hud.textContent = `PENALTY SHOOTOUT — Round ${Math.min(s.kick, 5)}/5 — ⚽ ${s.goals} : ${s.conceded}`;
}

// boost buttons (guarded for headless stubs)
if (boostbar && typeof boostbar.querySelectorAll === 'function') {
  boostbar.querySelectorAll('[data-boost]').forEach(btn => {
    btn.addEventListener('click', () => pickBoost(btn.dataset.boost));
  });
}
