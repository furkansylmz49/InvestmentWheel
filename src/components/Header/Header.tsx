import { brand } from '../../config/brand';
import { Logo } from './Logo';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Logo />
      <div className={styles.titleBlock}>
        <p className={styles.eyebrow}>{brand.clubName}</p>
        <h1 className={styles.title}>{brand.appTitle}</h1>
      </div>
    </header>
  );
}
