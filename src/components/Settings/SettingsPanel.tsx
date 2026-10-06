import { useEffect, useState } from 'react';
import type { InvestorType, InvestorTypeId } from '../../config/investorTypes';
import type { WinProbabilities } from '../../config/settingsStorage';
import { ProbabilityControl } from './ProbabilityControl';
import styles from './Settings.module.css';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  /** Spin veya sonuç gösterimi sürerken olasılık kontrolleri kilitli. */
  locked: boolean;
  investorTypes: InvestorType[];
  activeTypeId: InvestorTypeId;
  winProbabilities: WinProbabilities;
  onChangeProbability: (id: InvestorTypeId, value: number) => void;
  onResetProbabilities: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

function useIsFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement !== null);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  return isFullscreen;
}

function toggleFullscreen() {
  // Tarayıcı izin vermezse ya da API yoksa sessizce yoksay; uygulama çalışmaya devam eder.
  try {
    const action = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    action?.catch(() => undefined);
  } catch {
    /* Fullscreen API desteklenmiyor */
  }
}

export function SettingsPanel({
  open,
  onClose,
  locked,
  investorTypes,
  activeTypeId,
  winProbabilities,
  onChangeProbability,
  onResetProbabilities,
  soundEnabled,
  onToggleSound,
}: SettingsPanelProps) {
  const isFullscreen = useIsFullscreen();
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Panel kapanınca veya kilitlenince yarım kalan sıfırlama onayı iptal olur.
  useEffect(() => {
    if (!open || locked) setConfirmingReset(false);
  }, [open, locked]);

  if (!open) return null;

  const confirmReset = () => {
    onResetProbabilities();
    setConfirmingReset(false);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.panelHeader}>
          <h2 id="settings-title" className={styles.panelTitle}>
            Ayarlar
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </header>

        <section className={styles.section} aria-labelledby="probabilities-title">
          <div className={styles.sectionHeader}>
            <h3 id="probabilities-title" className={styles.sectionTitle}>
              Kazanma Olasılıkları
            </h3>
            {!confirmingReset && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setConfirmingReset(true)}
                disabled={locked}
              >
                Varsayılanlara Dön
              </button>
            )}
          </div>

          {confirmingReset && (
            <div className={styles.confirmBox} role="alertdialog" aria-label="Varsayılanlara dönüş onayı">
              <span className={styles.resetQuestion}>
                {investorTypes.map((type) => `${type.name} %${type.winProbability}`).join(', ')} değerlerine dönülsün mü?
              </span>
              <div className={styles.resetActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => setConfirmingReset(false)}>
                  Vazgeç
                </button>
                <button type="button" className={styles.dangerButton} onClick={confirmReset} disabled={locked}>
                  Evet, sıfırla
                </button>
              </div>
            </div>
          )}

          {locked && (
            <p className={styles.lockNotice} role="status">
              Çark dönerken ve sonuç gösterilirken olasılıklar değiştirilemez.
            </p>
          )}

          <div className={styles.typeList}>
            {investorTypes.map((type) => (
              <ProbabilityControl
                key={type.id}
                type={type}
                winProbability={winProbabilities[type.id]}
                active={type.id === activeTypeId}
                disabled={locked}
                onChange={(value) => onChangeProbability(type.id, value)}
              />
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="display-title">
          <h3 id="display-title" className={styles.sectionTitle}>
            Ses ve Ekran
          </h3>
          <div className={styles.tiles}>
            <div className={styles.tile}>
              <span className={styles.rowTitle}>Ses Efektleri</span>
              <button
                type="button"
                role="switch"
                aria-checked={soundEnabled}
                className={soundEnabled ? `${styles.switch} ${styles.switchOn}` : styles.switch}
                onClick={onToggleSound}
              >
                <span className={styles.switchKnob} />
                <span className={styles.switchText}>{soundEnabled ? 'AÇIK' : 'KAPALI'}</span>
              </button>
            </div>
            <div className={styles.tile}>
              <span className={styles.rowTitle}>Tam Ekran</span>
              <button type="button" className={styles.secondaryButton} onClick={toggleFullscreen}>
                {isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekrana Geç'}
              </button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
