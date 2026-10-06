/*
 * Web Audio ile üretilen sesler: dosya yok, internet yok.
 * Ses tamamen isteğe bağlıdır; burada oluşabilecek her hata yutulur ve
 * uygulama sessiz devam eder. AudioContext ilk spin tıklamasında
 * (kullanıcı etkileşimiyle) açılır, böylece autoplay engeline takılmaz.
 */
import type { SegmentOutcome } from '../config/investorTypes';
import type { SegmentGeometry } from '../wheel/segments';
import { POINTER_ANGLE, SPIN_DURATION_MS, SPIN_EASING_POINTS } from '../wheel/spin';

const MASTER_VOLUME = 0.3;
// Tıklar arasında en az bu kadar boşluk: hızlı dönüşte bile seyrek ve yumuşak.
const MIN_TICK_GAP_S = 0.075;

let context: AudioContext | null = null;
let master: GainNode | null = null;

function getContext(): AudioContext | null {
  try {
    if (!context) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
      master = context.createGain();
      master.gain.value = MASTER_VOLUME;
      master.connect(context.destination);
    }
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    return context;
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  { at, freq, endFreq, duration, type = 'sine', volume = 1, attack = 0.005 }: {
    at: number;
    freq: number;
    endFreq?: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
    attack?: number;
  },
) {
  if (!master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.02);
  // Bitince düğümleri ayır; uzun süre açık kalan sayfada birikmesin.
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function cubicBezier(t: number, p1: number, p2: number): number {
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}

/**
 * Dilim sınırları ibrenin altından geçtiği anlar (saniye).
 * CSS'teki aynı easing eğrisi örneklenir; animasyonla senkron kalır.
 */
export function spinTickTimes(segments: SegmentGeometry[], from: number, to: number): number[] {
  const [x1, y1, x2, y2] = SPIN_EASING_POINTS;
  const duration = SPIN_DURATION_MS / 1000;
  // Sınır b, dönüş R için POINTER_ANGLE - R ≡ b olduğunda ibrededir: R ≡ POINTER_ANGLE - b.
  const marks = segments.map((s) => POINTER_ANGLE - s.startAngle);
  const crossings = (rotation: number) => marks.reduce((sum, m) => sum + Math.floor((rotation - m) / 360), 0);

  const times: number[] = [];
  let previous = crossings(from);
  let lastTime = -Infinity;
  const steps = 1500;
  for (let i = 1; i <= steps; i++) {
    const s = i / steps;
    const rotation = from + (to - from) * cubicBezier(s, y1, y2);
    const current = crossings(rotation);
    if (current !== previous) {
      const time = cubicBezier(s, x1, x2) * duration;
      if (time - lastTime >= MIN_TICK_GAP_S) {
        times.push(time);
        lastTime = time;
      }
      previous = current;
    }
  }
  return times;
}

export function playSpin(segments: SegmentGeometry[], from: number, to: number) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const start = ctx.currentTime + 0.02;
    for (const t of spinTickTimes(segments, from, to)) {
      tone(ctx, { at: start + t, freq: 1250, endFreq: 800, duration: 0.025, type: 'sine', volume: 0.22 });
    }
  } catch {
    /* ses opsiyonel */
  }
}

export function playResult(outcome: SegmentOutcome, delayMs: number) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const at = ctx.currentTime + delayMs / 1000;
    if (outcome === 'win') {
      // ÖDÜL: yumuşak, yükselen üç notalı zil
      [659.25, 830.61, 987.77].forEach((freq, i) => {
        tone(ctx, { at: at + i * 0.11, freq, duration: 0.6, type: 'sine', volume: 0.45, attack: 0.01 });
      });
    } else {
      // PASS: sakin, inen iki kısa nota
      tone(ctx, { at, freq: 440, duration: 0.35, type: 'sine', volume: 0.35, attack: 0.01 });
      tone(ctx, { at: at + 0.16, freq: 349.23, duration: 0.5, type: 'sine', volume: 0.3, attack: 0.01 });
    }
  } catch {
    /* ses opsiyonel */
  }
}
