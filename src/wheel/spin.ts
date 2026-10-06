/*
 * Spin motoru. Sıra her zaman şudur:
 *   1) Sonuç (WIN/LOSE) olasılığa göre seçilir.
 *   2) O sonuca ait dilimlerden biri seçilir.
 *   3) Dilimin ortasını ibrenin altına getiren dönüş açısı hesaplanır.
 * Animasyon sadece bu açıyı gösterir; sonucu belirlemez.
 *
 * Dönüş: CSS rotate(+x deg) ekranda SAAT YÖNÜNDE döndürür (y ekseni aşağı).
 * Çark R derece döndüğünde, çark üzerindeki θ açısındaki nokta ekranda
 * θ + R konumuna gelir. İbre POINTER_ANGLE'da (tepe, -90°) sabittir.
 */
import type { SegmentOutcome } from '../config/investorTypes.ts';
import type { SegmentGeometry } from './segments.ts';

export const POINTER_ANGLE = -90;
export const SPIN_DURATION_MS = 6500;
/**
 * CSS cubic-bezier kontrol noktaları (Wheel animasyonu ve spin sesi aynı eğriyi kullanır).
 * Hafif hızlanarak başlar (~1.2 sn'de en yüksek hız), uzun ve yumuşak yavaşlar.
 * Sadece hareketin görünüşünü belirler; hedef açı ve sonuç bundan bağımsızdır.
 */
export const SPIN_EASING_POINTS = [0.3, 0.25, 0.1, 1] as const;
const MIN_FULL_TURNS = 5;
const MAX_FULL_TURNS = 7;

export type RandomFn = () => number;

export interface SpinPlan {
  outcome: SegmentOutcome;
  segmentIndex: number;
  /** Mutlak hedef açı (önceki dönüşün üstüne eklenmiş). */
  targetRotation: number;
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** winProbability yüzde (0-100). */
export function pickOutcome(winProbability: number, random: RandomFn = Math.random): SegmentOutcome {
  return random() < winProbability / 100 ? 'win' : 'lose';
}

/** Seçilen sonuca ait dilimlerden birini eşit şansla seçer. */
export function pickSegment(
  segments: SegmentGeometry[],
  outcome: SegmentOutcome,
  random: RandomFn = Math.random,
): SegmentGeometry {
  const candidates = segments.filter((segment) => segment.outcome === outcome);
  // Olasılık %0/%100 iken diğer sonuç hiç seçilmez; yine de boş listeye karşı korun.
  const pool = candidates.length > 0 ? candidates : segments;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}

/** centerAngle'daki dilim ortasını ibreye getiren, currentRotation'dan ileri giden açı. */
export function rotationToCenter(currentRotation: number, centerAngle: number, fullTurns: number): number {
  const targetMod = normalizeAngle(POINTER_ANGLE - centerAngle);
  const delta = normalizeAngle(targetMod - normalizeAngle(currentRotation));
  return currentRotation + fullTurns * 360 + delta;
}

/** Verilen dönüş açısında ibrenin altında kalan dilim (doğrulama için). */
export function segmentAtPointer(segments: SegmentGeometry[], rotation: number): SegmentGeometry | undefined {
  const first = segments[0];
  if (!first) return undefined;
  const offset = normalizeAngle(POINTER_ANGLE - rotation - first.startAngle);
  return segments.find(
    (segment) => offset >= segment.startAngle - first.startAngle && offset < segment.endAngle - first.startAngle,
  );
}

export function planSpin(
  segments: SegmentGeometry[],
  winProbability: number,
  currentRotation: number,
  random: RandomFn = Math.random,
): SpinPlan {
  const outcome = pickOutcome(winProbability, random);
  const segment = pickSegment(segments, outcome, random);
  const fullTurns = MIN_FULL_TURNS + Math.floor(random() * (MAX_FULL_TURNS - MIN_FULL_TURNS + 1));
  return {
    outcome,
    segmentIndex: segment.index,
    targetRotation: rotationToCenter(currentRotation, segment.centerAngle, fullTurns),
  };
}
