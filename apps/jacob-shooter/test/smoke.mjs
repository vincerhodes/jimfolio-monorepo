// Headless smoke test (ESM): stub the DOM on globalThis FIRST, then import the
// real modules and simulate full runs. Must end printing SMOKE_OK.
const anyProxy = () => new Proxy(function(){}, { get: () => anyProxy(), apply: () => anyProxy() });
const ctxStub = anyProxy();
const mkEl = () => ({ getContext: () => ctxStub, addEventListener: () => {}, style: {},
  classList: { add(){}, remove(){}, toggle(){} }, querySelector: () => ({ getContext: () => ctxStub, style:{}, textContent:'' }),
  appendChild: () => {}, set innerHTML(v) {}, get innerHTML() { return ''; },
  width: 960, height: 600, textContent: '', offsetWidth: 0 });
globalThis.document = { getElementById: mkEl, createElement: mkEl };
globalThis.window = { addEventListener: () => {} };
globalThis.requestAnimationFrame = () => {};
// in-memory localStorage so best/levelReached persistence is assertable
const lsStore = {};
globalThis.localStorage = {
  getItem: k => (k in lsStore ? lsStore[k] : null),
  setItem: (k, v) => { lsStore[k] = String(v); },
  removeItem: k => { delete lsStore[k]; },
};
globalThis.location = { hash: '' };

const { G } = await import('../js/state.js');
const { ARSENAL_XI, WAVES, KITS, LEVELS, specialFor } = await import('../data.js');
const { sfx } = await import('../js/sfx.js');
const { startGame, update, draw, activateSpecial, applyPowerup, hitPlayer,
  spawnBoss, saveBest, buildPicker } = await import('../js/game.js');
const { shootoutStrike, updateShootout, skipShootout, pickBoost } = await import('../js/shootout.js');

// Same shape as the old eval'd __g test hook, sourced from namespace imports + G.
const g = {
  get player(){return G.player}, get boss(){return G.boss},
  get killsTotal(){return G.killsTotal}, get running(){return G.running},
  get won(){return G.won}, get lost(){return G.lost}, get enemies(){return G.enemies},
  get enemyBullets(){return G.enemyBullets}, get bullets(){return G.bullets},
  get powerups(){return G.powerups}, get waveIndex(){return G.waveIndex}, get levelIndex(){return G.levelIndex},
  get mode(){return G.mode}, get shootout(){return G.shootout},
  get best(){return G.best}, get lastShout(){return G.lastShout},
  get runBoosts(){return G.runBoosts},
  mouse: G.mouse, keys: G.keys,
  startGame, update, draw, activateSpecial, applyPowerup, hitPlayer,
  spawnBoss, shootoutStrike, updateShootout, skipShootout, pickBoost, saveBest, buildPicker, sfx,
  ARSENAL_XI, WAVES, KITS, LEVELS, specialFor,
};
const fail = m => { console.log('FAIL:', m); process.exit(1); };

g.draw(); // picker state render

// --- special abilities: every kind activates + cooldown set ---
const byKind = {};
for (const p of g.ARSENAL_XI) byKind[g.specialFor(p.pos).kind] = p;
for (const kind of ['cannon','turbo','slowmo','shockwave','wall','save']) {
  g.startGame(byKind[kind], 0);
  g.player.invuln = 999;
  g.enemies.push({ name:'T', kit:g.KITS.spurs, x:g.player.x+60, y:g.player.y, r:14, hp:2, maxHp:2,
    speed:0, hitFlash:0, bob:0, skin:'#fff', facing:0, lastHitBy:0, fireCd:99 });
  g.enemyBullets.push({ x:g.player.x+30, y:g.player.y, vx:0, vy:0, r:6 });
  g.activateSpecial();
  if (g.player.specialCd <= 0) fail(kind + ': cooldown not set');
  if (kind === 'cannon' && !g.bullets.some(b => b.pierce)) fail('cannon: no pierce bullet');
  if (kind === 'turbo' && g.player.turboT <= 0) fail('turbo not active');
  if (kind === 'slowmo' && g.player.slowmoT <= 0) fail('slowmo not active');
  if (kind === 'shockwave' && g.enemies.length !== 0) fail('shockwave did not kill 2hp enemy at 2dmg');
  if (kind === 'wall' && g.player.shieldT <= 0) fail('wall: no shield');
  if (kind === 'save' && g.enemyBullets.length !== 0) fail('save: bullets not cleared');
  const cdBefore = g.player.specialCd;
  g.activateSpecial(); // should be blocked by cooldown
  if (kind === 'cannon' && g.bullets.filter(b=>b.pierce).length !== 1) fail('cannon fired during cooldown');
  g.update(1/60); g.draw();
  console.log('special', kind, 'OK (cd', cdBefore.toFixed(0) + 's)');
}

// --- enemy shooting + half-heart damage ---
g.startGame(g.ARSENAL_XI[0], 0);
g.player.invuln = 0; g.player.hp = 5;
g.enemies.push({ name:'S', kit:g.KITS.spurs, x:g.player.x+200, y:g.player.y, r:14, hp:99, maxHp:99,
  speed:0, hitFlash:0, bob:0, skin:'#fff', facing:0, lastHitBy:0, fireCd:0.01 });
for (let i = 0; i < 120; i++) g.update(1/60);
if (g.enemyBullets.length === 0 && g.player.hp === 5) fail('enemy never shot');
const hpBefore = g.player.hp;
g.player.invuln = 0;
g.enemyBullets.push({ x:g.player.x, y:g.player.y, vx:0, vy:0, r:6 });
g.update(1/60);
if (g.player.hp !== hpBefore - 0.5) fail('half-heart damage wrong: ' + hpBefore + ' -> ' + g.player.hp);
console.log('enemy shooting + half-heart OK (hp', hpBefore, '->', g.player.hp + ')');

// --- powerup pickup ---
g.applyPowerup('health');
if (g.player.hp !== Math.min(g.player.maxHp, hpBefore - 0.5 + 1)) fail('health powerup did not heal');
g.applyPowerup('rapid'); if (g.player.rapidT <= 0) fail('rapid not applied');
console.log('powerups OK');

// --- v6 powerups: star resets special cooldown, bomb wipes 2hp enemies ---
g.startGame(g.ARSENAL_XI[0], 0);
g.player.specialCd = 5;
g.applyPowerup('star');
if (g.player.specialCd !== 0) fail('star: specialCd not reset, got ' + g.player.specialCd);
const killsBeforeBomb = g.killsTotal;
g.enemies.push({ name:'B', kit:g.KITS.spurs, x:g.player.x+100, y:g.player.y, r:14, hp:2, maxHp:2,
  speed:0, hitFlash:0, bob:0, skin:'#fff', facing:0, lastHitBy:0, fireCd:99 });
g.applyPowerup('bomb');
if (g.enemies.length !== 0) fail('bomb: 2hp enemy survived');
if (g.killsTotal !== killsBeforeBomb + 1) fail('bomb: killsTotal not incremented');
console.log('star + bomb powerups OK');

// --- vocal sfx: exist and no-op safely without AudioContext ---
if (typeof g.sfx.grunt !== 'function' || typeof g.sfx.shout !== 'function') fail('vocal sfx missing');
try { g.sfx.grunt(); g.sfx.shout(); } catch (e) { fail('vocal sfx threw: ' + e.message); }
if (typeof g.lastShout !== 'number') fail('shooting shout limiter missing');
console.log('vocal sfx OK');

// --- v8.1 powerups: homing/fire/boots timers + gold permanent heart ---
g.startGame(g.ARSENAL_XI[0], 0);
g.applyPowerup('homing'); if (g.player.homeT <= 0) fail('homing not applied');
g.applyPowerup('fire'); if (g.player.fireT <= 0) fail('fire not applied');
g.applyPowerup('boots'); if (g.player.bootsT <= 0) fail('boots not applied');
const hpPreGold = g.player.hp, maxPreGold = g.player.maxHp;
g.applyPowerup('gold');
if (g.player.maxHp !== maxPreGold + 1 || g.player.hp !== hpPreGold + 1) fail('gold: +1 max heart not applied');
console.log('homing/fire/boots/gold powerups OK');

// --- fire bullets: +1 dmg while fireT active ---
g.startGame(g.ARSENAL_XI[0], 0);
g.player.fireT = 8;
g.enemies.push({ name:'F', kit:g.KITS.spurs, x:g.player.x+400, y:g.player.y, r:14, hp:99, maxHp:99,
  speed:0, hitFlash:0, bob:0, skin:'#fff', facing:0, lastHitBy:0, fireCd:99 });
g.keys[' '] = true;
g.update(1/60);
g.keys[' '] = false;
const fb = g.bullets[g.bullets.length - 1];
if (!fb || fb.dmg !== g.player.dmg + 1) fail('fire: bullet dmg not boosted, got ' + (fb && fb.dmg));
console.log('fire bullet dmg OK (' + fb.dmg + ')');

// --- homing: bullet velocity curves toward the target ---
g.startGame(g.ARSENAL_XI[0], 0);
g.player.homeT = 8;
const he = { name:'H', kit:g.KITS.spurs, x:g.player.x+200, y:g.player.y-150, r:14, hp:99, maxHp:99,
  speed:0, hitFlash:0, bob:0, skin:'#fff', facing:0, lastHitBy:0, fireCd:99 };
g.enemies.push(he);
g.bullets.push({ x:g.player.x, y:g.player.y, vx:g.player.bspeed, vy:0, r:5, dmg:1, pierce:false, id:0 });
const hb = g.bullets[g.bullets.length - 1];
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return Math.abs(d); };
const offBefore = angDiff(Math.atan2(hb.vy, hb.vx), Math.atan2(he.y - hb.y, he.x - hb.x));
for (let i = 0; i < 15; i++) g.update(1/60);
const offAfter = angDiff(Math.atan2(hb.vy, hb.vx), Math.atan2(he.y - hb.y, he.x - hb.x));
if (!(offAfter < offBefore)) fail('homing: bullet did not curve toward enemy (' + offBefore + ' -> ' + offAfter + ')');
console.log('homing curve OK (off-target ' + offBefore.toFixed(2) + ' -> ' + offAfter.toFixed(2) + ' rad)');

// --- boots: 1.4x move speed ---
g.startGame(g.ARSENAL_XI[0], 0);
g.keys['d'] = true;
let sx = g.player.x;
for (let i = 0; i < 60; i++) g.update(1/60);
const dPlain = g.player.x - sx;
g.startGame(g.ARSENAL_XI[0], 0);
g.player.bootsT = 8;
sx = g.player.x;
for (let i = 0; i < 60; i++) g.update(1/60);
const dBoots = g.player.x - sx;
g.keys['d'] = false;
const ratio = dBoots / dPlain;
if (Math.abs(ratio - 1.4) > 0.01) fail('boots: speed multiplier wrong: ' + ratio);
console.log('boots speed OK (x' + ratio.toFixed(2) + ')');

// --- boss-phase timed supply drops ---
g.startGame(g.ARSENAL_XI[0], 0);
g.spawnBoss();
for (let i = 0; i < 60 * 9; i++) {
  g.player.invuln = 999;
  g.player.x = 20; g.player.y = 20; // cornered so drops are never auto-collected
  g.update(1/60);
}
if (g.powerups.length === 0) fail('boss drops: none spawned in 9s');
console.log('boss drops OK (' + g.powerups.length + ' on pitch after 9s)');

// --- data: 4 levels, every wave/boss team has a kit, 6 named players per wave ---
if (g.LEVELS.length !== 4) fail('expected 4 levels, got ' + g.LEVELS.length);
for (const lvl of g.LEVELS) {
  if (!g.KITS[lvl.boss.team]) fail('boss kit missing: ' + lvl.boss.team);
  for (const w of lvl.waves) {
    if (!g.KITS[w.team]) fail('wave kit missing: ' + w.team);
    if (w.pool.length !== 6) fail(w.team + ': expected 6 players, got ' + w.pool.length);
    for (const p of w.pool) if (!p.name) fail(w.team + ': unnamed player');
  }
}
console.log('levels data OK (4 levels, kits + 6 named players per wave)');

// full win-sim (god-mode) up to the boss defeat; returns at shootout (or endGame on the final level)
function winLevel(lvl) {
  g.startGame(g.ARSENAL_XI[2], lvl); // Gyökeres
  g.keys[' '] = true; // auto-aim shoot
  let bossSeen = false, ticks = 0;
  while (g.running && g.mode === 'game' && ticks < 60 * 300) {
    g.player.hp = Math.max(g.player.hp, 1); // god-mode
    g.player.invuln = 1;
    g.player.x = 60; g.player.y = 60; // park in the corner: scatterHearts spawn at x/y>=120,
    // so drops can never be auto-collected before the pre-boss heart count
    if (g.player.specialCd <= 0) g.activateSpecial();
    g.update(1/60);
    if (ticks % 30 === 0) g.draw();
    if (g.boss && !bossSeen) {
      bossSeen = true;
      const hearts = g.powerups.filter(p => p.type === 'health').length;
      if (hearts < 3) fail('level ' + lvl + ': only ' + hearts + ' pre-boss hearts');
      console.log('  pre-boss hearts on pitch:', hearts);
    }
    ticks++;
  }
  g.keys[' '] = false;
  console.log('level', lvl, '(' + g.LEVELS[lvl].name + '): bossSeen:', bossSeen,
    'won:', g.won, 'kills:', g.killsTotal, 'sim', (ticks/60).toFixed(0) + 's');
  if (!bossSeen) fail('level ' + lvl + ': boss never spawned');
  if (!g.won) fail('level ' + lvl + ': not won');
}

// deterministic shootout: player always scores (AI keeper dives the wrong way);
// concedeFirst=true concedes round 1 (keeper picks the wrong zone), saves the rest
function runShootout(concedeFirst) {
  let ticks = 0;
  while (g.mode === 'shootout' && g.shootout && !g.shootout.boostPick && ticks < 60 * 60) {
    const s = g.shootout;
    if (s.phase === 'aim') {
      g.shootoutStrike();
      s.keeperDive = s.targetAimX + 200; // dive the wrong way → guaranteed goal
    } else if (s.phase === 'saveaim') {
      s.keeperZone = (concedeFirst && s.kick === 1)
        ? (s.shotZone === 1 ? 0 : s.shotZone + 1) // wrong zone → concede
        : s.shotZone; // match the AI's committed zone → save
    }
    g.updateShootout(1/60);
    if (ticks % 30 === 0) g.draw();
    ticks++;
  }
  if (!(g.shootout && g.shootout.boostPick)) fail('shootout did not end in a WIN + boost offer');
}

// boss-snip: jump straight into a shootout without a full sim
function snipIntoShootout(lvl) {
  g.startGame(g.ARSENAL_XI[2], lvl);
  g.spawnBoss();
  g.boss.x = 300; g.boss.y = 300; g.boss.hp = 1;
  g.bullets.push({ x: 300, y: 300, vx: 0, vy: 0, r: 5, dmg: 99, pierce: false, id: 900000 + lvl });
  g.update(1/60);
  if (g.mode !== 'shootout') fail('level ' + lvl + ': boss-snip did not enter shootout, mode=' + g.mode);
}

const CH = g.ARSENAL_XI[2]; // chosen throughout: Gyökeres (hp 6, dmg 2, spd 205, rof 4)

// --- level 0: full sim → shootout (score + concede both ways) → boost pick ---
winLevel(0);
if (g.mode !== 'shootout') fail('level 0: shootout not entered, mode=' + g.mode);
if (!g.running) fail('level 0: loop stopped during shootout');
console.log('shootout entered OK');
runShootout(true); // concede round 1, save rounds 2-5
let s0 = g.shootout;
if (s0.goals !== 5) fail('shootout: expected 5 goals, got ' + s0.goals);
if (s0.conceded !== 1) fail('shootout: expected 1 conceded, got ' + s0.conceded);
if (!s0.boostPick) fail('shootout: no boost offered after win');
console.log('shootout OK: 5:1 win (scored 5, conceded 1, saved 4), boost offered');
g.pickBoost('dmg');
if (g.mode !== 'game' || g.levelIndex !== 1 || !g.running) fail('boost pick did not advance to level 1');
if (g.player.dmg !== CH.dmg + 1) fail('dmg boost not applied: ' + g.player.dmg);
if (g.runBoosts.dmg !== 1) fail('runBoosts.dmg not recorded');
console.log('boost dmg OK (dmg ' + g.player.dmg + ' on level 1)');

// --- level select: reaching level 2 persists immediately (survives a reload) ---
if (g.best.levelReached !== 1) fail('levelReached not updated after level 0 win: ' + g.best.levelReached);
const savedBest = JSON.parse(globalThis.localStorage.getItem('jacobShooterBest'));
if (!savedBest || savedBest.levelReached !== 1)
  fail('levelReached not in localStorage: ' + JSON.stringify(savedBest));
console.log('level select persistence OK (levelReached ' + savedBest.levelReached + ' survives reload)');

// --- level 1: full sim → shootout → rof boost (stacks with dmg) ---
winLevel(1);
if (g.mode !== 'shootout') fail('level 1: shootout not entered, mode=' + g.mode);
runShootout(false); // save everything
if (g.shootout.conceded !== 0) fail('shootout: expected 0 conceded, got ' + g.shootout.conceded);
g.pickBoost('rof');
if (Math.abs(g.player.rof - CH.rof * 1.25) > 0.001) fail('rof boost not applied: ' + g.player.rof);
if (g.player.dmg !== CH.dmg + 1) fail('dmg boost did not persist: ' + g.player.dmg);
console.log('boost rof OK (rof ' + g.player.rof.toFixed(1) + ', dmg still ' + g.player.dmg + ')');

// --- level 2 (Euros): full sim → shootout → spd boost ---
winLevel(2);
if (g.mode !== 'shootout') fail('level 2: shootout not entered, mode=' + g.mode);
runShootout(false);
g.pickBoost('spd');
if (Math.abs(g.player.speed - CH.spd * 1.2) > 0.001) fail('spd boost not applied: ' + g.player.speed);
if (g.player.dmg !== CH.dmg + 1 || Math.abs(g.player.rof - CH.rof * 1.25) > 0.001)
  fail('earlier boosts did not persist onto level 3');
console.log('boost spd OK (speed ' + g.player.speed.toFixed(0) + ', all boosts stacked)');

// --- 4th boost kind via boss-snip shootout (only 3 shootouts exist per run) ---
snipIntoShootout(1);
runShootout(false);
g.pickBoost('maxHp');
if (g.levelIndex !== 2) fail('maxHp pick did not advance (levelIndex ' + g.levelIndex + ')');
if (g.player.maxHp !== CH.hp + 1 || g.player.hp !== g.player.maxHp)
  fail('maxHp boost not applied: maxHp=' + g.player.maxHp);
if (g.player.dmg !== CH.dmg + 1) fail('dmg boost lost after maxHp pick');
console.log('boost maxHp OK (maxHp ' + g.player.maxHp + ', boosts stack)');

// --- level 3 (World Cup, final): full sim → normal endGame, no shootout ---
winLevel(3);
if (g.mode !== 'game') fail('level 3: unexpected shootout on final level');
if (g.running) fail('level 3: still running after final win (endGame expected)');
if (g.best.levelReached !== 3) fail('levelReached cap broken after final win: ' + g.best.levelReached);
console.log('final level endGame path OK (levelReached capped at 3)');

// --- picker = new run: runBoosts cleared ---
g.buildPicker();
if (g.runBoosts.spd !== 1 || g.runBoosts.dmg !== 0 || g.runBoosts.rof !== 1 || g.runBoosts.maxHp !== 0)
  fail('buildPicker did not clear runBoosts: ' + JSON.stringify(g.runBoosts));
console.log('runBoosts cleared on picker OK');

// --- lose path ---
g.startGame(g.ARSENAL_XI[0], 0);
g.player.hp = 1; g.player.invuln = 0;
g.enemies.push({ name:'X', kit:g.KITS.spurs, x:g.player.x, y:g.player.y, r:14, hp:2, maxHp:2,
  speed:0, hitFlash:0, bob:0, skin:'#fff', facing:0, lastHitBy:0, fireCd:99 });
g.update(1/60);
if (!g.lost) fail('lose not triggered');
console.log('lose path OK');
console.log('SMOKE_OK');
