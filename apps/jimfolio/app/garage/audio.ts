import type { EasterEggId, VehicleId } from "./types";

export interface WorkshopAudio {
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  playDoor: (opening: boolean) => void;
  playBarnDoor: (opening: boolean) => void;
  playBeachHutDoor: (opening: boolean) => void;
  playBarHatch: (opening: boolean) => void;
  playHorn: (vehicle: VehicleId) => void;
  playLightSwitch: (toDay: boolean) => void;
  playHover: () => void;
  playSelect: () => void;
  playEasterEgg: (id: EasterEggId) => void;
  dispose: () => void;
}

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type AudioNodes = {
  context: AudioContext;
  master: GainNode;
};

function envelope(
  parameter: AudioParam,
  start: number,
  peak: number,
  attack: number,
  end: number,
): void {
  parameter.cancelScheduledValues(start);
  parameter.setValueAtTime(0.0001, start);
  parameter.linearRampToValueAtTime(peak, start + attack);
  parameter.exponentialRampToValueAtTime(0.0001, end);
}

function tone(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  endFrequency?: number,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  }
  envelope(gain.gain, start, volume, Math.min(0.008, duration * 0.2), start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noiseBurst(
  context: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
  start: number,
  duration: number,
  volume: number,
  filterType: BiquadFilterType,
  frequency: number,
  q = 0.8,
): void {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.value = q;
  envelope(gain.gain, start, volume, Math.min(0.004, duration * 0.2), start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start);
  source.stop(start + duration + 0.02);
}

export function createWorkshopAudio(): WorkshopAudio {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let muted = false;
  let disposed = false;
  let lastHover = -1000;

  const ensureAudio = (): AudioNodes | null => {
    if (disposed || muted || typeof window === "undefined") return null;
    try {
      if (!context || !master) {
        const audioWindow = window as AudioWindow;
        const AudioContextConstructor = window.AudioContext || audioWindow.webkitAudioContext;
        if (!AudioContextConstructor) return null;
        context = new AudioContextConstructor();
        master = context.createGain();
        master.gain.value = 0.12;
        master.connect(context.destination);
      }
      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }
      return { context, master };
    } catch {
      return null;
    }
  };

  const getNoiseBuffer = (audioContext: AudioContext): AudioBuffer => {
    if (noiseBuffer) return noiseBuffer;
    const length = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    let state = 0x6d2b79f5;
    for (let index = 0; index < length; index += 1) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      samples[index] = ((state >>> 0) / 2147483648 - 1) * 0.8;
    }
    noiseBuffer = buffer;
    return buffer;
  };

  const playDoor = (opening: boolean): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.008;
      const duration = 0.9;
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = getNoiseBuffer(audioContext);
      source.loop = true;
      filter.type = "lowpass";
      filter.Q.value = 1.1;
      filter.frequency.setValueAtTime(opening ? 135 : 260, start);
      filter.frequency.exponentialRampToValueAtTime(opening ? 310 : 120, start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.06);
      gain.gain.linearRampToValueAtTime(0.045, start + 0.66);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      source.start(start);
      source.stop(start + duration + 0.02);
      tone(
        audioContext,
        output,
        opening ? 43 : 55,
        start,
        0.82,
        0.018,
        "sine",
        opening ? 61 : 39,
      );
      const latch = start + 0.76;
      noiseBurst(
        audioContext,
        output,
        getNoiseBuffer(audioContext),
        latch,
        0.12,
        0.065,
        "bandpass",
        780,
        1.5,
      );
      tone(audioContext, output, 145, latch, 0.15, 0.045, "triangle", 82);
      tone(audioContext, output, 690, latch + 0.012, 0.2, 0.018, "sine", 410);
    } catch {
      return;
    }
  };

  const playBarnDoor = (opening: boolean): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.008;
      const buffer = getNoiseBuffer(audioContext);
      const duration = 1.25;
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.Q.value = 1.4;
      filter.frequency.setValueAtTime(opening ? 210 : 320, start);
      filter.frequency.exponentialRampToValueAtTime(opening ? 430 : 170, start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.075, start + 0.11);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.95);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      source.start(start);
      source.stop(start + duration + 0.02);
      const creakSteps = 8;
      for (let index = 0; index < creakSteps; index += 1) {
        const step = start + index * 0.14;
        const base = opening ? 92 + index * 17 : 218 - index * 19;
        tone(
          audioContext,
          output,
          base,
          step,
          0.19,
          0.028 - index * 0.001,
          "sawtooth",
          base * (opening ? 1.28 : 0.74),
        );
        tone(
          audioContext,
          output,
          base * 2.4,
          step + 0.012,
          0.13,
          0.01,
          "triangle",
          base * (opening ? 2.9 : 1.9),
        );
      }
      tone(
        audioContext,
        output,
        opening ? 44 : 56,
        start,
        1.1,
        0.02,
        "sine",
        opening ? 62 : 38,
      );
      for (let leaf = 0; leaf < 2; leaf += 1) {
        const latch = start + 1.06 + leaf * 0.16;
        noiseBurst(audioContext, output, buffer, latch, 0.05, 0.07, "bandpass", 1900, 2.0);
        noiseBurst(audioContext, output, buffer, latch + 0.06, 0.1, 0.055, "bandpass", 900, 1.5);
        tone(audioContext, output, 1500, latch, 0.06, 0.022, "square", 980);
        tone(audioContext, output, 150, latch + 0.05, 0.16, 0.05, "triangle", 68);
        tone(audioContext, output, 620, latch + 0.07, 0.18, 0.016, "sine", 390);
      }
    } catch {
      return;
    }
  };

  const playBeachHutDoor = (opening: boolean): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.008;
      const buffer = getNoiseBuffer(audioContext);
      const breezeDuration = 1.1;
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.Q.value = 0.7;
      filter.frequency.setValueAtTime(opening ? 520 : 640, start);
      filter.frequency.exponentialRampToValueAtTime(opening ? 760 : 380, start + breezeDuration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.028, start + 0.18);
      gain.gain.linearRampToValueAtTime(0.016, start + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + breezeDuration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      source.start(start);
      source.stop(start + breezeDuration + 0.02);
      const chimes = [1567.98, 2093.0, 1760.0, 2637.02, 1975.53];
      const offsets = opening ? [0, 0.09, 0.2, 0.32, 0.46] : [0.36, 0.24, 0.16, 0.07, 0];
      for (let index = 0; index < chimes.length; index += 1) {
        const at = start + 0.04 + offsets[index];
        tone(audioContext, output, chimes[index], at, 0.42, 0.02, "sine", chimes[index] * 0.985);
        tone(audioContext, output, chimes[index] * 2, at + 0.006, 0.2, 0.006, "sine");
      }
      tone(audioContext, output, opening ? 88 : 110, start, 0.3, 0.02, "triangle", opening ? 62 : 74);
      return;
    } catch {
      return;
    }
  };

  const playBarHatch = (opening: boolean): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.008;
      const buffer = getNoiseBuffer(audioContext);
      const hissDuration = 0.85;
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "bandpass";
      filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(opening ? 2400 : 1700, start);
      filter.frequency.exponentialRampToValueAtTime(opening ? 1300 : 2600, start + hissDuration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.05, start + 0.08);
      gain.gain.linearRampToValueAtTime(0.03, start + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + hissDuration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      source.start(start);
      source.stop(start + hissDuration + 0.02);
      tone(audioContext, output, opening ? 64 : 82, start, 0.7, 0.02, "sawtooth", opening ? 92 : 52);
      const bell = start + 0.82;
      noiseBurst(audioContext, output, buffer, bell, 0.02, 0.045, "highpass", 2800, 0.9);
      tone(audioContext, output, 988, bell, 0.9, 0.045, "sine", 981);
      tone(audioContext, output, 1976, bell + 0.004, 0.6, 0.02, "sine", 1962);
      tone(audioContext, output, 2960, bell + 0.006, 0.38, 0.009, "sine", 2938);
      return;
    } catch {
      return;
    }
  };

  const playHorn = (vehicle: VehicleId): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.006;
      const buffer = getNoiseBuffer(audioContext);
      if (vehicle === "rover") {
        tone(audioContext, output, 311, start, 0.42, 0.06, "sawtooth", 302);
        tone(audioContext, output, 392, start, 0.42, 0.05, "sawtooth", 382);
        tone(audioContext, output, 155.5, start, 0.4, 0.024, "square", 150);
        tone(audioContext, output, 622, start, 0.34, 0.014, "sine", 606);
        noiseBurst(audioContext, output, buffer, start, 0.03, 0.02, "bandpass", 1200, 1.2);
        return;
      }
      if (vehicle === "vespa") {
        tone(audioContext, output, 1046.5, start, 0.11, 0.05, "square", 1018);
        tone(audioContext, output, 2093, start + 0.004, 0.09, 0.016, "sine", 2036);
        tone(audioContext, output, 1046.5, start + 0.16, 0.14, 0.055, "square", 1012);
        tone(audioContext, output, 2093, start + 0.164, 0.11, 0.018, "sine", 2030);
        noiseBurst(audioContext, output, buffer, start, 0.025, 0.018, "highpass", 2400, 0.9);
        return;
      }
      for (let index = 0; index < 5; index += 1) {
        const chug = start + index * 0.15;
        const chugBase = 46 + index * 3;
        tone(audioContext, output, chugBase, chug, 0.13, 0.05, "sawtooth", chugBase * 0.8);
        noiseBurst(audioContext, output, buffer, chug, 0.06, 0.026, "lowpass", 240 + index * 26, 0.9);
      }
      tone(audioContext, output, 233, start + 0.1, 0.65, 0.05, "sawtooth", 226);
      tone(audioContext, output, 116.5, start + 0.1, 0.62, 0.028, "square", 112);
      tone(audioContext, output, 466, start + 0.1, 0.5, 0.016, "sine", 452);
      noiseBurst(audioContext, output, buffer, start + 0.1, 0.04, 0.02, "bandpass", 900, 1.1);
      return;
    } catch {
      return;
    }
  };

  const playLightSwitch = (toDay: boolean): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.005;
      const buffer = getNoiseBuffer(audioContext);
      noiseBurst(audioContext, output, buffer, start, 0.028, 0.055, "highpass", 1450, 0.7);
      noiseBurst(audioContext, output, buffer, start + 0.065, 0.022, 0.038, "highpass", 1900, 0.7);
      tone(audioContext, output, 1180, start, 0.025, 0.017, "square", 680);
      tone(audioContext, output, 930, start + 0.065, 0.025, 0.013, "square", 520);
      tone(
        audioContext,
        output,
        toDay ? 72 : 96,
        start + 0.04,
        0.38,
        0.014,
        "sine",
        toDay ? 108 : 64,
      );
    } catch {
      return;
    }
  };

  const playHover = (): void => {
    const now = Date.now();
    if (now - lastHover < 80) return;
    lastHover = now;
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.003;
      noiseBurst(
        audioContext,
        output,
        getNoiseBuffer(audioContext),
        start,
        0.018,
        0.024,
        "bandpass",
        1120,
        1.8,
      );
      tone(audioContext, output, 510, start, 0.026, 0.018, "triangle", 340);
    } catch {
      return;
    }
  };

  const playSelect = (): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.006;
      noiseBurst(
        audioContext,
        output,
        getNoiseBuffer(audioContext),
        start,
        0.025,
        0.025,
        "bandpass",
        850,
        1.2,
      );
      tone(audioContext, output, 392, start, 0.2, 0.042, "sine", 405);
      tone(audioContext, output, 587.33, start + 0.075, 0.28, 0.038, "sine", 605);
      tone(audioContext, output, 196, start, 0.13, 0.016, "triangle", 185);
    } catch {
      return;
    }
  };

  const playEasterEgg = (id: EasterEggId): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.006;
      const buffer = getNoiseBuffer(audioContext);
      if (id === "wrench") {
        noiseBurst(audioContext, output, buffer, start, 0.045, 0.045, "highpass", 1800, 1.1);
        tone(audioContext, output, 913, start, 0.72, 0.046, "sine", 905);
        tone(audioContext, output, 1387, start + 0.004, 0.58, 0.028, "sine", 1372);
        tone(audioContext, output, 2173, start + 0.008, 0.38, 0.015, "sine", 2140);
        tone(audioContext, output, 176, start, 0.12, 0.024, "triangle", 105);
        return;
      }
      if (id === "vise") {
        tone(audioContext, output, 72, start, 0.5, 0.015, "sawtooth", 128);
        for (let index = 0; index < 10; index += 1) {
          const tick = start + index * 0.043;
          noiseBurst(
            audioContext,
            output,
            buffer,
            tick,
            0.024,
            0.035 - index * 0.0012,
            "bandpass",
            1050 + index * 85,
            1.6,
          );
          tone(
            audioContext,
            output,
            165 + index * 13,
            tick,
            0.03,
            0.011,
            "square",
            110 + index * 8,
          );
        }
        tone(audioContext, output, 240, start + 0.44, 0.13, 0.022, "triangle", 125);
        return;
      }
      if (id === "tractor") {
        for (let index = 0; index < 7; index += 1) {
          const chug = start + index * 0.16;
          const chugBase = 52 + index * 4;
          tone(audioContext, output, chugBase, chug, 0.14, 0.05, "sawtooth", chugBase * 0.82);
          noiseBurst(audioContext, output, buffer, chug, 0.07, 0.028, "lowpass", 260 + index * 30, 0.9);
        }
        tone(audioContext, output, 58, start, 1.15, 0.03, "sawtooth", 118);
        tone(audioContext, output, 29, start, 1.15, 0.024, "sine", 59);
        const horn = start + 1.2;
        tone(audioContext, output, 392, horn, 0.22, 0.05, "sawtooth", 388);
        tone(audioContext, output, 784, horn, 0.2, 0.02, "sine", 776);
        tone(audioContext, output, 523.25, horn + 0.24, 0.42, 0.055, "sawtooth", 516);
        tone(audioContext, output, 1046.5, horn + 0.24, 0.36, 0.02, "sine", 1032);
        noiseBurst(audioContext, output, buffer, horn, 0.03, 0.02, "bandpass", 1400, 1.2);
        return;
      }
      if (id === "bell") {
        noiseBurst(audioContext, output, buffer, start, 0.02, 0.04, "highpass", 2600, 0.9);
        tone(audioContext, output, 220, start, 1.6, 0.03, "sine", 218);
        tone(audioContext, output, 587, start, 1.4, 0.05, "sine", 583);
        tone(audioContext, output, 880, start + 0.004, 1.1, 0.034, "sine", 874);
        tone(audioContext, output, 1244, start + 0.006, 0.8, 0.02, "sine", 1236);
        tone(audioContext, output, 1760, start + 0.008, 0.5, 0.011, "sine", 1748);
        tone(audioContext, output, 296, start + 0.32, 1.2, 0.014, "sine", 294);
        return;
      }
      if (id === "chicken") {
        noiseBurst(audioContext, output, buffer, start, 0.03, 0.028, "bandpass", 1900, 1.4);
        tone(audioContext, output, 740, start, 0.09, 0.045, "triangle", 420);
        tone(audioContext, output, 1480, start + 0.006, 0.06, 0.014, "sine", 860);
        noiseBurst(audioContext, output, buffer, start + 0.14, 0.025, 0.024, "bandpass", 2200, 1.4);
        tone(audioContext, output, 880, start + 0.14, 0.12, 0.05, "triangle", 460);
        tone(audioContext, output, 1760, start + 0.15, 0.08, 0.015, "sine", 920);
        return;
      }
      if (id === "old-shed") {
        for (let index = 0; index < 6; index += 1) {
          const step = start + index * 0.16;
          const base = 118 - index * 9;
          tone(audioContext, output, base, step, 0.22, 0.03, "sawtooth", base * 0.72);
          tone(audioContext, output, base * 2.6, step + 0.014, 0.15, 0.011, "triangle", base * 1.8);
        }
        tone(audioContext, output, 52, start, 1.0, 0.022, "sine", 36);
        noiseBurst(audioContext, output, buffer, start + 0.88, 0.09, 0.05, "bandpass", 720, 1.4);
        tone(audioContext, output, 140, start + 0.9, 0.14, 0.04, "triangle", 66);
        return;
      }
      if (id === "lantern") {
        noiseBurst(audioContext, output, buffer, start, 0.5, 0.012, "lowpass", 620, 0.6);
        const chimes = [1760.0, 2217.46, 1975.53, 2637.02];
        for (let index = 0; index < chimes.length; index += 1) {
          const at = start + index * 0.11;
          tone(audioContext, output, chimes[index], at, 0.5, 0.022, "sine", chimes[index] * 0.98);
          tone(audioContext, output, chimes[index] * 2, at + 0.006, 0.22, 0.006, "sine");
        }
        return;
      }
      if (id === "surfboard") {
        noiseBurst(audioContext, output, buffer, start, 0.55, 0.045, "lowpass", 520, 0.6);
        noiseBurst(audioContext, output, buffer, start + 0.42, 0.3, 0.03, "bandpass", 1400, 0.9);
        tone(audioContext, output, 96, start, 0.5, 0.02, "sine", 58);
        noiseBurst(audioContext, output, buffer, start + 0.7, 0.02, 0.028, "highpass", 2600, 1.0);
        tone(audioContext, output, 660, start + 0.7, 0.12, 0.03, "triangle", 380);
        return;
      }
      if (id === "grill") {
        noiseBurst(audioContext, output, buffer, start, 0.9, 0.05, "highpass", 3400, 0.5);
        noiseBurst(audioContext, output, buffer, start + 0.06, 0.5, 0.03, "bandpass", 1800, 0.8);
        for (let index = 0; index < 5; index += 1) {
          const pop = start + 0.12 + index * 0.14;
          noiseBurst(audioContext, output, buffer, pop, 0.02, 0.028, "bandpass", 2200 + index * 180, 1.6);
        }
        tone(audioContext, output, 74, start, 0.4, 0.018, "triangle", 52);
        return;
      }
      if (id === "tap") {
        noiseBurst(audioContext, output, buffer, start, 0.85, 0.04, "bandpass", 2600, 0.7);
        noiseBurst(audioContext, output, buffer, start + 0.08, 0.6, 0.025, "highpass", 4200, 0.5);
        for (let index = 0; index < 4; index += 1) {
          const fizz = start + 0.18 + index * 0.16;
          noiseBurst(audioContext, output, buffer, fizz, 0.05, 0.02, "bandpass", 3200 + index * 240, 1.4);
        }
        tone(audioContext, output, 987, start + 0.86, 0.5, 0.032, "sine", 980);
        tone(audioContext, output, 1975.5, start + 0.864, 0.32, 0.012, "sine", 1960);
        return;
      }
      noiseBurst(audioContext, output, buffer, start, 0.032, 0.033, "bandpass", 980, 1.5);
      tone(audioContext, output, 659.25, start, 0.32, 0.037, "sine", 650);
      tone(audioContext, output, 1318.5, start, 0.18, 0.012, "sine");
      noiseBurst(audioContext, output, buffer, start + 0.22, 0.032, 0.03, "bandpass", 1120, 1.5);
      tone(audioContext, output, 880, start + 0.22, 0.42, 0.04, "sine", 870);
      tone(audioContext, output, 1760, start + 0.22, 0.24, 0.011, "sine");
    } catch {
      return;
    }
  };

  return {
    isMuted: () => muted,
    setMuted: (nextMuted: boolean) => {
      muted = nextMuted;
      if (!context || !master || disposed) return;
      try {
        master.gain.setTargetAtTime(muted ? 0 : 0.12, context.currentTime, 0.015);
      } catch {
        return;
      }
    },
    playDoor,
    playBarnDoor,
    playBeachHutDoor,
    playBarHatch,
    playHorn,
    playLightSwitch,
    playHover,
    playSelect,
    playEasterEgg,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      try {
        master?.disconnect();
        if (context) void context.close().catch(() => undefined);
      } catch {
        context = null;
        master = null;
        noiseBuffer = null;
        return;
      }
      context = null;
      master = null;
      noiseBuffer = null;
    },
  };
}
