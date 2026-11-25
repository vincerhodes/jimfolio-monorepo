import type { EasterEggId } from "./types";

export interface WorkshopAudio {
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  playDoor: (opening: boolean) => void;
  playShedDoor: (opening: boolean) => void;
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

  const playShedDoor = (opening: boolean): void => {
    try {
      const audio = ensureAudio();
      if (!audio) return;
      const { context: audioContext, master: output } = audio;
      const start = audioContext.currentTime + 0.008;
      const buffer = getNoiseBuffer(audioContext);
      const duration = 1.05;
      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "bandpass";
      filter.Q.value = 2.4;
      filter.frequency.setValueAtTime(opening ? 320 : 480, start);
      filter.frequency.exponentialRampToValueAtTime(opening ? 640 : 240, start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.055, start + 0.09);
      gain.gain.linearRampToValueAtTime(0.03, start + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(output);
      source.start(start);
      source.stop(start + duration + 0.02);
      const creakSteps = 7;
      for (let index = 0; index < creakSteps; index += 1) {
        const step = start + index * 0.13;
        const base = opening ? 140 + index * 26 : 330 - index * 28;
        tone(
          audioContext,
          output,
          base,
          step,
          0.16,
          0.024 - index * 0.001,
          "sawtooth",
          base * (opening ? 1.35 : 0.72),
        );
        tone(
          audioContext,
          output,
          base * 2.7,
          step + 0.01,
          0.11,
          0.009,
          "triangle",
          base * (opening ? 3.1 : 2.1),
        );
      }
      tone(
        audioContext,
        output,
        opening ? 58 : 74,
        start,
        0.95,
        0.014,
        "sine",
        opening ? 82 : 46,
      );
      const latch = start + 0.92;
      noiseBurst(audioContext, output, buffer, latch, 0.05, 0.06, "bandpass", 2400, 2.2);
      noiseBurst(audioContext, output, buffer, latch + 0.07, 0.09, 0.05, "bandpass", 1150, 1.6);
      tone(audioContext, output, 1850, latch, 0.06, 0.02, "square", 1200);
      tone(audioContext, output, 210, latch + 0.06, 0.14, 0.04, "triangle", 95);
      tone(audioContext, output, 760, latch + 0.08, 0.16, 0.014, "sine", 480);
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
      if (id === "bucket") {
        tone(audioContext, output, 1150, start, 0.05, 0.03, "sine", 420);
        tone(audioContext, output, 620, start + 0.045, 0.09, 0.032, "sine", 240);
        tone(audioContext, output, 380, start + 0.05, 0.5, 0.036, "sine", 372);
        tone(audioContext, output, 1120, start + 0.055, 0.4, 0.02, "sine", 1104);
        tone(audioContext, output, 2350, start + 0.06, 0.22, 0.009, "sine", 2320);
        noiseBurst(audioContext, output, buffer, start, 0.03, 0.03, "highpass", 2100, 0.9);
        return;
      }
      if (id === "flowerpot") {
        noiseBurst(audioContext, output, buffer, start, 0.028, 0.04, "bandpass", 1400, 2.0);
        tone(audioContext, output, 520, start, 0.14, 0.04, "triangle", 460);
        tone(audioContext, output, 990, start + 0.004, 0.09, 0.018, "sine", 940);
        noiseBurst(audioContext, output, buffer, start + 0.09, 0.022, 0.026, "bandpass", 1650, 2.0);
        tone(audioContext, output, 585, start + 0.09, 0.12, 0.03, "triangle", 520);
        return;
      }
      if (id === "tbd-box") {
        tone(audioContext, output, 96, start, 0.16, 0.05, "sine", 58);
        noiseBurst(audioContext, output, buffer, start, 0.06, 0.045, "lowpass", 320, 0.8);
        noiseBurst(audioContext, output, buffer, start + 0.05, 0.14, 0.028, "bandpass", 2400, 0.6);
        noiseBurst(audioContext, output, buffer, start + 0.19, 0.11, 0.02, "bandpass", 3100, 0.6);
        tone(audioContext, output, 74, start + 0.2, 0.1, 0.02, "sine", 52);
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
    playShedDoor,
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
