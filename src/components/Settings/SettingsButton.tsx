import styles from './Settings.module.css';

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button type="button" className={styles.trigger} onClick={onClick} aria-label="Ayarlar" title="Ayarlar">
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
        <path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.3 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}
