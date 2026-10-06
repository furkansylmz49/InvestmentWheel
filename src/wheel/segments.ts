/*
 * Olasılıktan çark geometrisi üretir.
 *
 * Açı kuralı (SVG ile aynı): 0° = saat 3 yönü, açı saat yönünde artar.
 * İbre tepede, yani -90° (= 270°) konumunda.
 */
import { outcomeLabels, type SegmentOutcome } from '../config/investorTypes.ts';

export interface SegmentGeometry {
  index: number;
  outcome: SegmentOutcome;
  label: string;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  /** Aynı renkten iki dilim yan yana gelirse ayırt edilsin diye 0/1 ton. */
  shade: 0 | 1;
}

/**
 * winProbability (%) ve toplam dilim sayısından dilimleri üretir.
 * WIN dilimlerinin toplam açısı tam olarak 360 x p / 100 derecedir;
 * dilim sayıları sadece bu alanın kaç parçaya bölüneceğini belirler.
 */
export function buildSegments(winProbability: number, segmentCount: number): SegmentGeometry[] {
  const total = Math.max(2, Math.round(segmentCount));
  const p = Math.min(100, Math.max(0, winProbability));

  let winCount: number;
  if (p === 0) winCount = 0;
  else if (p === 100) winCount = total;
  else winCount = Math.min(total - 1, Math.max(1, Math.round((total * p) / 100)));
  const loseCount = total - winCount;

  const winSize = winCount > 0 ? (360 * p) / 100 / winCount : 0;
  const loseSize = loseCount > 0 ? (360 * (100 - p)) / 100 / loseCount : 0;

  const order = interleave(winCount, loseCount);
  // İlk dilimin ortası ibrenin altında (tepede) başlasın.
  const firstSize = order[0] === 'win' ? winSize : loseSize;
  let cursor = -90 - firstSize / 2;
  const seen: Record<SegmentOutcome, number> = { win: 0, lose: 0 };

  return order.map((outcome, index) => {
    const size = outcome === 'win' ? winSize : loseSize;
    const startAngle = cursor;
    const endAngle = cursor + size;
    cursor = endAngle;
    const shade = (seen[outcome]++ % 2) as 0 | 1;
    return {
      index,
      outcome,
      label: outcomeLabels[outcome],
      startAngle,
      endAngle,
      centerAngle: startAngle + size / 2,
      shade,
    };
  });
}

/** Azınlıktaki sonucu çarkın etrafına eşit aralıklarla dağıtır. */
function interleave(winCount: number, loseCount: number): SegmentOutcome[] {
  const total = winCount + loseCount;
  const minority: SegmentOutcome = winCount <= loseCount ? 'win' : 'lose';
  const majority: SegmentOutcome = minority === 'win' ? 'lose' : 'win';
  const minorityCount = Math.min(winCount, loseCount);
  const order: SegmentOutcome[] = Array.from({ length: total }, () => majority);
  for (let i = 0; i < minorityCount; i++) {
    order[Math.floor(((i + 0.5) * total) / minorityCount)] = minority;
  }
  return order;
}
