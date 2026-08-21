// ---------- sound (WebAudio, no assets) ----------
export const sfx = (() => {
  let ac = null, muted = false;
  function acNow() {
    if (muted) return null;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function tone(freq, dur, type, vol, slideTo) {
    const c = acNow(); if (!c) return;
    try {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.05, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    } catch (e) { /* audio unavailable */ }
  }
  return {
    toggleMute() { muted = !muted; return muted; },
    shoot()   { tone(880, 0.05, 'square', 0.02); },
    kill()    { tone(520, 0.12, 'sawtooth', 0.05, 140); },
    hit()     { tone(160, 0.15, 'sawtooth', 0.07, 60); },
    pickup()  { tone(660, 0.09, 'sine', 0.06, 990); },
    volley()  { tone(220, 0.10, 'square', 0.04, 110); },
    charge()  { tone(90, 0.30, 'sawtooth', 0.08, 240); },
    wave()    { tone(440, 0.20, 'triangle', 0.05, 660); },
    special() { tone(740, 0.15, 'triangle', 0.07, 1180); },
    win()     { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.07), i * 140)); },
    lose()    { [400, 300, 200].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sawtooth', 0.06), i * 180)); },
    // low "ugh" when the player takes real damage (detuned pair for body)
    grunt()   { tone(110, 0.12, 'sawtooth', 0.09, 70); tone(113, 0.12, 'sawtooth', 0.05, 72); },
    // two-syllable rallying cry, "HEY-YA!"
    shout()   { tone(300, 0.08, 'square', 0.04, 500);
                setTimeout(() => tone(400, 0.09, 'square', 0.045, 650), 90); },
  };
})();
