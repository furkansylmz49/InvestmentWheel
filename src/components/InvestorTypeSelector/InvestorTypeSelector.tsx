import type { CSSProperties } from 'react';
import type { InvestorType, InvestorTypeId } from '../../config/investorTypes';
import type { WinProbabilities } from '../../config/settingsStorage';
import styles from './InvestorTypeSelector.module.css';

interface InvestorTypeSelectorProps {
  types: InvestorType[];
  activeId: InvestorTypeId;
  /** Ayarlar panelindeki güncel kazanma oranları (çark ve motorla aynı kaynak). */
  winProbabilities: WinProbabilities;
  disabled?: boolean;
  onSelect: (id: InvestorTypeId) => void;
}

export function InvestorTypeSelector({ types, activeId, winProbabilities, disabled, onSelect }: InvestorTypeSelectorProps) {
  return (
    <section className={styles.selector} aria-labelledby="investor-type-heading">
      <h2 id="investor-type-heading" className={styles.heading}>
        Yatırımcı Tipi
      </h2>
      <div className={styles.options} role="radiogroup" aria-labelledby="investor-type-heading">
        {types.map((type, index) => {
          const isActive = type.id === activeId;
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              className={isActive ? `${styles.option} ${styles.active}` : styles.option}
              style={{ '--accent': type.accent } as CSSProperties}
              onClick={() => onSelect(type.id)}
            >
              <span className={styles.index}>{index + 1}</span>
              <span className={styles.name}>{type.name}</span>
              <span className={styles.odds}>
                <span className={styles.oddsValue}>{winProbabilities[type.id]}%</span>
                <span className={styles.oddsLabel}>WIN</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
