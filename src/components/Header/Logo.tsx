import { useState } from 'react';
import { brand } from '../../config/brand';
import styles from './Header.module.css';

export function Logo() {
  const [failed, setFailed] = useState(false);
  const plateClass = brand.logoOnLightPlate ? styles.logoPlateLight : styles.logoPlate;

  return (
    <div className={plateClass}>
      {failed ? (
        // Görsel yüklenemezse etkinlik sırasında kırık ikon yerine metin göster.
        <span className={styles.logoFallback}>BAU</span>
      ) : (
        <img
          className={styles.logoImage}
          src={brand.logoSrc}
          alt={brand.clubName}
          width={512}
          height={512}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
