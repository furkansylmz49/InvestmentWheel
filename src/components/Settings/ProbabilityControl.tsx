import type { CSSProperties } from 'react';
import type { InvestorType } from '../../config/investorTypes';
import styles from './Settings.module.css';

interface ProbabilityControlProps {
  type: InvestorType;
  winProbability: number;
  active: boolean;
  disabled: boolean;
  onChange: (value: number) => void;
}

/** Tek kontrol: sadece kazanma oranı seçilir, kaybetme oranı 100'den çıkarılarak gösterilir. */
export function ProbabilityControl({ type, winProbability, active, disabled, onChange }: ProbabilityControlProps) {
  const lose = 100 - winProbability;
  const sliderId = `probability-${type.id}`;

  return (
    <div
      className={active ? `${styles.typeCard} ${styles.typeCardActive}` : styles.typeCard}
      style={{ '--accent': type.accent, '--pct': `${winProbability}%` } as CSSProperties}
    >
      <label htmlFor={sliderId} className={styles.typeName}>
        {type.name}
      </label>

      <div className={styles.odds}>
        <div className={styles.oddsWin}>
          <span className={styles.oddsLabel}>KAZANIR</span>
          <span className={styles.oddsValue}>%{winProbability}</span>
        </div>
        <div className={styles.oddsLose}>
          <span className={styles.oddsLabel}>KAYBEDER</span>
          <span className={styles.oddsValue}>%{lose}</span>
        </div>
      </div>

      <input
        id={sliderId}
        className={styles.slider}
        type="range"
        min={0}
        max={100}
        step={1}
        value={winProbability}
        disabled={disabled}
        aria-valuetext={`Kazanma yüzde ${winProbability}, kaybetme yüzde ${lose}`}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </div>
  );
}
