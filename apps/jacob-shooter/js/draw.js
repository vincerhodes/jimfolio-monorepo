// All canvas drawing: footballers, balls, portraits, pitch, shootout scene, main draw().
import { ctx, W, H, viewScale } from './dom.js';
import { KITS } from '../data.js';
import { G, POWERUP_TYPES, SO_GOAL_HALF, SO_GOAL_Y, SO_KEEPER_Y, SO_SPOT_Y, SO_ZONE_DX } from './state.js';

// ---------- drawing ----------
export function drawFootballer(c, x, y, r, kit, skin, facing, bob, portrait = false) {
  c.save();
  // shadow
  c.fillStyle = 'rgba(0,0,0,.3)';
  c.beginPath(); c.ellipse(x, y + r * 0.75, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); c.fill();
  const lift = portrait ? 0 : Math.abs(Math.sin(bob)) * r * 0.12;
  y -= lift;

  if (!portrait) {
    // running legs: hip → knee → boot, alternating strides aligned to facing
    const step = Math.sin(bob);
    const fx = Math.cos(facing), fy = Math.sin(facing);
    const px = -fy, py = fx; // perpendicular
    c.lineCap = 'round';
    for (const s of [1, -1]) {
      const fwd = step * s * r * 0.7;
      const hipX = x + px * s * r * 0.5, hipY = y + py * s * r * 0.5;
      const footX = x + px * s * r * 0.85 + fx * fwd;
      const footY = y + py * s * r * 0.85 + fy * fwd;
      const kneeX = (hipX + footX) / 2 - fx * r * 0.2; // knee trails backward
      const kneeY = (hipY + footY) / 2 - fy * r * 0.2;
      c.strokeStyle = '#1a1a1a'; c.lineWidth = r * 0.28;
      c.beginPath(); c.moveTo(hipX, hipY); c.lineTo(kneeX, kneeY); c.lineTo(footX, footY); c.stroke();
      // boot: white with dark outline so it pops on the green pitch
      c.fillStyle = '#f5f5f5';
      c.beginPath(); c.ellipse(footX, footY, r * 0.34, r * 0.22, facing, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#111'; c.lineWidth = Math.max(1.5, r * 0.08);
      c.stroke();
    }
  }

  // body group, with a slight running sway
  c.save();
  c.translate(x, y);
  if (!portrait) c.rotate(Math.sin(bob) * 0.08);
  // shoulders / shirt
  c.fillStyle = kit.shirt;
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  // trim ring (sleeves/collar accent)
  c.strokeStyle = kit.trim; c.lineWidth = Math.max(2, r * 0.16);
  c.beginPath(); c.arc(0, 0, r * 0.82, 0, Math.PI * 2); c.stroke();
  // head
  c.fillStyle = skin;
  c.beginPath(); c.arc(0, 0, r * 0.45, 0, Math.PI * 2); c.fill();
  // hair (dark patch on the back of the head)
  c.fillStyle = '#1a1210';
  c.beginPath();
  c.arc(-Math.cos(facing) * r * 0.18, -Math.sin(facing) * r * 0.18,
    r * 0.3, facing + Math.PI * 0.65, facing + Math.PI * 1.35);
  c.fill();
  c.restore();

  // facing indicator (boot / barrel)
  if (!portrait) {
    c.strokeStyle = '#222'; c.lineWidth = Math.max(3, r * 0.22);
    c.beginPath(); c.moveTo(x + Math.cos(facing) * r * 0.5, y + Math.sin(facing) * r * 0.5);
    c.lineTo(x + Math.cos(facing) * (r + 10), y + Math.sin(facing) * (r + 10)); c.stroke();
  }
  c.restore();
}

// Football: white ball, black pentagon + patches, spins as it flies.
export function drawFootball(c, x, y, r, rot) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#222'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#222';
  // center pentagon
  c.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r * 0.38, py = Math.sin(a) * r * 0.38;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath(); c.fill();
  // outer patches
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + Math.PI / 5;
    c.beginPath();
    c.arc(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, r * 0.28, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

// Front-facing kit portrait for the picker: head + shirt with trim.
export function drawPortrait(c, cx, cy, r, kit, skin) {
  c.save();
  // shadow
  c.fillStyle = 'rgba(0,0,0,.3)';
  c.beginPath(); c.ellipse(cx, cy + r * 2.4, r * 1.5, r * 0.3, 0, 0, Math.PI * 2); c.fill();
  // sleeves with trim cuffs
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * r * 1.25, cy + r * 1.15);
    c.rotate(s * 0.45);
    c.fillStyle = kit.shirt;
    c.fillRect(-r * 0.3, -r * 0.3, r * 0.6, r * 1.1);
    c.fillStyle = kit.trim;
    c.fillRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.25);
    c.restore();
  }
  // torso
  c.fillStyle = kit.shirt;
  c.fillRect(cx - r * 1.05, cy + r * 0.55, r * 2.1, r * 1.8);
  // collar
  c.fillStyle = kit.trim;
  c.fillRect(cx - r * 1.05, cy + r * 0.55, r * 2.1, r * 0.22);
  // head
  c.fillStyle = skin;
  c.beginPath(); c.arc(cx, cy, r * 0.62, 0, Math.PI * 2); c.fill();
  // hair cap
  c.fillStyle = '#1a1210';
  c.beginPath(); c.arc(cx, cy - r * 0.12, r * 0.58, Math.PI, Math.PI * 2); c.fill();
  // eyes
  for (const s of [-1, 1]) {
    c.beginPath(); c.arc(cx + s * r * 0.22, cy + r * 0.1, r * 0.06, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

export function drawPitch() {
  ctx.fillStyle = '#0f7a2f'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.04)';
  for (let i = 0; i < 10; i += 2) ctx.fillRect(i * W / 10, 0, W / 10, H);
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.beginPath(); ctx.moveTo(W / 2, 30); ctx.lineTo(W / 2, H - 30); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 70, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeRect(30, H / 2 - 110, 90, 220);
  ctx.strokeRect(W - 120, H / 2 - 110, 90, 220);
}

export function draw() {
  ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);
  ctx.save();
  if (G.shake > 0) {
    ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
  }
  drawPitch();

  for (const p of G.particles) {
    ctx.globalAlpha = Math.max(0, p.life * 2.2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  for (const f of G.flashes) {
    ctx.globalAlpha = f.life / 0.06;
    ctx.fillStyle = '#ffe97a';
    ctx.beginPath(); ctx.arc(f.x, f.y, 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (G.mode === 'shootout' && G.shootout) {
    drawShootout();
  } else if (G.running || G.won || G.lost) {
    // power-ups: bold disc + pulsing glow ring + name label
    for (const p of G.powerups) {
      const t = POWERUP_TYPES[p.type];
      const py = p.y + Math.sin(p.bob) * 3;
      if (p.life < 3 && Math.floor(p.life * 6) % 2 === 0) continue; // blink when expiring
      const glowR = 20 + Math.sin(p.bob * 1.5) * 3;
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = t.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, py, glowR, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = t.color;
      ctx.beginPath(); ctx.arc(p.x, py, 15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = '13px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(t.glyph, p.x, py + 1);
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 9px Arial';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      ctx.strokeText(t.label, p.x, py + 28);
      ctx.fillText(t.label, p.x, py + 28);
    }

    for (const e of G.enemies) {
      const kit = e.hitFlash > 0 ? { shirt: '#fff', trim: '#fff' } : e.kit;
      drawFootballer(ctx, e.x, e.y, e.r, kit, e.skin, e.facing, e.bob);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      ctx.strokeText(e.name, e.x, e.y - e.r - 8);
      ctx.fillText(e.name, e.x, e.y - e.r - 8);
      if (e.hp < e.maxHp) {
        ctx.fillStyle = '#000a';
        ctx.fillRect(e.x - 14, e.y - e.r - 5, 28, 3);
        ctx.fillStyle = '#4f4';
        ctx.fillRect(e.x - 14, e.y - e.r - 5, 28 * (e.hp / e.maxHp), 3);
      }
    }

    if (G.boss) {
      const kit = G.boss.hitFlash > 0 ? { shirt: '#fff', trim: '#fff' } : G.boss.kit;
      drawFootballer(ctx, G.boss.x, G.boss.y, G.boss.r, kit, G.boss.skin, G.boss.facing, G.boss.bob);
      ctx.fillStyle = G.boss.hp < G.boss.maxHp / 2 ? '#ff5b5b' : '#fff';
      ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 4;
      const label = G.boss.name.toUpperCase();
      ctx.strokeText(label, G.boss.x, G.boss.y - G.boss.r - 10);
      ctx.fillText(label, G.boss.x, G.boss.y - G.boss.r - 10);
    }

    // player bullets = spinning footballs
    for (const b of G.bullets) {
      drawFootball(ctx, b.x, b.y, b.r, (b.x + b.y) * 0.05);
    }
    // enemy bullets stay glowing blue for readability
    ctx.fillStyle = '#9fd0ff';
    for (const b of G.enemyBullets) {
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1c2c5b'; ctx.lineWidth = 2; ctx.stroke();
    }

    // player
    if (G.player) {
      ctx.save();
      if (G.player.invuln > 0 && Math.floor(G.player.invuln * 12) % 2 === 0) ctx.globalAlpha = 0.4;
      drawFootballer(ctx, G.player.x, G.player.y, G.player.r, KITS.arsenal, G.player.skin, G.player.facing, G.player.bob);
      ctx.restore();
      if (G.player.shieldT > 0) {
        ctx.strokeStyle = 'rgba(106,155,255,.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(G.player.x, G.player.y, G.player.r + 8, 0, Math.PI * 2); ctx.stroke();
      }
      if (G.player.turboT > 0) {
        ctx.strokeStyle = 'rgba(74,227,255,.6)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(G.player.x, G.player.y, G.player.r + 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3;
      ctx.strokeText(G.player.name, G.player.x, G.player.y - G.player.r - 8);
      ctx.fillText(G.player.name, G.player.x, G.player.y - G.player.r - 8);
    }
  }

  if (G.vignette > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H / 3, W / 2, H / 2, H);
    g.addColorStop(0, 'rgba(255,0,0,0)');
    g.addColorStop(1, `rgba(255,0,0,${G.vignette})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

// Shootout scene: goal across the top. Player kicks: boss-kit keeper on the line,
// player on the spot. AI kicks: shooter in the boss's kit on the spot, player keeps goal.
export function drawShootout() {
  const s = G.shootout;
  const gl = W / 2 - SO_GOAL_HALF, gr = W / 2 + SO_GOAL_HALF;
  // net
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1;
  for (let x = gl; x <= gr; x += 16) {
    ctx.beginPath(); ctx.moveTo(x, SO_GOAL_Y - 36); ctx.lineTo(x, SO_GOAL_Y); ctx.stroke();
  }
  // posts + crossbar
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(gl, SO_GOAL_Y); ctx.lineTo(gl, SO_GOAL_Y - 36);
  ctx.lineTo(gr, SO_GOAL_Y - 36); ctx.lineTo(gr, SO_GOAL_Y);
  ctx.stroke();
  // penalty spot
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.arc(W / 2, SO_SPOT_Y, 4, 0, Math.PI * 2); ctx.fill();

  const savePhase = s.phase === 'saveaim' || s.phase === 'saveflight' || s.phase === 'saveresult';
  if (savePhase) {
    // AI shooter wearing the just-beaten boss's kit
    drawFootballer(ctx, W / 2, H - 60, 20, s.keeperKit, '#e0ac69', -Math.PI / 2, G.gameClock * 8);
    // player keeps goal on the line
    if (G.player) drawFootballer(ctx, s.keeperX, SO_KEEPER_Y, G.player.r, KITS.arsenal, G.player.skin, Math.PI / 2, G.player.bob);
    // zone dots along the line — the keeper's zone glows gold
    for (const z of [-1, 0, 1]) {
      const zx = W / 2 + z * SO_ZONE_DX;
      ctx.fillStyle = z === s.keeperZone ? '#ffd24a' : 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.arc(zx, SO_GOAL_Y + 22, z === s.keeperZone ? 6 : 4, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // keeper wearing the just-beaten boss's kit
    drawFootballer(ctx, s.keeperX, SO_KEEPER_Y, 20, s.keeperKit, '#e0ac69', Math.PI / 2, G.gameClock * 8);
    // player behind the ball
    if (G.player) drawFootballer(ctx, W / 2, H - 60, G.player.r, KITS.arsenal, G.player.skin, -Math.PI / 2, G.player.bob);
  }

  // ball (spins while in flight)
  const flying = s.phase === 'flight' || s.phase === 'saveflight';
  drawFootball(ctx, s.ballX, s.ballY, 8, flying ? G.gameClock * 24 : 0);
  // aim marker on the goal line (gold = your kick, red = incoming)
  if (s.phase === 'aim' || s.phase === 'saveaim') {
    ctx.strokeStyle = s.phase === 'aim' ? '#ffd24a' : '#ff5b5b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.aimX, SO_GOAL_Y + 6, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s.aimX - 18, SO_GOAL_Y + 6); ctx.lineTo(s.aimX + 18, SO_GOAL_Y + 6);
    ctx.moveTo(s.aimX, SO_GOAL_Y - 12); ctx.lineTo(s.aimX, SO_GOAL_Y + 24);
    ctx.stroke();
  }
  // GOAL/SAVED/CONCEDED/result feedback
  if (s.result) {
    ctx.font = 'bold 42px Arial'; ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 6;
    ctx.fillStyle = s.resultGoal ? '#ffd700' : '#ff5b5b';
    ctx.strokeText(s.result, W / 2, H / 2);
    ctx.fillText(s.result, W / 2, H / 2);
  }
}
