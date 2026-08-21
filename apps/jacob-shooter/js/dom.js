// DOM handles + canvas sizing. No game logic here.
export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

// World units: the pitch is always 600 units tall; width scales with aspect.
// Rendering is scaled to fill the screen at devicePixelRatio sharpness.
export let W = 960, H = 600, viewScale = 1;
export function resizeCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cssW = window.innerWidth || 960, cssH = window.innerHeight || 600;
  viewScale = (cssH / 600) * dpr;
  W = cssW / (cssH / 600);
  H = 600;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

export const hud = document.getElementById('hud');
export const pickerEl = document.getElementById('picker');
export const cardsEl = document.getElementById('cards');
export const bestlineEl = document.getElementById('bestline');
export const endEl = document.getElementById('endscreen');
export const bannerEl = document.getElementById('wavebanner');
export const bossbar = document.getElementById('bossbar');
export const bosslabel = bossbar.querySelector('.label');
export const bossfill = document.getElementById('bossfill');
export const specialbar = document.getElementById('specialbar');
export const sname = specialbar.querySelector('.sname');
export const sdesc = specialbar.querySelector('.sdesc');
export const sfill = specialbar.querySelector('.sfill');
export const skey = specialbar.querySelector('.skey');
export const shootoutbar = document.getElementById('shootoutbar');
export const skipbtn = document.getElementById('skipbtn');
export const boostbar = document.getElementById('boostbar');
export const levelrow = document.getElementById('levelrow');
export const joyEl = document.getElementById('joy');
export const joyknob = document.getElementById('joyknob');
export const specialbtn = document.getElementById('specialbtn');
export const diffrow = document.getElementById('diffrow');

export const isTouch = ('ontouchstart' in window) ||
  (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
