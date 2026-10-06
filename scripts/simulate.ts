/*
 * Olasılık motoru simülasyonu (geliştirme amaçlı, uygulamaya dahil değil).
 *   npm run simulate            → her senaryo için 10.000 spin
 *   npm run simulate -- 100000  → istenen sayıda spin
 *
 * Her spinde gerçek motor (planSpin) çalışır ve şunlar kontrol edilir:
 *   - WIN/LOSE oranı hedef olasılığa yakın mı (%0'da hiç WIN, %100'de hiç LOSE yok)
 *   - hesaplanan açıda ibrenin altındaki dilim, seçilen dilim mi
 *   - tur sayısı 5 ile 8 arasında mı
 *   - çarkta WIN alanının açısı olasılığa eşit mi
 * Önce varsayılan yatırımcı tipleri, sonra ayarlar panelinden seçilebilecek
 * özel oranlar (%0, 10, 25, 50, 75, 90, 100) üç dilim sayısıyla test edilir.
 */
import { getProbabilities, investorTypes } from '../src/config/investorTypes.ts';
import { buildSegments } from '../src/wheel/segments.ts';
import { planSpin, segmentAtPointer } from '../src/wheel/spin.ts';

declare const process: { argv: string[]; exitCode?: number };

const spins = Number(process.argv[2]) > 0 ? Number(process.argv[2]) : 10_000;
let failed = false;

function run(label: string, winProbability: number, segmentCount: number, verbose: boolean) {
  const segments = buildSegments(winProbability, segmentCount);
  const winArea = segments
    .filter((s) => s.outcome === 'win')
    .reduce((sum, s) => sum + (s.endAngle - s.startAngle), 0);
  const winAreaPct = (winArea / 360) * 100;

  let wins = 0;
  let pointerMismatches = 0;
  let minTurns = Infinity;
  let maxTurns = 0;
  let rotation = 0; // gerçek uygulamadaki gibi spinler birbirinin üstüne devam eder

  for (let i = 0; i < spins; i++) {
    const plan = planSpin(segments, winProbability, rotation);
    const turns = (plan.targetRotation - rotation) / 360;
    minTurns = Math.min(minTurns, turns);
    maxTurns = Math.max(maxTurns, turns);
    rotation = plan.targetRotation;

    if (plan.outcome === 'win') wins++;
    const landed = segmentAtPointer(segments, rotation);
    if (!landed || landed.index !== plan.segmentIndex || landed.outcome !== plan.outcome) pointerMismatches++;
  }

  const winPct = (wins / spins) * 100;
  const deviation = Math.abs(winPct - winProbability);
  // 10.000 spinde izin verilen sapma 3 puan (~6 standart sapma): rastgele başarısız olmaz, gerçek hatayı yakalar.
  const tolerance = Math.max(1, 300 / Math.sqrt(spins));
  const edgeOk =
    (winProbability !== 0 || wins === 0) && (winProbability !== 100 || wins === spins);
  const ok =
    deviation <= tolerance &&
    edgeOk &&
    pointerMismatches === 0 &&
    Math.abs(winAreaPct - winProbability) < 1e-9 &&
    // Büyük açılarda kayan nokta farkı için çok küçük pay (8 turun milyonda biri).
    minTurns >= 5 - 1e-6 &&
    maxTurns <= 8 + 1e-6;
  if (!ok) failed = true;

  if (verbose) {
    console.log(`${ok ? '✓' : '✗'} ${label}`);
    console.log(`   hedef      : %${winProbability} WIN / %${100 - winProbability} LOSE`);
    console.log(`   simülasyon : %${winPct.toFixed(2)} WIN / %${(100 - winPct).toFixed(2)} LOSE`);
    console.log(`   çark alanı : %${winAreaPct.toFixed(2)} WIN (${segments.length} dilim)`);
    console.log(`   ibre hatası: ${pointerMismatches}`);
    console.log(`   tur sayısı : ${minTurns.toFixed(2)} – ${maxTurns.toFixed(2)}\n`);
  } else {
    console.log(
      `${ok ? '✓' : '✗'} ${label.padEnd(16)} sim %${winPct.toFixed(2).padStart(6)}  ` +
        `alan %${winAreaPct.toFixed(2).padStart(6)}  ibre hatası ${pointerMismatches}  ` +
        `tur ${minTurns.toFixed(2)}–${maxTurns.toFixed(2)}`,
    );
  }
}

console.log(`\n${spins.toLocaleString('tr-TR')} spin / senaryo\n`);
console.log('Varsayılan yatırımcı tipleri\n');
for (const type of investorTypes) {
  run(type.name, getProbabilities(type).win, type.segmentCount, true);
}

console.log('Özel oranlar (ayarlar paneli)\n');
for (const p of [0, 10, 25, 50, 75, 90, 100]) {
  for (const count of [8, 10, 12]) {
    run(`%${p} / ${count} dilim`, p, count, false);
  }
}

if (failed) {
  console.log('\nSimülasyon BAŞARISIZ');
  process.exitCode = 1;
} else {
  console.log('\nTüm kontroller geçti');
}
