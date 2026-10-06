import type { CSSProperties } from 'react';
import type { SegmentOutcome } from '../../config/investorTypes';
import { EXIT_MS, REVEAL_DELAY_MS, RESULT_TOTAL_MS } from '../../wheel/resultTiming';
import styles from './ResultReveal.module.css';

interface ResultRevealProps {
  outcome: SegmentOutcome;
}

const copy: Record<SegmentOutcome, { title: string; subtitle: string }> = {
  win: { title: 'ÖDÜL', subtitle: 'Ödül kazandınız!' },
  lose: { title: 'PASS', subtitle: 'PASS' },
};

/**
 * Çark durduktan sonraki sonuç kartı. Hareket sadece CSS'tedir (yumuşak
 * fade + scale); zamanlama resultTiming.ts'ten gelir. Bileşen her spinde
 * yeniden kurulur (key = spin id) ve sonuç bitince DOM'dan kaldırılır.
 */
export function ResultReveal({ outcome }: ResultRevealProps) {
  const { title, subtitle } = copy[outcome];

  const timing = {
    '--reveal-delay': `${REVEAL_DELAY_MS}ms`,
    '--exit-delay': `${RESULT_TOTAL_MS - EXIT_MS}ms`,
    '--exit-duration': `${EXIT_MS}ms`,
  } as CSSProperties;

  return (
    <div className={`${styles.reveal} ${outcome === 'win' ? styles.win : styles.lose}`} style={timing}>
      <div className={styles.anchor}>
        <div className={styles.card} role="status" aria-live="assertive">
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
