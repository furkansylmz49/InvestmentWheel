/*
 * Görevli ayarlarının tarayıcıda saklanması (localStorage).
 * Okunan her değer doğrulanır; bozuk/eksik veri varsa varsayılana dönülür.
 * localStorage hiç çalışmasa da (gizli sekme, engelli depolama) uygulama
 * varsayılanlarla çalışmaya devam eder.
 */
import { investorTypes, type InvestorTypeId } from './investorTypes.ts';

export type WinProbabilities = Record<InvestorTypeId, number>;

const PROBABILITIES_KEY = 'investment-wheel:probabilities';
const SOUND_KEY = 'investment-wheel:sound';

/** Varsayılanlar investorTypes.ts'teki winProbability değerleridir (75 / 50 / 25). */
export function defaultWinProbabilities(): WinProbabilities {
  return Object.fromEntries(investorTypes.map((type) => [type.id, type.winProbability])) as WinProbabilities;
}

/**
 * Geçerli bir olasılığı 0-100 arası tam sayı olarak döner. Sayı değilse
 * (NaN, null, undefined, metin) veya 0-100 dışındaysa fallback (varsayılan) döner.
 */
export function sanitizeProbability(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) return fallback;
  return Math.round(value);
}

/** Ham veriyi (localStorage'dan gelen her şey olabilir) geçerli olasılıklara çevirir. */
export function parseWinProbabilities(raw: unknown): WinProbabilities {
  const defaults = defaultWinProbabilities();
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return Object.fromEntries(
    investorTypes.map((type) => [type.id, sanitizeProbability(source[type.id], defaults[type.id])]),
  ) as WinProbabilities;
}

export function loadWinProbabilities(): WinProbabilities {
  try {
    const stored = window.localStorage.getItem(PROBABILITIES_KEY);
    return parseWinProbabilities(stored ? JSON.parse(stored) : null);
  } catch {
    return defaultWinProbabilities();
  }
}

export function saveWinProbabilities(probabilities: WinProbabilities) {
  try {
    window.localStorage.setItem(PROBABILITIES_KEY, JSON.stringify(probabilities));
  } catch {
    /* kalıcı olmasa da çalışır */
  }
}

/** Ses varsayılan olarak açık; sadece açıkça "off" kaydedildiyse kapalı. */
export function loadSoundEnabled(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function saveSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
  } catch {
    /* kalıcı olmasa da çalışır */
  }
}
