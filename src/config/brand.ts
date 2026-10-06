/*
 * Marka ayarları. Logoyu değiştirmek için src/assets/brand/club-logo.png
 * dosyasını aynı adla değiştirmek yeterli (kare, en az 512x512 önerilir).
 * logoOnLightPlate: logonun arka planı beyaz/açık renkliyse true bırakın;
 * logo beyaz bir plaka üzerinde gösterilir. Şeffaf ve koyu zemine uygun
 * bir logo kullanılırsa false yapın.
 */
import clubLogo from '../assets/brand/club-logo.png';

export const brand = {
  clubName: 'BAU INVESTMENT CLUB',
  appTitle: 'INVESTMENT WHEEL',
  credit: 'Developed by Furkan Rıza Söylemez',
  logoSrc: clubLogo,
  logoOnLightPlate: true,
} as const;
