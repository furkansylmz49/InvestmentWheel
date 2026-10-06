/*
 * Yatırımcı tipleri: merkezi konfigürasyon.
 *
 * winProbability: ÖDÜL (win) olasılığı, yüzde olarak (0-100).
 * PASS (lose) olasılığı her zaman 100 - winProbability olarak türetilir,
 * böylece toplam daima 100 olur (bkz. getProbabilities).
 *
 * segmentCount: çarktaki toplam dilim sayısı (görsel tercih).
 * Dilim açıları olasılıktan hesaplanır: WIN dilimlerinin toplam açısı
 * 360° x winProbability / 100 olur, dilim sayısından bağımsız.
 */

export type InvestorTypeId = 'safe-harbor' | 'balanced' | 'risk-taker';

export type SegmentOutcome = 'win' | 'lose';

export interface InvestorType {
  id: InvestorTypeId;
  name: string;
  /** Seçim kartı ve çark arkasındaki hafif ışığın rengi (mor/lacivert ekseninde). */
  accent: string;
  winProbability: number;
  segmentCount: number;
}

export const outcomeLabels: Record<SegmentOutcome, string> = {
  win: 'ÖDÜL',
  lose: 'PASS',
};

export const investorTypes: InvestorType[] = [
  {
    id: 'safe-harbor',
    name: 'GÜVENLİ LİMAN',
    accent: '#7ea6f6',
    winProbability: 75,
    segmentCount: 8,
  },
  {
    id: 'balanced',
    name: 'DENGELİ OYUNCU',
    accent: '#a996f7',
    winProbability: 50,
    segmentCount: 10,
  },
  {
    id: 'risk-taker',
    name: 'RISK TAKER',
    accent: '#d595ea',
    winProbability: 25,
    segmentCount: 12,
  },
];

export const defaultInvestorTypeId: InvestorTypeId = 'balanced';

export function getInvestorType(id: InvestorTypeId): InvestorType {
  const found = investorTypes.find((type) => type.id === id);
  // Konfigürasyon hatası olsa bile uygulama çökmesin: ilk tipe düş.
  return found ?? investorTypes[0]!;
}

/** Yüzde olarak WIN/LOSE olasılıkları; hatalı değerler 0-100 aralığına çekilir. */
export function getProbabilities(type: InvestorType): Record<SegmentOutcome, number> {
  const raw = Number.isFinite(type.winProbability) ? type.winProbability : 50;
  const win = Math.min(100, Math.max(0, raw));
  return { win, lose: 100 - win };
}
