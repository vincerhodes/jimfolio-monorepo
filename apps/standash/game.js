'use strict';

// ─── Canvas setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');
const DPR    = window.devicePixelRatio || 1;

// Logical dimensions (CSS pixels)
let LW, LH, TILE, groundY, playerX;

function resize() {
  LW = window.innerWidth;
  LH = window.innerHeight;
  canvas.width        = LW * DPR;
  canvas.height       = LH * DPR;
  canvas.style.width  = LW + 'px';
  canvas.style.height = LH + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  TILE    = Math.round(LH * 0.1);
  groundY = Math.round(LH * 0.80);
  playerX = Math.round(LW * 0.20);
}

// ─── Constants ───────────────────────────────────────────────────────────────
const GRAVITY     = 1600;   // px/s² downward
const JUMP_VEL    = -660;   // initial vy on cube jump
const SHIP_THRUST = -1000;  // vy/s when holding in ship mode
const SHIP_DRAG   = 0.82;   // gravity multiplier in ship mode
const LEVEL_LEN   = 13000;  // total level length in world px

// Difficulty configs: gapMult scales space between obstacles,
// patMax limits which (ordered easy→hard) cube patterns can appear
const DIFF = {
  easy:   { gapMult: 2.6,  spdInit: 230, spdMax: 340, spdAccel: 5,  patMax: 5  },
  medium: { gapMult: 1.0,  spdInit: 330, spdMax: 580, spdAccel: 15, patMax: 99 },
  hard:   { gapMult: 0.65, spdInit: 380, spdMax: 640, spdAccel: 22, patMax: 99 },
};

const C = {
  bg0:    '#080115',
  bg1:    '#140828',
  bg2:    '#2a1450',
  purple: '#9b2dff',
  pink:   '#ff2d9b',
  lpurp:  '#c77dff',
  lpink:  '#ff9de2',
  grid:   'rgba(155,45,255,0.10)',
  white:  '#ffffff',
};

// ─── State ───────────────────────────────────────────────────────────────────
let state    = 'menu';   // menu | playing | dead | complete
let gameMode = 'cube';   // cube | ship | ball

let player, obstacles, particles, bgStars;
let scrollX, speed, elapsed, score;
let inputDown;
let lastTS, deathTS, completeTS;
let modeSegs;        // [{at, mode}] – world positions of mode switches
let difficulty = 'medium';
let menuButtons = [];
let backBtn    = null;

// ─── Stars ───────────────────────────────────────────────────────────────────
function initStars() {
  bgStars = Array.from({ length: 80 }, () => ({
    x:     Math.random() * LW,
    y:     Math.random() * groundY * 0.95,
    r:     Math.random() * 1.4 + 0.4,
    spd:   Math.random() * 0.12 + 0.04,
    alpha: Math.random() * 0.45 + 0.2,
  }));
}

function scrollStars(spd) {
  for (const s of bgStars) {
    s.x -= s.spd * spd * 0.014;
    if (s.x < 0) s.x += LW;
  }
}

// ─── Game init ───────────────────────────────────────────────────────────────
function startGame() {
  resize();

  const ph = TILE * 0.82;
  player = {
    x:        playerX,
    y:        groundY - ph * 0.5,
    vy:       0,
    w:        ph,
    h:        ph,
    rot:      0,
    onGround: true,
    gravDir:  1,
    dead:     false,
  };

  obstacles  = [];
  particles  = [];
  scrollX    = 0;
  speed      = DIFF[difficulty].spdInit;
  elapsed    = 0;
  score      = 0;
  inputDown  = false;
  deathTS    = 0;
  completeTS = 0;
  gameMode   = 'cube';

  // Mode transitions at world positions
  modeSegs = [
    { at: 0,    mode: 'cube' },
    { at: 3200, mode: 'ship' },
    { at: 6400, mode: 'ball' },
    { at: 9600, mode: 'cube' },
  ];

  buildLevel();
  backBtn = null;
  state   = 'playing';
}

// ─── Level builder ───────────────────────────────────────────────────────────
function block(wx, row, wide = 1, tall = 1) {
  obstacles.push({
    type: 'block',
    x:    wx,
    y:    groundY - TILE * (row + tall),
    w:    TILE * wide,
    h:    TILE * tall,
  });
}

function spike(wx, row = 0) {
  obstacles.push({
    type: 'spike', inv: false,
    x:    wx,
    y:    groundY - TILE * (row + 1),
    w:    TILE,
    h:    TILE,
  });
}

function cspike(wx) {
  obstacles.push({
    type: 'spike', inv: true,
    x:    wx,
    y:    0,
    w:    TILE,
    h:    TILE,
  });
}

function marker(wx, mode) {
  obstacles.push({ type: 'marker', x: wx, mode });
}

// Seeded-ish deterministic random from index
function rng(seed) {
  const x = Math.sin(seed + 1) * 43758.5453;
  return x - Math.floor(x);
}

function buildLevel() {
  const gap  = LW * 0.4; // clear zone at start

  genCube(gap,                         modeSegs[1].at - TILE * 5);
  genShip(modeSegs[1].at + TILE * 5,   modeSegs[2].at - TILE * 5);
  genBall(modeSegs[2].at + TILE * 5,   modeSegs[3].at - TILE * 5);
  genCube(modeSegs[3].at + TILE * 5,   LEVEL_LEN - TILE * 4);

  for (let i = 1; i < modeSegs.length; i++) {
    marker(modeSegs[i].at, modeSegs[i].mode);
  }
}

function genCube(x0, x1) {
  // Ordered easy→hard: simple singles first, complex multi-obstacle last
  const patterns = [
    (x) => { spike(x);                                                          return 2; },
    (x) => { block(x, 0);                                                       return 2; },
    (x) => { spike(x); spike(x + TILE * 1.05);                                  return 3; },
    (x) => { block(x, 0, 1, 2);                                                 return 2; },
    (x) => { block(x, 0, 2, 1);                                                 return 3; },
    (x) => { block(x, 0); spike(x + TILE * 2, 1);                               return 4; },
    (x) => { block(x, 0); block(x + TILE * 2.2, 0);                             return 5; },
    (x) => { spike(x); spike(x + TILE * 1.05); spike(x + TILE * 2.1);           return 4; },
    (x) => { block(x, 0); block(x + TILE, 1);                                   return 3; },
    (x) => { block(x, 0, 1, 3);                                                 return 2; },
    (x) => { spike(x); block(x + TILE * 2, 0); spike(x + TILE * 3.5, 1);        return 5; },
    (x) => { spike(x); spike(x + TILE * 2.2); spike(x + TILE * 4.4);            return 6; },
    (x) => { block(x, 0); block(x + TILE, 1); block(x + TILE * 2, 2);           return 4; },
  ];

  const d    = DIFF[difficulty];
  const nPat = Math.min(patterns.length, d.patMax);
  let x   = x0;
  let idx = 0;
  while (x < x1) {
    const pi  = Math.floor(rng(idx) * nPat);
    const adv = patterns[pi](x);
    const gap = TILE * (adv + (1 + rng(idx + 1) * 2) * d.gapMult);
    x  += gap;
    idx += 2;
  }
}

function genShip(x0, x1) {
  const d   = DIFF[difficulty];
  let x   = x0;
  let idx = 100;
  while (x < x1) {
    const r = rng(idx);
    if      (r < 0.30) { spike(x); }
    else if (r < 0.60) { cspike(x); }
    else if (r < 0.78) { spike(x); cspike(x + TILE * 2.5); x += TILE * 2.5; }
    else               { block(x, 0, 1, 2); }
    x   += TILE * (2 + (0.5 + rng(idx + 1) * 2) * Math.max(0.75, d.gapMult));
    idx += 2;
  }
}

function genBall(x0, x1) {
  const d   = DIFF[difficulty];
  let x   = x0;
  let idx = 200;
  while (x < x1) {
    const r = rng(idx);
    if      (r < 0.38) { spike(x); }
    else if (r < 0.76) { cspike(x); }
    else               { spike(x); cspike(x + TILE * 1.5); x += TILE * 1.5; }
    x   += TILE * (1.5 + (0.3 + rng(idx + 1) * 2) * Math.max(0.8, d.gapMult));
    idx += 2;
  }
}

// ─── Particles ───────────────────────────────────────────────────────────────
function burst(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    const a   = (Math.PI * 2 * i / n) + (Math.random() - 0.5) * 0.8;
    const spd = 70 + Math.random() * 220;
    particles.push({
      x, y,
      vx:    Math.cos(a) * spd,
      vy:    Math.sin(a) * spd,
      r:     2 + Math.random() * 3.5,
      life:  1,
      decay: 1.1 + Math.random() * 1.4,
      col,
    });
  }
}

function emitTrail() {
  if (Math.random() > 0.45) return;
  const col = Math.random() > 0.5 ? C.pink : C.lpurp;
  particles.push({
    x:     player.x - player.w * 0.38 + (Math.random() - 0.5) * 6,
    y:     player.y + (Math.random() - 0.5) * player.h * 0.4,
    vx:    -speed * 0.14 + (Math.random() - 0.5) * 25,
    vy:    (Math.random() - 0.5) * 50,
    r:     1.2 + Math.random() * 2,
    life:  0.75,
    decay: 2.5 + Math.random(),
    col,
  });
}

function tickParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x    += p.vx * dt;
    p.y    += p.vy * dt;
    p.vy   += 260 * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ─── Input ───────────────────────────────────────────────────────────────────
function onDown(cx, cy) {
  // ← jimfolio button (menu, dead, complete)
  if (backBtn && cx >= backBtn.x && cx <= backBtn.x + backBtn.w
               && cy >= backBtn.y && cy <= backBtn.y + backBtn.h) {
    window.location.href = '/';
    return;
  }

  if (state === 'menu') {
    for (const btn of menuButtons) {
      if (cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h) {
        difficulty = btn.diff;
        startGame();
        return;
      }
    }
    return; // tap outside buttons does nothing
  }
  onPlayInput();
}

function onPlayInput() {
  if (state === 'dead')     { if (Date.now() - deathTS > 650) startGame(); return; }
  if (state === 'complete') { if (Date.now() - completeTS > 800) startGame(); return; }
  if (state !== 'playing')  return;
  inputDown = true;
  pressAction();
}

function onUp() {
  inputDown = false;
}

function pressAction() {
  if (gameMode === 'cube') {
    if (player.onGround) {
      player.vy       = JUMP_VEL;
      player.onGround = false;
      burst(player.x, player.y + player.h * 0.45, 6, C.lpurp);
    }
    // No double jump
  } else if (gameMode === 'ball') {
    player.gravDir *= -1;
    player.vy       = 0;
    burst(player.x, player.y, 7, C.lpurp);
  }
}

// ─── Collision ───────────────────────────────────────────────────────────────
function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function die() {
  if (player.dead) return;
  player.dead = true;
  burst(player.x, player.y, 20, C.pink);
  burst(player.x, player.y, 12, C.lpurp);
  state   = 'dead';
  deathTS = Date.now();
}

function checkCollisions() {
  const pw = player.w;
  const ph = player.h;
  const px = player.x - pw * 0.5;
  const py = player.y - ph * 0.5;

  // Shrunk hitbox for spikes (more forgiving)
  const ss  = 0.27;
  const spx = player.x - pw * (0.5 - ss);
  const spy = player.y - ph * (0.5 - ss);
  const spw = pw * (1 - ss * 2);
  const sph = ph * (1 - ss * 2);

  // ── Implicit floor ────────────────────────────────────────────────
  if (player.y + ph * 0.5 >= groundY) {
    player.y  = groundY - ph * 0.5;
    player.vy = 0;
    if (gameMode === 'cube') {
      player.rot = Math.round(player.rot / 90) * 90;
      if (inputDown) {
        // held landing: jump immediately
        player.vy = JUMP_VEL;
        burst(player.x, player.y + ph * 0.45, 6, C.lpurp);
      } else {
        player.onGround = true;
      }
    }
    // ship/ball: just floor-clip
  }

  // ── Implicit ceiling ──────────────────────────────────────────────
  if (player.y - ph * 0.5 <= 0) {
    player.y  = ph * 0.5;
    player.vy = 0;
  }

  // ── Tile obstacles ────────────────────────────────────────────────
  for (const obs of obstacles) {
    if (obs.type === 'marker') continue;
    const ox = obs.x - scrollX;
    if (ox + obs.w < -TILE * 2 || ox > LW + TILE) continue;

    if (obs.type === 'block') {
      if (!overlaps(px, py, pw, ph, ox, obs.y, obs.w, obs.h)) continue;

      const oR = (px + pw) - ox;
      const oL = (ox + obs.w) - px;
      const oD = (py + ph)  - obs.y;
      const oU = (obs.y + obs.h) - py;
      const mn = Math.min(oR, oL, oD, oU);

      if (mn === oD && player.vy >= -30) {
        // Land on top
        player.y  = obs.y - ph * 0.5;
        player.vy = 0;
        if (gameMode === 'cube') {
          player.rot = Math.round(player.rot / 90) * 90;
          if (inputDown) {
            player.vy = JUMP_VEL;
            burst(player.x, player.y + ph * 0.45, 6, C.lpurp);
          } else {
            player.onGround = true;
          }
        }
      } else if (mn === oU && player.vy < 0) {
        // Bump underside
        player.y  = obs.y + obs.h + ph * 0.5;
        player.vy = 0;
      } else {
        // Side → die
        die();
        return;
      }

    } else if (obs.type === 'spike') {
      // Use spike's inner triangle danger zone
      const sw   = obs.w * 0.6;
      const sh   = obs.h * 0.72;
      const sox  = ox + obs.w * 0.2;
      const soy  = obs.inv ? obs.y : obs.y + obs.h * 0.28;
      if (overlaps(spx, spy, spw, sph, sox, soy, sw, sh)) {
        die();
        return;
      }
    }
  }
}

// ─── Mode transitions ─────────────────────────────────────────────────────────
function updateMode() {
  for (let i = modeSegs.length - 1; i >= 0; i--) {
    if (scrollX >= modeSegs[i].at && gameMode !== modeSegs[i].mode) {
      gameMode        = modeSegs[i].mode;
      player.gravDir  = 1;
      player.vy       = 0;
      if (gameMode === 'cube') {
        player.y        = groundY - player.h * 0.5;
        player.onGround = true;
      }
      burst(player.x, player.y, 18, C.lpink);
      break;
    }
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────
function update(dt) {
  scrollStars(speed);
  if (state !== 'playing') return;

  elapsed += dt;
  const d  = DIFF[difficulty];
  speed    = Math.min(d.spdInit + elapsed * d.spdAccel, d.spdMax);
  scrollX += speed * dt;
  score    = Math.min(Math.floor(scrollX / LEVEL_LEN * 100), 100);

  updateMode();

  // Physics per mode
  if (gameMode === 'cube' || gameMode === 'ball') {
    player.vy += GRAVITY * player.gravDir * dt;
    player.vy  = Math.max(-800, Math.min(800, player.vy));
  } else if (gameMode === 'ship') {
    const force = inputDown ? SHIP_THRUST : GRAVITY * SHIP_DRAG;
    player.vy  += force * dt;
    player.vy   = Math.max(-440, Math.min(440, player.vy));
  }

  player.y        += player.vy * dt;
  player.onGround  = false;

  checkCollisions();

  // Rotation
  const spin = speed / 360;
  if (gameMode === 'cube') {
    if (!player.onGround) {
      player.rot += 360 * spin * dt;
    } else {
      // Smooth snap to nearest 90°
      const target = Math.round(player.rot / 90) * 90;
      player.rot  += (target - player.rot) * Math.min(1, dt * 18);
    }
  } else if (gameMode === 'ball') {
    player.rot += 290 * player.gravDir * spin * dt;
  } else if (gameMode === 'ship') {
    const tr    = player.vy * 0.07;
    player.rot += (tr - player.rot) * Math.min(1, dt * 7);
  }

  emitTrail();
  tickParticles(dt);

  if (scrollX >= LEVEL_LEN) {
    state       = 'complete';
    completeTS  = Date.now();
    burst(player.x, player.y, 30, C.pink);
    burst(player.x, player.y, 20, C.lpurp);
  }
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function glow(col, blur = 14) {
  ctx.shadowColor = col;
  ctx.shadowBlur  = blur;
}

function noGlow() {
  ctx.shadowBlur = 0;
}

// ─── Render background ───────────────────────────────────────────────────────
function drawBg() {
  const g = ctx.createLinearGradient(0, 0, 0, LH);
  g.addColorStop(0,   '#060012');
  g.addColorStop(0.6, '#130720');
  g.addColorStop(1,   '#271148');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LW, LH);

  // Stars
  for (const s of bgStars) {
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle   = '#e8d8ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Render ground ───────────────────────────────────────────────────────────
function drawGround() {
  // Ground fill
  ctx.fillStyle = '#120620';
  ctx.fillRect(0, groundY, LW, LH - groundY);

  // Glowing top line
  glow(C.purple, 14);
  ctx.strokeStyle = C.purple;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(LW, groundY);
  ctx.stroke();
  noGlow();

  // Grid below
  ctx.strokeStyle = C.grid;
  ctx.lineWidth   = 1;
  const off = scrollX % TILE;
  for (let x = -off; x < LW; x += TILE) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, LH);
    ctx.stroke();
  }
  for (let y = groundY + TILE * 0.5; y < LH; y += TILE * 0.5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(LW, y);
    ctx.stroke();
  }
}

// ─── Render obstacles ────────────────────────────────────────────────────────
function drawObstacles() {
  for (const obs of obstacles) {
    const ox = obs.x - scrollX;
    if (ox + obs.w < -TILE * 2 || ox > LW + TILE * 2) continue;

    ctx.save();

    if (obs.type === 'block') {
      const g = ctx.createLinearGradient(ox, obs.y, ox, obs.y + obs.h);
      g.addColorStop(0, '#7520d8');
      g.addColorStop(1, '#35087a');
      glow(C.purple, 7);
      ctx.fillStyle = g;
      ctx.fillRect(ox, obs.y, obs.w, obs.h);
      noGlow();

      // Outer border
      ctx.strokeStyle = C.lpurp;
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(ox + 0.75, obs.y + 0.75, obs.w - 1.5, obs.h - 1.5);

      // Inner cross decoration
      ctx.strokeStyle = 'rgba(200,150,255,0.2)';
      ctx.lineWidth   = 1;
      ctx.strokeRect(ox + 4, obs.y + 4, obs.w - 8, obs.h - 8);

    } else if (obs.type === 'spike') {
      glow(C.pink, 10);
      const g = ctx.createLinearGradient(ox, obs.y, ox + obs.w, obs.y + obs.h);
      g.addColorStop(0, C.pink);
      g.addColorStop(1, C.purple);
      ctx.fillStyle = g;

      ctx.beginPath();
      if (!obs.inv) {
        // Points up
        ctx.moveTo(ox + obs.w * 0.5, obs.y);
        ctx.lineTo(ox + obs.w,       obs.y + obs.h);
        ctx.lineTo(ox,               obs.y + obs.h);
      } else {
        // Points down
        ctx.moveTo(ox + obs.w * 0.5, obs.y + obs.h);
        ctx.lineTo(ox + obs.w,       obs.y);
        ctx.lineTo(ox,               obs.y);
      }
      ctx.closePath();
      ctx.fill();
      noGlow();
      ctx.strokeStyle = C.lpink;
      ctx.lineWidth   = 1;
      ctx.stroke();

    } else if (obs.type === 'marker') {
      const rx    = ox;
      const alpha = Math.max(0, 1 - Math.abs(rx - playerX) / (LW * 0.28));
      if (alpha < 0.02) { ctx.restore(); continue; }
      ctx.globalAlpha = alpha * 0.7;
      glow(C.pink, 12);
      ctx.strokeStyle = C.lpink;
      ctx.lineWidth   = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, groundY);
      ctx.stroke();
      ctx.setLineDash([]);
      noGlow();

      ctx.fillStyle   = C.lpink;
      ctx.font        = `bold ${TILE * 0.52}px monospace`;
      ctx.textAlign   = 'center';
      ctx.fillText(obs.mode.toUpperCase(), rx, TILE * 1.3);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// ─── Render player ───────────────────────────────────────────────────────────
function drawPlayer() {
  if (player.dead) return;

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.rot * Math.PI / 180);

  const hw = player.w * 0.5;
  const hh = player.h * 0.5;

  glow(C.pink, 20);

  if (gameMode === 'cube') {
    const g = ctx.createLinearGradient(-hw, -hh, hw, hh);
    g.addColorStop(0,   C.lpink);
    g.addColorStop(0.5, C.pink);
    g.addColorStop(1,   C.purple);
    ctx.fillStyle = g;
    ctx.fillRect(-hw, -hh, player.w, player.h);
    noGlow();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth   = 1.8;
    ctx.strokeRect(-hw + 2, -hh + 2, player.w - 4, player.h - 4);
    // X decoration
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth   = 1.3;
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -hh + 6); ctx.lineTo(hw - 6, hh - 6);
    ctx.moveTo(hw - 6,  -hh + 6); ctx.lineTo(-hw + 6, hh - 6);
    ctx.stroke();

  } else if (gameMode === 'ship') {
    const g = ctx.createLinearGradient(-hw, 0, hw, 0);
    g.addColorStop(0, C.purple);
    g.addColorStop(1, C.pink);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(hw,          0);
    ctx.lineTo(-hw * 0.15, -hh);
    ctx.lineTo(-hw,        -hh * 0.32);
    ctx.lineTo(-hw * 0.52,  0);
    ctx.lineTo(-hw,         hh * 0.32);
    ctx.lineTo(-hw * 0.15,  hh);
    ctx.closePath();
    ctx.fill();
    noGlow();
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Engine flame when thrusting
    if (inputDown) {
      ctx.shadowColor = '#ff9500';
      ctx.shadowBlur  = 14;
      ctx.fillStyle   = '#ffb040';
      ctx.beginPath();
      ctx.moveTo(-hw * 0.52,  0);
      ctx.lineTo(-hw * 1.2,  -hh * 0.24);
      ctx.lineTo(-hw * 1.65,  0);
      ctx.lineTo(-hw * 1.2,   hh * 0.24);
      ctx.closePath();
      ctx.fill();
      noGlow();
    }

  } else if (gameMode === 'ball') {
    const g = ctx.createRadialGradient(-hw * 0.3, -hh * 0.3, 1, 0, 0, hw);
    g.addColorStop(0,   C.lpink);
    g.addColorStop(0.5, C.pink);
    g.addColorStop(1,   C.purple);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, hw, 0, Math.PI * 2);
    ctx.fill();
    noGlow();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth   = 2;
    ctx.stroke();
    // Spin line
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth   = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(hw * 0.7, 0);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Render particles ────────────────────────────────────────────────────────
function drawParticles() {
  for (const p of particles) {
    const a = Math.max(0, p.life);
    ctx.globalAlpha = a;
    glow(p.col, 5);
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.1, p.r * a), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  noGlow();
}

// ─── Render HUD ───────────────────────────────────────────────────────────────
function drawHUD() {
  noGlow();

  // Score label
  ctx.fillStyle = C.lpink;
  ctx.font      = `bold ${TILE * 0.58}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(`${score}%`, TILE * 0.35, TILE * 0.68);

  // Mode badge
  const mCol = { cube: C.lpurp, ship: C.pink, ball: C.lpink };
  ctx.fillStyle = mCol[gameMode] || C.white;
  ctx.font      = `bold ${TILE * 0.5}px monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(gameMode.toUpperCase(), LW - TILE * 0.35, TILE * 0.68);

  // Progress bar
  const bW  = LW * 0.52;
  const bX  = (LW - bW) * 0.5;
  const bY  = LH - TILE * 0.58;
  const bH  = TILE * 0.2;
  const pct = Math.min(scrollX / LEVEL_LEN, 1);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(bX, bY, bW, bH);

  const pg = ctx.createLinearGradient(bX, 0, bX + bW, 0);
  pg.addColorStop(0, C.purple);
  pg.addColorStop(1, C.pink);
  glow(C.pink, 6);
  ctx.fillStyle = pg;
  ctx.fillRect(bX, bY, bW * pct, bH);
  noGlow();

  // Progress tick
  ctx.fillStyle = '#fff';
  ctx.fillRect(bX + bW * pct - 1.5, bY - 2, 3, bH + 4);
}

// ─── Overlays ─────────────────────────────────────────────────────────────────
function drawOverlay(title, sub, prompt) {
  ctx.fillStyle = 'rgba(6,0,18,0.58)';
  ctx.fillRect(0, 0, LW, LH);

  ctx.textAlign = 'center';
  glow(C.pink, 28);
  ctx.fillStyle = C.lpink;
  ctx.font      = `bold ${Math.min(LW * 0.1, TILE * 1.6)}px monospace`;
  ctx.fillText(title, LW * 0.5, LH * 0.38);
  noGlow();

  if (sub) {
    ctx.fillStyle = C.lpurp;
    ctx.font      = `${Math.min(LW * 0.038, TILE * 0.62)}px monospace`;
    ctx.fillText(sub, LW * 0.5, LH * 0.52);
  }

  const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.0045);
  ctx.globalAlpha = pulse;
  ctx.fillStyle   = C.white;
  ctx.font        = `${Math.min(LW * 0.032, TILE * 0.52)}px monospace`;
  ctx.fillText(prompt, LW * 0.5, LH * 0.66);
  ctx.globalAlpha = 1;

  // Back to jimfolio
  const bkW = TILE * 3.4, bkH = TILE * 0.6;
  const bkX = (LW - bkW) * 0.5, bkY = LH * 0.76;
  backBtn = { x: bkX, y: bkY, w: bkW, h: bkH };
  ctx.fillStyle = 'rgba(199,125,255,0.1)';
  roundRect(bkX, bkY, bkW, bkH, TILE * 0.15);
  ctx.fill();
  ctx.fillStyle = 'rgba(199,125,255,0.45)';
  ctx.font      = `${TILE * 0.4}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('← jimfolio', LW * 0.5, bkY + bkH * 0.66);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackBtn() {
  const bkW = TILE * 3.4, bkH = TILE * 0.65;
  const bkX = TILE * 0.35, bkY = TILE * 0.28;
  backBtn = { x: bkX, y: bkY, w: bkW, h: bkH };
  ctx.fillStyle = 'rgba(199,125,255,0.14)';
  roundRect(bkX, bkY, bkW, bkH, TILE * 0.15);
  ctx.fill();
  ctx.strokeStyle = 'rgba(199,125,255,0.35)';
  ctx.lineWidth   = 1.2;
  roundRect(bkX, bkY, bkW, bkH, TILE * 0.15);
  ctx.stroke();
  ctx.fillStyle   = C.lpurp;
  ctx.font        = `${TILE * 0.42}px monospace`;
  ctx.textAlign   = 'left';
  ctx.fillText('← jimfolio', bkX + TILE * 0.28, bkY + bkH * 0.66);
}

function drawMenu() {
  drawBg();
  drawBackBtn();

  ctx.textAlign = 'center';
  glow(C.pink, 36);
  ctx.fillStyle = C.lpink;
  ctx.font      = `bold ${Math.min(LW * 0.115, TILE * 1.9)}px monospace`;
  ctx.fillText('STANDASH', LW * 0.5, LH * 0.35);
  noGlow();

  ctx.fillStyle = C.lpurp;
  ctx.font      = `${Math.min(LW * 0.037, TILE * 0.62)}px monospace`;
  ctx.fillText('CUBE  ·  SHIP  ·  BALL', LW * 0.5, LH * 0.49);

  // Difficulty buttons
  const bW     = Math.min(LW * 0.22, TILE * 3.8);
  const bH     = TILE * 0.92;
  const bY     = LH * 0.61;
  const bGap   = LW * 0.04;
  const total  = bW * 3 + bGap * 2;
  const startX = (LW - total) * 0.5;
  const radius = TILE * 0.2;

  const diffs  = ['easy', 'medium', 'hard'];
  const dCols  = [C.lpurp, C.pink, '#ff6b6b'];
  menuButtons  = [];

  for (let i = 0; i < 3; i++) {
    const bx  = startX + i * (bW + bGap);
    const sel = difficulty === diffs[i];

    // Fill
    ctx.globalAlpha = sel ? 1 : 0.2;
    if (sel) glow(dCols[i], 14);
    ctx.fillStyle = dCols[i];
    roundRect(bx, bY, bW, bH, radius);
    ctx.fill();
    noGlow();

    // Border
    ctx.globalAlpha = sel ? 0 : 0.7;
    ctx.strokeStyle = dCols[i];
    ctx.lineWidth   = 1.8;
    roundRect(bx, bY, bW, bH, radius);
    ctx.stroke();

    // Label
    ctx.globalAlpha = 1;
    ctx.fillStyle   = sel ? '#fff' : dCols[i];
    ctx.font        = `bold ${TILE * 0.52}px monospace`;
    ctx.textAlign   = 'center';
    ctx.fillText(diffs[i].toUpperCase(), bx + bW * 0.5, bY + bH * 0.63);

    menuButtons.push({ diff: diffs[i], x: bx, y: bY, w: bW, h: bH });
  }
  ctx.globalAlpha = 1;

  // Hint below buttons
  ctx.fillStyle = 'rgba(200,150,255,0.5)';
  ctx.font      = `${Math.min(LW * 0.027, TILE * 0.44)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('tap a difficulty to start', LW * 0.5, bY + bH + TILE * 0.7);
}

function drawPortrait() {
  ctx.fillStyle = '#080115';
  ctx.fillRect(0, 0, LW, LH);
  ctx.textAlign = 'center';
  glow(C.pink, 14);
  ctx.fillStyle = C.lpink;
  ctx.font      = `${Math.min(LW * 0.055, 22)}px monospace`;
  ctx.fillText('Rotate to landscape', LW * 0.5, LH * 0.44);
  noGlow();
  ctx.fillStyle = C.lpurp;
  ctx.font      = `${Math.min(LW * 0.12, 44)}px monospace`;
  ctx.fillText('↻', LW * 0.5, LH * 0.6);
}

// ─── Game loop ────────────────────────────────────────────────────────────────
function loop(ts) {
  const dt = Math.min((ts - (lastTS || ts)) / 1000, 0.05);
  lastTS   = ts;

  // Portrait guard
  if (window.innerWidth < window.innerHeight) {
    canvas.width        = window.innerWidth  * DPR;
    canvas.height       = window.innerHeight * DPR;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    LW = window.innerWidth;
    LH = window.innerHeight;
    drawPortrait();
    requestAnimationFrame(loop);
    return;
  }

  update(dt);

  // ── Render ──────────────────────────────────────────────────────────
  if (state === 'menu') {
    drawMenu();
  } else {
    drawBg();
    drawGround();
    drawObstacles();
    drawParticles();
    drawPlayer();
    drawHUD();

    if (state === 'dead') {
      drawOverlay(
        'DEAD',
        `Score: ${score}%`,
        Date.now() - deathTS > 650 ? 'TAP TO RETRY' : '',
      );
    } else if (state === 'complete') {
      drawOverlay('YOU WIN!', '100% — well played', 'TAP TO PLAY AGAIN');
    }
  }

  requestAnimationFrame(loop);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
canvas.addEventListener('pointerdown', e => { e.preventDefault(); onDown(e.clientX, e.clientY); }, { passive: false });
canvas.addEventListener('pointerup',   e => { e.preventDefault(); onUp(); }, { passive: false });
canvas.addEventListener('pointercancel', () => onUp());

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (state === 'menu') startGame(); // keyboard uses current difficulty
    else onPlayInput();
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') onUp();
});

window.addEventListener('resize', () => {
  resize();
  initStars();
});

resize();
initStars();
particles = [];
obstacles = [];
state     = 'menu';
lastTS    = null;

requestAnimationFrame(loop);
