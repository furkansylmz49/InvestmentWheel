import { useCallback, useEffect, useRef, useState } from 'react';
import type { SegmentOutcome } from '../config/investorTypes';
import { playResult, playSpin } from '../sound/sound';
import { REVEAL_DELAY_MS, REVEAL_MS, RESULT_TOTAL_MS } from './resultTiming';
import type { SegmentGeometry } from './segments';
import { planSpin, segmentAtPointer, SPIN_DURATION_MS } from './spin';

/**
 * idle → spinning → revealing → showingResult → idle
 *
 * spinning:      çark dönüyor
 * revealing:     çark durdu, kısa bekleme + sonuç açılış animasyonu
 * showingResult: sonuç ekranda okunuyor
 * idle:          her şey temiz, yeni spin ve tip seçimi serbest
 */
export type SpinPhase = 'idle' | 'spinning' | 'revealing' | 'showingResult';

export interface SpinResult {
  /** Her spin için artan numara; sonuç bileşeni her spinde sıfırdan kurulur. */
  id: number;
  outcome: SegmentOutcome;
  segmentIndex: number;
}

interface Options {
  soundEnabled: boolean;
}

/**
 * Tek aktif spin garantisi: kilit bir ref'tedir, böylece aynı karede gelen
 * ikinci tıklama React state'i güncellenmeden önce de engellenir. Kilit,
 * sonuç gösterimi bitip idle'a dönülünce açılır.
 * Animasyonlar CSS'tedir; spin başına sadece 4 state güncellemesi olur.
 */
export function useWheelSpin(segments: SegmentGeometry[], winProbability: number, { soundEnabled }: Options) {
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);

  const lockRef = useRef(false);
  const spinningRef = useRef(false);
  const spinIdRef = useRef(0);
  const rotationRef = useRef(0);
  const pendingRef = useRef<SpinResult | null>(null);
  const segmentsRef = useRef(segments);
  const soundRef = useRef(soundEnabled);
  const timersRef = useRef<number[]>([]);

  soundRef.current = soundEnabled;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const finishSpin = useCallback(() => {
    if (!spinningRef.current) return; // transitionend + yedek zamanlayıcı ikisi de gelebilir
    spinningRef.current = false;
    clearTimers();

    const pending = pendingRef.current;
    if (!pending) {
      lockRef.current = false;
      setPhase('idle');
      return;
    }
    if (import.meta.env.DEV) {
      const landed = segmentAtPointer(segmentsRef.current, rotationRef.current);
      if (landed?.index !== pending.segmentIndex || landed.outcome !== pending.outcome) {
        console.warn('[wheel] İbre seçilen dilimi göstermiyor', { pending, landed });
      }
    }

    if (soundRef.current) playResult(pending.outcome, REVEAL_DELAY_MS);
    setResult(pending);
    setPhase('revealing');
    later(() => setPhase('showingResult'), REVEAL_DELAY_MS + REVEAL_MS);
    later(() => {
      pendingRef.current = null;
      setResult(null);
      setPhase('idle');
      lockRef.current = false;
    }, RESULT_TOTAL_MS);
  }, [clearTimers, later]);

  const spin = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    spinningRef.current = true;
    clearTimers();

    const from = rotationRef.current;
    const plan = planSpin(segments, winProbability, from);
    spinIdRef.current += 1;
    pendingRef.current = { id: spinIdRef.current, outcome: plan.outcome, segmentIndex: plan.segmentIndex };
    segmentsRef.current = segments;
    rotationRef.current = plan.targetRotation;

    if (soundRef.current) playSpin(segments, from, plan.targetRotation);
    setResult(null);
    setRotation(plan.targetRotation);
    setPhase('spinning');

    // transitionend gelmezse (sekme arka planda vb.) spin yine de biter.
    later(finishSpin, SPIN_DURATION_MS + 600);
  }, [segments, winProbability, finishSpin, clearTimers, later]);

  useEffect(() => clearTimers, [clearTimers]);

  return { phase, rotation, result, spin, finishSpin };
}
