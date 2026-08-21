// JACOB SHOOTER v8 — modular split of the original game.js. Pure reorganization.
// Game flow, picker, input, specials, power-ups, combat, update loop, boot.
// Controls: WASD/arrows move, SPACE shoot with auto-aim (trackpad mode),
// mouse for manual aim, E special, M mute, R picker, N next level after a win.
import { KITS, ARSENAL_XI, LEVELS, ENEMY_ROLES, DIFFICULTIES, specialFor } from '../data.js';
import { canvas, hud, pickerEl, cardsEl, bestlineEl, endEl, bannerEl, bossbar, bosslabel,
  bossfill, specialbar, sname, sdesc, sfill, skey, shootoutbar, boostbar, skipbtn, levelrow,
  joyEl, joyknob, specialbtn, diffrow, W, H, isTouch } from './dom.js';
import { sfx } from './sfx.js';
import { G, POWERUP_TYPES, DROP_CHANCE, EFFECT_DUR, JOY_R, dist, skinFor, heartsText, burst } from './state.js';
import { draw, drawPortrait } from './draw.js';
import { startShootout, shootoutStrike, skipShootout, updateShootout } from './shootout.js';

export { draw } from './draw.js';

// ---------- high score ----------
export function persistBest() {
  try { localStorage.setItem('jacobShooterBest', JSON.stringify(G.best)); } catch (e) { /* no storage */ }
}

export function saveBest() {
  G.best.kills = Math.max(G.best.kills, G.killsTotal);
  if (G.won) G.best.wins++;
  persistBest();
  updateBestline();
}

// Highest level unlocked in the picker; saved immediately so it survives quitting mid-level.
export function reachLevel(i) {
  const reached = Math.min(LEVELS.length - 1, Math.max(0, i));
  if (reached > G.best.levelReached) { G.best.levelReached = reached; persistBest(); }
}

function updateBestline() {
  bestlineEl.textContent =
    (G.best.kills || G.best.wins)
      ? `Best run: ${G.best.kills} kills • Trophies won: ${G.best.wins}`
      : '';
}

// ---------- input ----------
window.addEventListener('keydown', e => {
  G.keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') e.preventDefault();
  if (e.key.toLowerCase() === 'm') sfx.toggleMute();
  if (G.mode === 'shootout') {
    // shootout mode: SPACE = strike, N = skip, A/D/arrows = keeper zone (save-aim)
    if (e.key === ' ') shootoutStrike();
    if (e.key.toLowerCase() === 'n') skipShootout();
    const s = G.shootout;
    if (s && s.phase === 'saveaim') {
      if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'arrowleft') {
        s.keeperZone = Math.max(-1, s.keeperZone - 1);
      }
      if (e.key.toLowerCase() === 'd' || e.key.toLowerCase() === 'arrowright') {
        s.keeperZone = Math.min(1, s.keeperZone + 1);
      }
    }
    return;
  }
  if (e.key.toLowerCase() === 'e') activateSpecial();
  if ((G.won || G.lost) && e.key.toLowerCase() === 'r') backToPicker();
  if (G.won && e.key.toLowerCase() === 'n' && G.levelIndex + 1 < LEVELS.length) {
    startGame(G.chosen, G.levelIndex + 1);
  }
});
window.addEventListener('keyup', e => G.keys[e.key.toLowerCase()] = false);
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  G.mouse.x = (e.clientX - rect.left) * (W / rect.width);
  G.mouse.y = (e.clientY - rect.top) * (H / rect.height);
  G.mouse.t = G.gameClock;
});
canvas.addEventListener('mousedown', e => {
  G.mouse.down = true; G.mouse.t = G.gameClock;
  if (G.mode === 'shootout') {
    const s = G.shootout;
    if (s && s.phase === 'saveaim') {
      // click left/middle/right third = keeper zone
      const rect = canvas.getBoundingClientRect();
      const fx = (e.clientX - rect.left) / rect.width;
      s.keeperZone = fx < 1 / 3 ? -1 : fx > 2 / 3 ? 1 : 0;
    } else {
      shootoutStrike();
    }
  }
});
window.addEventListener('mouseup', () => G.mouse.down = false);

// ---------- touch controls (phone) ----------
if (isTouch) {
  document.body.classList.add('istouch');

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (G.mode === 'shootout') {
      const s = G.shootout;
      if (s && s.phase === 'saveaim') {
        // tap left/middle/right third = keeper zone
        const fx = e.changedTouches[0].clientX / window.innerWidth;
        s.keeperZone = fx < 1 / 3 ? -1 : fx > 2 / 3 ? 1 : 0;
      } else {
        shootoutStrike(); // tap = strike, no joystick/shoot
      }
      return;
    }
    for (const t of e.changedTouches) {
      if (!G.joy.active && t.clientX < window.innerWidth / 2) {
        // left half: floating joystick
        G.joy.active = true; G.joy.id = t.identifier;
        G.joy.ox = t.clientX; G.joy.oy = t.clientY; G.joy.dx = 0; G.joy.dy = 0;
        joyEl.style.left = t.clientX + 'px';
        joyEl.style.top = t.clientY + 'px';
        joyEl.classList.remove('hidden');
      } else if (G.shootTouchId === null) {
        // right half: hold to shoot (auto-aim handles direction)
        G.shootTouchId = t.identifier;
        G.touchShoot = true;
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (G.joy.active && t.identifier === G.joy.id) {
        let dx = t.clientX - G.joy.ox, dy = t.clientY - G.joy.oy;
        const len = Math.hypot(dx, dy);
        if (len > JOY_R) { dx = dx / len * JOY_R; dy = dy / len * JOY_R; }
        G.joy.dx = dx / JOY_R; G.joy.dy = dy / JOY_R;
        joyknob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      }
    }
  }, { passive: false });

  const touchEnd = e => {
    for (const t of e.changedTouches) {
      if (G.joy.active && t.identifier === G.joy.id) {
        G.joy.active = false; G.joy.id = null; G.joy.dx = 0; G.joy.dy = 0;
        joyEl.classList.add('hidden');
        joyknob.style.transform = 'translate(-50%,-50%)';
      }
      if (t.identifier === G.shootTouchId) { G.shootTouchId = null; G.touchShoot = false; }
    }
  };
  canvas.addEventListener('touchend', touchEnd);
  canvas.addEventListener('touchcancel', touchEnd);

  specialbtn.addEventListener('touchstart', e => { e.preventDefault(); activateSpecial(); }, { passive: false });
  specialbtn.addEventListener('click', () => activateSpecial());
}

// shootout skip button (guarded for headless stubs)
if (skipbtn && typeof skipbtn.addEventListener === 'function') {
  skipbtn.addEventListener('click', () => skipShootout());
}

// ---------- difficulty selection ----------
if (diffrow && typeof diffrow.querySelectorAll === 'function') {
  diffrow.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      G.difficulty = DIFFICULTIES[btn.dataset.diff] || DIFFICULTIES.firstteam;
      diffrow.querySelectorAll('button').forEach(b => b.classList.toggle('sel', b === btn));
    });
  });
}

// ---------- picker ----------
function statBar(label, v, max) {
  return `<div class="stat"><span class="k">${label}</span>` +
    `<span class="bar"><i style="width:${Math.round(v / max * 100)}%"></i></span></div>`;
}

export function buildPicker() {
  G.runBoosts = { spd: 1, dmg: 0, rof: 1, maxHp: 0 }; // picker shown = new run
  if (G.startLevel > G.best.levelReached) G.startLevel = G.best.levelReached;
  buildLevelRow();
  cardsEl.innerHTML = '';
  ARSENAL_XI.forEach(p => {
    const sp = specialFor(p.pos);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      `<canvas width="72" height="72"></canvas>` +
      `<div class="name">${p.name}</div><div class="pos">${p.pos} — Arsenal</div>` +
      `<div class="blurb">${p.blurb}</div>` +
      `<div class="blurb" style="color:#4ae3ff">★ ${sp.name}</div>` +
      statBar('SPD', p.spd, 280) + statBar('ROF', p.rof, 9) +
      statBar('HP', p.hp, 10) + statBar('DMG', p.dmg, 2);
    const c = card.querySelector('canvas').getContext('2d');
    drawPortrait(c, 36, 22, 16, KITS.arsenal, skinFor(p.name));
    card.addEventListener('click', () => startGame(p, G.startLevel));
    cardsEl.appendChild(card);
  });
  updateBestline();
}

// One button per level; levels beyond best.levelReached are locked (🔒, not clickable).
function buildLevelRow() {
  levelrow.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const locked = i > G.best.levelReached;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = (locked ? '🔒 ' : '') + `LEVEL ${i + 1} — ${lvl.name.toUpperCase()}`;
    btn.className = (locked ? 'locked' : '') + (!locked && i === G.startLevel ? ' sel' : '');
    if (!locked) btn.addEventListener('click', () => { G.startLevel = i; buildLevelRow(); });
    levelrow.appendChild(btn);
  });
}

// ---------- game setup ----------
export function currentLevel() { return LEVELS[G.levelIndex]; }

export function startGame(p, level) {
  G.chosen = p;
  G.levelIndex = level || 0;
  reachLevel(G.levelIndex); // starting a level directly also unlocks it
  reset();
  pickerEl.classList.add('hidden');
  endEl.classList.add('hidden');
  specialbar.classList.remove('hidden');
  sname.textContent = '★ ' + G.player.special.name;
  sdesc.textContent = G.player.special.desc;
  if (isTouch) specialbtn.classList.remove('hidden');
  G.running = true;
  nextWave();
}

export function backToPicker() {
  G.won = G.lost = false;
  G.running = false;
  G.boss = null;
  G.mode = 'game'; G.shootout = null;
  bossbar.classList.add('hidden');
  shootoutbar.classList.add('hidden');
  boostbar.classList.add('hidden');
  specialbar.classList.add('hidden');
  specialbtn.classList.add('hidden');
  endEl.classList.add('hidden');
  pickerEl.classList.remove('hidden');
  hud.textContent = '';
  buildPicker();
}

export function reset() {
  G.player = {
    x: W / 2, y: H / 2, r: 15, name: G.chosen.name,
    speed: G.chosen.spd * G.runBoosts.spd, rof: G.chosen.rof * G.runBoosts.rof,
    dmg: G.chosen.dmg + G.runBoosts.dmg, bspeed: G.chosen.bspeed,
    hp: G.chosen.hp + G.runBoosts.maxHp, maxHp: G.chosen.hp + G.runBoosts.maxHp,
    fireCd: 0, invuln: 0, bob: 0, skin: skinFor(G.chosen.name),
    facing: 0, rapidT: 0, spreadT: 0, shieldT: 0,
    special: specialFor(G.chosen.pos), specialCd: 0, turboT: 0, slowmoT: 0,
    homeT: 0, fireT: 0, bootsT: 0,
  };
  G.bullets = []; G.enemies = []; G.enemyBullets = []; G.particles = []; G.flashes = []; G.powerups = [];
  G.killsTotal = 0; G.waveIndex = -1; G.boss = null; G.shake = 0; G.vignette = 0;
  G.won = false; G.lost = false; G.bossDropCd = 0;
  G.mode = 'game'; G.shootout = null;
  bossbar.classList.add('hidden');
  shootoutbar.classList.add('hidden');
  boostbar.classList.add('hidden');
}

export function nextWave() {
  G.waveIndex++;
  const level = currentLevel();
  if (G.waveIndex >= level.waves.length) { scatterHearts(); spawnBoss(); return; }
  const wave = level.waves[G.waveIndex];
  G.waveQueue = wave.pool.map(p => ({ ...p }));
  showBanner(`WAVE ${G.waveIndex + 1} — ${KITS[wave.team].name.toUpperCase()}`);
  sfx.wave();
  sfx.shout();
}

// Pre-boss breather: hearts drop on the pitch to collect before the fight.
export function scatterHearts(n = 3) {
  for (let i = 0; i < n; i++) {
    G.powerups.push({
      x: 120 + Math.random() * (W - 240),
      y: 120 + Math.random() * (H - 240),
      type: 'health', life: 45, bob: Math.random() * 10,
    });
  }
}

export function showBanner(text) {
  bannerEl.textContent = text;
  bannerEl.classList.remove('hidden');
  bannerEl.style.animation = 'none';
  void bannerEl.offsetWidth; // restart CSS animation
  bannerEl.style.animation = '';
}

export function spawnEnemy() {
  const spec = G.waveQueue.shift();
  const role = ENEMY_ROLES[spec.role || 'standard'];
  const kit = KITS[currentLevel().waves[G.waveIndex].team];
  const hp = Math.max(1, Math.round(role.hp * G.difficulty.enemyHp));
  let x, y;
  const side = Math.floor(Math.random() * 4);
  if (side === 0) { x = -30; y = Math.random() * H; }
  else if (side === 1) { x = W + 30; y = Math.random() * H; }
  else if (side === 2) { x = Math.random() * W; y = -30; }
  else { x = Math.random() * W; y = H + 30; }
  G.enemies.push({
    name: spec.name, kit, x, y, r: role.r, hp, maxHp: hp,
    speed: role.speed * G.difficulty.enemySpeed * (0.9 + Math.random() * 0.2),
    hitFlash: 0, bob: Math.random() * 10, skin: skinFor(spec.name),
    facing: 0, lastHitBy: 0, fireCd: (1.5 + Math.random() * 2) * G.difficulty.enemyFire,
  });
}

export function spawnBoss() {
  const spec = currentLevel().boss;
  const hp = Math.round(spec.hp * G.difficulty.bossHp);
  showBanner(`FINAL BOSS — ${spec.name.toUpperCase()}`);
  G.boss = {
    name: spec.name, kit: KITS[spec.team], x: W / 2, y: -60, r: spec.r,
    hp, maxHp: hp, speed: spec.speed,
    volley: spec.volley, enrageVolley: spec.enrageVolley,
    chargeCdMax: spec.chargeCd, enrageChargeCd: spec.enrageChargeCd,
    bulletSpeed: spec.bulletSpeed,
    fireCd: 2, chargeCd: 3, charging: 0, chargeDx: 0, chargeDy: 0,
    hitFlash: 0, bob: 0, skin: spec.skin, facing: Math.PI / 2, lastHitBy: 0,
  };
  bosslabel.textContent = spec.name.toUpperCase();
  bossbar.classList.remove('hidden');
  G.bossDropCd = 4; // first supply drop ~4s into the fight
  sfx.charge();
  sfx.shout();
}

// ---------- special abilities ----------
export function activateSpecial() {
  if (!G.running || G.mode !== 'game' || !G.player || G.player.specialCd > 0) return;
  const sp = G.player.special;
  G.player.specialCd = sp.cd;
  sfx.special();
  sfx.shout();
  G.shake = Math.max(G.shake, 4);
  if (sp.kind === 'cannon') {
    const a = G.player.facing;
    G.bullets.push({
      x: G.player.x + Math.cos(a) * (G.player.r + 6),
      y: G.player.y + Math.sin(a) * (G.player.r + 6),
      vx: Math.cos(a) * 700, vy: Math.sin(a) * 700,
      r: 11, dmg: 5, pierce: true, id: ++G.bulletSeq,
    });
    burst(G.player.x, G.player.y, '#ffd24a', 12);
  } else if (sp.kind === 'turbo') {
    G.player.turboT = 3;
    burst(G.player.x, G.player.y, '#4ae3ff', 14);
  } else if (sp.kind === 'slowmo') {
    G.player.slowmoT = 3;
    burst(G.player.x, G.player.y, '#c44aff', 18, 1.4);
  } else if (sp.kind === 'shockwave') {
    shockwave(150, 2);
  } else if (sp.kind === 'wall') {
    G.player.shieldT = 4;
    shockwave(110, 0);
  } else if (sp.kind === 'save') {
    for (const b of G.enemyBullets) burst(b.x, b.y, '#9fd0ff', 3);
    G.enemyBullets = [];
    G.player.invuln = 2;
  }
}

export function shockwave(radius, dmg) {
  burst(G.player.x, G.player.y, '#fff', 30, 1.8);
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    const d = dist(e, G.player);
    if (d < radius) {
      const a = Math.atan2(e.y - G.player.y, e.x - G.player.x);
      e.x += Math.cos(a) * 100;
      e.y += Math.sin(a) * 100;
      e.hp -= dmg; e.hitFlash = 0.15;
      if (e.hp <= 0) {
        G.enemies.splice(i, 1);
        G.killsTotal++;
        burst(e.x, e.y, e.kit.shirt, 16, 1.2);
        sfx.kill();
        maybeDrop(e.x, e.y);
      }
    }
  }
  if (G.boss && dmg > 0 && dist(G.boss, G.player) < radius + G.boss.r) {
    G.boss.hp -= dmg; G.boss.hitFlash = 0.15;
    if (G.boss.hp <= 0) {
      burst(G.boss.x, G.boss.y, '#ffd700', 60, 2);
      G.shake = 16;
      bossDefeated();
    }
  }
}

// ---------- power-ups ----------
export function maybeDrop(x, y) {
  if (Math.random() >= DROP_CHANCE) return;
  const roll = Math.random();
  const type = roll < 0.26 ? 'health' : roll < 0.44 ? 'rapid' : roll < 0.60 ? 'spread'
    : roll < 0.72 ? 'shield' : roll < 0.80 ? 'star' : roll < 0.87 ? 'bomb'
    : roll < 0.92 ? 'homing' : roll < 0.96 ? 'fire' : roll < 0.98 ? 'boots' : 'gold';
  G.powerups.push({ x, y, type, life: 10, bob: Math.random() * 10 });
}

export function applyPowerup(type) {
  if (type === 'health') {
    G.player.hp = Math.min(G.player.maxHp, G.player.hp + 1);
  } else if (type === 'rapid') {
    G.player.rapidT = EFFECT_DUR.rapid;
  } else if (type === 'spread') {
    G.player.spreadT = EFFECT_DUR.spread;
  } else if (type === 'shield') {
    G.player.shieldT = EFFECT_DUR.shield;
  } else if (type === 'star') {
    G.player.specialCd = 0;
  } else if (type === 'bomb') {
    bombBlast();
  } else if (type === 'homing') {
    G.player.homeT = EFFECT_DUR.homing;
  } else if (type === 'fire') {
    G.player.fireT = EFFECT_DUR.fire;
  } else if (type === 'boots') {
    G.player.bootsT = EFFECT_DUR.boots;
  } else if (type === 'gold') {
    G.player.maxHp += 1; G.player.hp += 1; // permanent, no timer
  }
  sfx.pickup();
  burst(G.player.x, G.player.y, POWERUP_TYPES[type].color, 10);
}

// BOMB power-up: 3 damage to every enemy, 5 to the boss.
export function bombBlast() {
  burst(G.player.x, G.player.y, '#fff', 40, 2.2);
  G.shake = Math.max(G.shake, 12);
  sfx.charge();
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    e.hp -= 3; e.hitFlash = 0.15;
    if (e.hp <= 0) {
      G.enemies.splice(i, 1);
      G.killsTotal++;
      burst(e.x, e.y, e.kit.shirt, 16, 1.2);
      sfx.kill();
      maybeDrop(e.x, e.y);
    }
  }
  if (G.boss) {
    G.boss.hp -= 5; G.boss.hitFlash = 0.15;
    if (G.boss.hp <= 0) {
      burst(G.boss.x, G.boss.y, '#ffd700', 60, 2);
      G.shake = 16;
      bossDefeated();
    }
  }
}

// Boss goes down: shootout if another level remains, otherwise the normal end screen.
export function bossDefeated() {
  const kit = G.boss ? G.boss.kit : null;
  G.boss = null; G.won = true;
  reachLevel(G.levelIndex + 1); // unlock the next level (capped at the last one)
  if (G.levelIndex + 1 < LEVELS.length) startShootout(kit);
  else endGame();
}

export function hitPlayer(dmg = 1) {
  if (G.player.shieldT > 0) {
    burst(G.player.x, G.player.y, '#6a9bff', 8);
    G.player.invuln = 0.5;
    return;
  }
  G.player.hp -= dmg * G.difficulty.dmgTaken;
  G.player.invuln = 1.0;
  G.vignette = 0.6;
  G.shake = Math.max(G.shake, 8);
  burst(G.player.x, G.player.y, '#f00', 14);
  sfx.hit();
  sfx.grunt();
  if (G.player.hp <= 0) { G.lost = true; endGame(); }
}

export function endGame() {
  G.running = false;
  bossbar.classList.add('hidden');
  specialbtn.classList.add('hidden');
  saveBest();
  endEl.classList.remove('hidden');
  const moreLevels = G.levelIndex + 1 < LEVELS.length;
  const btns =
    `<div class="endbtns">` +
    (G.won && moreLevels ? `<button data-act="next" type="button">▶ LEVEL ${G.levelIndex + 2} — ${LEVELS[G.levelIndex + 1].name.toUpperCase()}</button>` : '') +
    `<button data-act="again" type="button">${G.won ? 'CHANGE PLAYER' : 'TRY AGAIN'}</button>` +
    `</div>`;
  if (G.won) {
    sfx.win();
    endEl.innerHTML = `<h1 style="color:#ffd700">🏆 ${currentLevel().name.toUpperCase()} CHAMPIONS!</h1>` +
      `<p>${G.player.name} destroyed ${currentLevel().boss.name} and every rival squad. Total kills: ${G.killsTotal}</p>` +
      (!moreLevels ? `<p style="color:#ffd700">You beat every level. Arsenal rule England, Europe AND the World!</p>` : '') +
      btns +
      `<p class="hint kb">${moreLevels ? 'N — next level • ' : ''}R — pick another player</p>`;
  } else {
    sfx.lose();
    const bossFight = G.waveIndex >= currentLevel().waves.length;
    const how = bossFight
      ? `${currentLevel().boss.name} clattered ${G.player.name} in the ${currentLevel().name} final`
      : `${G.player.name} got clattered in the ${currentLevel().name}, wave ${G.waveIndex + 1}`;
    endEl.innerHTML = `<h1>GAME OVER</h1>` +
      `<p>${how}. Kills: ${G.killsTotal}</p>` +
      btns +
      `<p class="hint kb">R — try again</p>`;
  }
  // wire tap buttons (guarded for headless stubs)
  if (typeof endEl.querySelectorAll === 'function') {
    endEl.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.act === 'next' && G.won && moreLevels) startGame(G.chosen, G.levelIndex + 1);
        else backToPicker();
      });
    });
  }
}

// ---------- aiming ----------
// Mouse = manual aim. SPACE = auto-aim at nearest threat (trackpad mode).
function nearestTarget() {
  let bestT = null, bd = Infinity;
  const consider = t => {
    const d = dist(t, G.player);
    if (d < bd) { bd = d; bestT = t; }
  };
  for (const e of G.enemies) consider(e);
  if (G.boss) consider(G.boss);
  return bestT;
}

function currentAim() {
  // Keyboard/trackpad mode: mouse idle >3s (or never used) → always auto-aim.
  const keyboardMode = (G.gameClock - G.mouse.t) > 3;
  if ((keyboardMode || G.keys[' ']) && !G.mouse.down) {
    const t = nearestTarget();
    if (t) return Math.atan2(t.y - G.player.y, t.x - G.player.x);
  }
  return Math.atan2(G.mouse.y - G.player.y, G.mouse.x - G.player.x);
}

// ---------- update ----------
export function update(dt) {
  G.gameClock += dt;
  G.shake = Math.max(0, G.shake - 30 * dt);
  G.vignette = Math.max(0, G.vignette - 1.2 * dt);
  const slow = G.player.slowmoT > 0 ? 0.4 : 1; // Maestro slow-mo factor

  // player movement (keyboard + touch joystick, analog magnitude)
  let dx = 0, dy = 0;
  if (G.keys['w'] || G.keys['arrowup']) dy -= 1;
  if (G.keys['s'] || G.keys['arrowdown']) dy += 1;
  if (G.keys['a'] || G.keys['arrowleft']) dx -= 1;
  if (G.keys['d'] || G.keys['arrowright']) dx += 1;
  if (G.joy.active && (Math.abs(G.joy.dx) > 0.15 || Math.abs(G.joy.dy) > 0.15)) {
    dx += G.joy.dx; dy += G.joy.dy;
  }
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    const mag = Math.min(1, len); // partial joystick tilt = slower
    const spd = G.player.speed * (G.player.turboT > 0 ? 1.6 : 1) * (G.player.bootsT > 0 ? 1.4 : 1);
    G.player.x += (dx / len) * spd * mag * dt;
    G.player.y += (dy / len) * spd * mag * dt;
    G.player.bob += dt * 12 * mag;
  }
  G.player.x = Math.max(G.player.r, Math.min(W - G.player.r, G.player.x));
  G.player.y = Math.max(G.player.r, Math.min(H - G.player.r, G.player.y));
  G.player.invuln = Math.max(0, G.player.invuln - dt);
  G.player.rapidT = Math.max(0, G.player.rapidT - dt);
  G.player.spreadT = Math.max(0, G.player.spreadT - dt);
  G.player.shieldT = Math.max(0, G.player.shieldT - dt);
  G.player.turboT = Math.max(0, G.player.turboT - dt);
  G.player.slowmoT = Math.max(0, G.player.slowmoT - dt);
  G.player.homeT = Math.max(0, G.player.homeT - dt);
  G.player.fireT = Math.max(0, G.player.fireT - dt);
  G.player.bootsT = Math.max(0, G.player.bootsT - dt);
  G.player.specialCd = Math.max(0, G.player.specialCd - dt);
  G.player.facing = currentAim();

  // shooting
  G.player.fireCd -= dt;
  const wantShoot = G.mouse.down || G.keys[' '] || G.touchShoot;
  if (wantShoot && G.player.fireCd <= 0 && (G.mouse.down || nearestTarget())) {
    G.player.fireCd = (1 / G.player.rof) * (G.player.rapidT > 0 ? 0.5 : 1);
    const a = G.player.facing;
    const angles = G.player.spreadT > 0 ? [a - 0.18, a, a + 0.18] : [a];
    for (const ang of angles) {
      G.bullets.push({
        x: G.player.x + Math.cos(ang) * (G.player.r + 6),
        y: G.player.y + Math.sin(ang) * (G.player.r + 6),
        vx: Math.cos(ang) * G.player.bspeed, vy: Math.sin(ang) * G.player.bspeed,
        r: 5, dmg: G.player.dmg + (G.player.fireT > 0 ? 1 : 0), pierce: false, id: ++G.bulletSeq,
      });
    }
    G.flashes.push({ x: G.player.x + Math.cos(a) * (G.player.r + 12),
      y: G.player.y + Math.sin(a) * (G.player.r + 12), life: 0.06 });
    G.shake = Math.max(G.shake, 1.5);
    sfx.shoot();
    // occasional rallying cry while firing — max once per 4s, 30% chance
    if (G.gameClock - G.lastShout > 4 && Math.random() < 0.3) {
      G.lastShout = G.gameClock;
      sfx.shout();
    }
  }

  // wave spawning
  const level = currentLevel();
  if (!G.boss && G.waveIndex >= 0 && G.waveIndex < level.waves.length) {
    const maxAlive = 3 + Math.min(3, G.waveIndex);
    if (G.waveQueue.length > 0 && G.enemies.length < maxAlive) {
      spawnEnemy();
    } else if (G.waveQueue.length === 0 && G.enemies.length === 0) {
      nextWave();
    }
  }

  // enemies chase + shoot (slow-mo applies)
  for (const e of G.enemies) {
    e.facing = Math.atan2(G.player.y - e.y, G.player.x - e.x);
    e.x += Math.cos(e.facing) * e.speed * slow * dt;
    e.y += Math.sin(e.facing) * e.speed * slow * dt;
    e.bob += dt * 10 * slow;
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.fireCd -= dt;
    const d = dist(e, G.player);
    if (e.fireCd <= 0 && d < 500 && d > 60) {
      e.fireCd = (2.0 + Math.random() * 1.2) * G.difficulty.enemyFire;
      const aim = e.facing + (Math.random() - 0.5) * 0.22; // slight inaccuracy
      G.enemyBullets.push({
        x: e.x + Math.cos(aim) * (e.r + 4), y: e.y + Math.sin(aim) * (e.r + 4),
        vx: Math.cos(aim) * 200, vy: Math.sin(aim) * 200, r: 6,
      });
    }
  }

  // boss AI (slow-mo applies)
  if (G.boss) {
    const enraged = G.boss.hp < G.boss.maxHp / 2;
    const a = Math.atan2(G.player.y - G.boss.y, G.player.x - G.boss.x);
    G.boss.facing = a;
    G.boss.hitFlash = Math.max(0, G.boss.hitFlash - dt);
    G.boss.bob += dt * 8 * slow;

    if (G.boss.charging > 0) {
      G.boss.charging -= dt;
      G.boss.x += G.boss.chargeDx * 520 * slow * dt;
      G.boss.y += G.boss.chargeDy * 520 * slow * dt;
    } else {
      G.boss.x += Math.cos(a) * G.boss.speed * (enraged ? 1.4 : 1) * slow * dt;
      G.boss.y += Math.sin(a) * G.boss.speed * (enraged ? 1.4 : 1) * slow * dt;
      G.boss.chargeCd -= dt;
      if (G.boss.chargeCd <= 0) {
        G.boss.chargeCd = enraged ? G.boss.enrageChargeCd : G.boss.chargeCdMax;
        G.boss.charging = 0.55;
        G.boss.chargeDx = Math.cos(a); G.boss.chargeDy = Math.sin(a);
        burst(G.boss.x, G.boss.y, '#6cabdd', 20, 1.5);
        G.shake = Math.max(G.shake, 6);
        sfx.charge();
      }
    }
    G.boss.x = Math.max(G.boss.r, Math.min(W - G.boss.r, G.boss.x));
    G.boss.y = Math.max(G.boss.r, Math.min(H - G.boss.r, G.boss.y));

    G.boss.fireCd -= dt;
    if (G.boss.fireCd <= 0) {
      G.boss.fireCd = enraged ? 1.1 : 1.7;
      const n = enraged ? G.boss.enrageVolley : G.boss.volley;
      for (let i = 0; i < n; i++) {
        const va = a + (i - (n - 1) / 2) * 0.24;
        G.enemyBullets.push({ x: G.boss.x, y: G.boss.y,
          vx: Math.cos(va) * G.boss.bulletSpeed, vy: Math.sin(va) * G.boss.bulletSpeed, r: 7, heavy: true });
      }
      sfx.volley();
    }
    bossfill.style.width = (G.boss.hp / G.boss.maxHp * 100) + '%';

    // timed supply drops while the boss fight runs (first at ~4s, then every 8s)
    G.bossDropCd -= dt;
    if (G.bossDropCd <= 0) {
      G.bossDropCd = 8;
      const roll = Math.random();
      const type = roll < 0.36 ? 'health' : roll < 0.48 ? 'rapid' : roll < 0.60 ? 'spread'
        : roll < 0.68 ? 'shield' : roll < 0.76 ? 'star' : roll < 0.83 ? 'bomb'
        : roll < 0.88 ? 'homing' : roll < 0.93 ? 'fire' : roll < 0.97 ? 'boots' : 'gold';
      G.powerups.push({
        x: 120 + Math.random() * (W - 240),
        y: 120 + Math.random() * (H - 240),
        type, life: 10, bob: Math.random() * 10,
      });
    }
  }

  // bullets
  // homing: curve player bullets toward the nearest threat (max ~6 rad/s, speed preserved)
  if (G.player.homeT > 0) {
    const t = nearestTarget();
    if (t) {
      for (const b of G.bullets) {
        if (b.pierce) continue; // cannon balls fly straight
        const want = Math.atan2(t.y - b.y, t.x - b.x);
        const cur = Math.atan2(b.vy, b.vx);
        let d = want - cur;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        const maxTurn = 6 * dt;
        const na = cur + Math.max(-maxTurn, Math.min(maxTurn, d));
        const spd = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(na) * spd; b.vy = Math.sin(na) * spd;
      }
    }
  }
  for (const b of G.bullets) { b.x += b.vx * dt; b.y += b.vy * dt; }
  G.bullets = G.bullets.filter(b => b.x > -30 && b.x < W + 30 && b.y > -30 && b.y < H + 30);
  for (const b of G.enemyBullets) { b.x += b.vx * slow * dt; b.y += b.vy * slow * dt; }
  G.enemyBullets = G.enemyBullets.filter(b => b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10);

  // bullets vs enemies (pierce = cannon ball hits each enemy once)
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    for (let j = G.bullets.length - 1; j >= 0; j--) {
      const b = G.bullets[j];
      if (b.pierce && e.lastHitBy === b.id) continue;
      if (dist(b, e) < e.r + b.r) {
        if (b.pierce) e.lastHitBy = b.id; else G.bullets.splice(j, 1);
        e.hp -= b.dmg; e.hitFlash = 0.1;
        burst(b.x, b.y, '#ffd24a', 5);
        if (e.hp <= 0) {
          G.enemies.splice(i, 1);
          G.killsTotal++;
          burst(e.x, e.y, e.kit.shirt, 16, 1.2);
          burst(e.x, e.y, '#fff', 6);
          G.shake = Math.max(G.shake, 3);
          sfx.kill();
          maybeDrop(e.x, e.y);
        }
        if (!b.pierce) break;
      }
    }
  }

  // bullets vs boss
  if (G.boss) {
    for (let j = G.bullets.length - 1; j >= 0; j--) {
      const b = G.bullets[j];
      if (b.pierce && G.boss.lastHitBy === b.id) continue;
      if (dist(b, G.boss) < G.boss.r + b.r) {
        if (b.pierce) G.boss.lastHitBy = b.id; else G.bullets.splice(j, 1);
        G.boss.hp -= b.dmg; G.boss.hitFlash = 0.08;
        burst(b.x, b.y, '#fff', 3);
        if (G.boss.hp <= 0) {
          burst(G.boss.x, G.boss.y, '#ffd700', 60, 2);
          G.shake = 16;
          bossDefeated();
          break;
        }
      }
    }
  }

  // damage to player
  if (G.player.invuln <= 0 && G.running) {
    for (const e of G.enemies) {
      if (dist(e, G.player) < e.r + G.player.r) { hitPlayer(); break; }
    }
    if (!G.lost && G.boss && dist(G.boss, G.player) < G.boss.r + G.player.r) {
      hitPlayer(G.boss.charging > 0 ? 2 : 1);
    }
  }
  for (let i = G.enemyBullets.length - 1; i >= 0; i--) {
    if (G.player.invuln <= 0 && dist(G.enemyBullets[i], G.player) < G.enemyBullets[i].r + G.player.r) {
      const b = G.enemyBullets[i];
      G.enemyBullets.splice(i, 1);
      hitPlayer(b.heavy ? 1 : 0.5); // regular shots cost half a heart, boss shots a full one
    }
  }

  // power-ups: bob, expire, pickup
  for (const p of G.powerups) { p.bob += dt * 6; p.life -= dt; }
  for (let i = G.powerups.length - 1; i >= 0; i--) {
    const p = G.powerups[i];
    if (p.life <= 0) { G.powerups.splice(i, 1); continue; }
    if (dist(p, G.player) < G.player.r + 16) {
      applyPowerup(p.type);
      G.powerups.splice(i, 1);
    }
  }

  // particles / flashes
  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);
  for (const f of G.flashes) f.life -= dt;
  G.flashes = G.flashes.filter(f => f.life > 0);

  // HUD + special indicator
  if (G.running) {
    let fx = '';
    if (G.player.rapidT > 0) fx += ` ⚡${Math.ceil(G.player.rapidT)}s`;
    if (G.player.spreadT > 0) fx += ` ✸${Math.ceil(G.player.spreadT)}s`;
    if (G.player.shieldT > 0) fx += ` 🛡${Math.ceil(G.player.shieldT)}s`;
    if (G.player.turboT > 0) fx += ` 💨${Math.ceil(G.player.turboT)}s`;
    if (G.player.slowmoT > 0) fx += ` ⏳${Math.ceil(G.player.slowmoT)}s`;
    if (G.player.homeT > 0) fx += ` 🎯${Math.ceil(G.player.homeT)}s`;
    if (G.player.fireT > 0) fx += ` 🔥${Math.ceil(G.player.fireT)}s`;
    if (G.player.bootsT > 0) fx += ` 👟${Math.ceil(G.player.bootsT)}s`;
    hud.textContent = `${G.player.name.toUpperCase()}  ${heartsText(G.player.hp)}${fx}  |  ` +
      `${level.name}${G.boss ? ' — BOSS' : ` — Wave ${G.waveIndex + 1}/${level.waves.length}`}` +
      `  |  Kills: ${G.killsTotal}`;

    const ready = G.player.specialCd <= 0;
    sfill.style.width = ((1 - G.player.specialCd / G.player.special.cd) * 100) + '%';
    skey.textContent = ready
      ? (isTouch ? 'READY — tap ★' : 'READY — press E')
      : `${G.player.specialCd.toFixed(1)}s cooldown`;
    specialbar.classList.toggle('ready', ready);
    if (isTouch) specialbtn.classList.toggle('cd', !ready);
  } else {
    hud.textContent = '';
  }
}

// ---------- boot + loop ----------
buildPicker();

// test hook: open with #testgame to skip the picker (used by headless screenshots)
if (typeof location !== 'undefined' && location.hash === '#testgame') {
  startGame(ARSENAL_XI[0], 0);
  G.keys['d'] = true; // run right so leg animation is visible in screenshots
}

// PWA: offline cache (no-op where unsupported, e.g. file:// or tests)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  try { navigator.serviceWorker.register('sw.js'); } catch (e) { /* offline cache unavailable */ }
}
function loop(t) {
  const dt = Math.min(0.05, (t - G.lastTime) / 1000 || 0);
  G.lastTime = t;
  if (G.running) { if (G.mode === 'shootout') updateShootout(dt); else update(dt); }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
