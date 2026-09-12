let ctx: AudioContext | null = null;
let unlocked = false;
let disabled = false;

type AudioContextCtor = typeof AudioContext;

function AudioContextClass(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const fromWindow = window.AudioContext;
  const fromWebkit = (
    window as unknown as { webkitAudioContext?: AudioContextCtor }
  ).webkitAudioContext;
  return fromWindow ?? fromWebkit ?? null;
}

/** Create / resume AudioContext only after a tap, never on first paint. */
export function unlockAudio() {
  if (disabled) return;
  try {
    const Ctor = AudioContextClass();
    if (!Ctor) {
      disabled = true;
      return;
    }
    if (!ctx) ctx = new Ctor();
    void ctx.resume().catch(() => {
      disabled = true;
    });
    unlocked = true;
  } catch {
    disabled = true;
    ctx = null;
  }
}

function beep(
  muted: boolean,
  freq: number,
  duration: number,
  type: OscillatorType,
  gain = 0.05,
) {
  if (muted || !unlocked || disabled || !ctx) return;
  try {
    const audio = ctx;
    if (audio.state === "closed") return;
    if (audio.state === "suspended") {
      void audio.resume().catch(() => {});
      return;
    }
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const now = audio.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.setValueAtTime(gain, now + duration * 0.6);
    amp.gain.linearRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration);
    osc.onended = () => {
      try {
        osc.disconnect();
        amp.disconnect();
      } catch {
        /* already torn down */
      }
    };
  } catch {
    /* audio is optional — never crash the page */
  }
}

export function playDive(muted: boolean) {
  beep(muted, 220, 0.12, "square", 0.04);
  window.setTimeout(() => beep(muted, 140, 0.18, "square", 0.03), 80);
}

export function playScore(muted: boolean, points: number) {
  if (points <= 0) {
    beep(muted, 90, 0.25, "triangle", 0.04);
    return;
  }
  const base = 240 + points * 3;
  beep(muted, base, 0.1, "square", 0.045);
  window.setTimeout(() => beep(muted, base * 1.33, 0.14, "square", 0.04), 70);
}

export function playTick(muted: boolean) {
  beep(muted, 880, 0.05, "square", 0.025);
}
