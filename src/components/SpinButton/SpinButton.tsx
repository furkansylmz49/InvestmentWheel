import styles from './SpinButton.module.css';

interface SpinButtonProps {
  disabled?: boolean;
  onSpin: () => void;
}

export function SpinButton({ disabled, onSpin }: SpinButtonProps) {
  return (
    <button type="button" className={styles.button} disabled={disabled} onClick={onSpin}>
      ÇARKI ÇEVİR
    </button>
  );
}
