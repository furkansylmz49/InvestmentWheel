import type { CSSProperties, TransitionEvent } from 'react';
import { brand } from '../../config/brand';
import type { SegmentGeometry } from '../../wheel/segments';
import { SPIN_DURATION_MS, SPIN_EASING_POINTS } from '../../wheel/spin';
import { slicePath } from '../../wheel/svg';
import styles from './Wheel.module.css';

interface WheelProps {
  segments: SegmentGeometry[];
  accent: string;
  /** Mutlak dönüş açısı (derece, saat yönü). */
  rotationDeg: number;
  spinning: boolean;
  /** Sonuç gösterilirken ibrenin altındaki dilim; diğerleri soluklaşır. */
  highlight: { index: number; outcome: 'win' | 'lose' } | null;
  onSpinEnd: () => void;
}

// Üç katman aynı viewBox'u kullanır; merkez (0,0) kutunun tam ortasıdır,
// bu yüzden ortadaki katmanı CSS ile kendi merkezinde döndürmek doğrudur.
const VIEW_BOX = '-114 -114 228 228';
const SEGMENT_RADIUS = 92;
const RIM_RADIUS = 99;
const HUB_RADIUS = 17;
const SPIN_EASING = `cubic-bezier(${SPIN_EASING_POINTS.join(', ')})`;

// Düz, sakin renkler; yan yana gelen aynı sonuç dilimleri iki tonla ayrışır.
const fills = {
  win: ['var(--color-win-500)', 'var(--color-win-600)'],
  lose: ['var(--color-lose-500)', 'var(--color-lose-600)'],
} as const;

function labelSizeFor(sliceDeg: number): number {
  if (sliceDeg >= 40) return 10;
  if (sliceDeg >= 33) return 9;
  return 8;
}

export function Wheel({ segments, accent, rotationDeg, spinning, highlight, onSpinEnd }: WheelProps) {
  const rotorStyle: CSSProperties = {
    transform: `rotate(${rotationDeg}deg)`,
    transition: spinning ? `transform ${SPIN_DURATION_MS}ms ${SPIN_EASING}` : 'none',
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform') onSpinEnd();
  };

  return (
    <div
      className={styles.wheel}
      style={{ '--accent': accent } as CSSProperties}
      data-result={highlight?.outcome}
    >
      {/* Alt katman: sabit çerçeve */}
      <svg className={styles.layer} viewBox={VIEW_BOX} aria-hidden="true">
        <circle r={RIM_RADIUS} className={styles.rim} />
      </svg>

      {/* Dönen katman: sadece CSS transform (GPU), animasyon sırasında React render yok */}
      <div className={highlight ? `${styles.rotor} ${styles.dimmed}` : styles.rotor} style={rotorStyle} onTransitionEnd={handleTransitionEnd}>
        <svg className={styles.layer} viewBox={VIEW_BOX} role="img" aria-label={`${segments.length} dilimli çark`}>
          {segments.map((segment) => {
            const mid = segment.centerAngle;
            // Çark durduğunda ekranın sol yarısına düşen yazılar ters görünmesin diye 180° çevrilir.
            // Hedef açıya göre hesaplanır: yön spin başında belirlenir, sonuç anında değişmez.
            const normalized = (((mid + rotationDeg) % 360) + 360) % 360;
            const flip = normalized > 90 && normalized < 270 ? ' rotate(180)' : '';
            return (
              <g
                key={segment.index}
                data-index={segment.index}
                data-outcome={segment.outcome}
                className={highlight?.index === segment.index ? undefined : styles.segment}
              >
                <path
                  d={slicePath(SEGMENT_RADIUS, segment.startAngle, segment.endAngle)}
                  style={{ fill: fills[segment.outcome][segment.shade] }}
                  stroke="#141134"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <text
                  className={styles.label}
                  transform={`rotate(${mid}) translate(${(SEGMENT_RADIUS + HUB_RADIUS) / 2 + 6} 0)${flip}`}
                  fontSize={labelSizeFor(segment.endAngle - segment.startAngle)}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {segment.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Üst katman: sabit göbek ve ibre */}
      <svg className={styles.layer} viewBox={VIEW_BOX} aria-hidden="true">
        <defs>
          <clipPath id="wheel-hub-clip">
            <circle r={HUB_RADIUS - 3} />
          </clipPath>
        </defs>
        <circle r={HUB_RADIUS + 3} className={styles.hubRing} />
        <circle r={HUB_RADIUS} fill="#ffffff" />
        <image
          href={brand.logoSrc}
          x={-(HUB_RADIUS - 3)}
          y={-(HUB_RADIUS - 3)}
          width={(HUB_RADIUS - 3) * 2}
          height={(HUB_RADIUS - 3) * 2}
          clipPath="url(#wheel-hub-clip)"
          preserveAspectRatio="xMidYMid slice"
        />
        <path className={styles.pointer} d="M -9 -109 Q -9 -112 -6 -112 L 6 -112 Q 9 -112 9 -109 L 1.6 -86.5 Q 0 -83 -1.6 -86.5 Z" />
      </svg>
    </div>
  );
}
