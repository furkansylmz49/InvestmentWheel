import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Header } from './components/Header/Header';
import { brand } from './config/brand';
import { InvestorTypeSelector } from './components/InvestorTypeSelector/InvestorTypeSelector';
import { ResultReveal } from './components/ResultReveal/ResultReveal';
import { SettingsButton } from './components/Settings/SettingsButton';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { SpinButton } from './components/SpinButton/SpinButton';
import { Wheel } from './components/Wheel/Wheel';
import {
  defaultInvestorTypeId,
  getInvestorType,
  getProbabilities,
  investorTypes,
  type InvestorTypeId,
} from './config/investorTypes';
import {
  defaultWinProbabilities,
  loadSoundEnabled,
  loadWinProbabilities,
  sanitizeProbability,
  saveSoundEnabled,
  saveWinProbabilities,
} from './config/settingsStorage';
import { buildSegments } from './wheel/segments';
import { useWheelSpin } from './wheel/useWheelSpin';
import styles from './App.module.css';

export function App() {
  const [activeTypeId, setActiveTypeId] = useState<InvestorTypeId>(defaultInvestorTypeId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(loadSoundEnabled);
  // Olasılıkların tek kaynağı: panel, çark geometrisi ve sonuç motoru hepsi bunu okur.
  const [winProbabilities, setWinProbabilities] = useState(loadWinProbabilities);
  const activeType = getInvestorType(activeTypeId);
  const winProbability = getProbabilities({ ...activeType, winProbability: winProbabilities[activeType.id] }).win;

  const segments = useMemo(
    () => buildSegments(winProbability, activeType.segmentCount),
    [winProbability, activeType.segmentCount],
  );
  const { phase, rotation, result, spin, finishSpin } = useWheelSpin(segments, winProbability, { soundEnabled });
  // Spin + sonuç gösterimi boyunca kontroller kilitli; sadece idle'da serbest.
  const busy = phase !== 'idle';

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const selectType = useCallback(
    (id: InvestorTypeId) => {
      if (!busy) setActiveTypeId(id);
    },
    [busy],
  );

  const toggleSound = useCallback(() => setSoundEnabled((previous) => !previous), []);

  // Spin ve sonuç gösterimi sırasında olasılıklar değişmez; devam eden spin etkilenmez.
  const setWinProbability = useCallback(
    (id: InvestorTypeId, value: number) => {
      if (busy) return;
      setWinProbabilities((previous) => ({ ...previous, [id]: sanitizeProbability(value, previous[id]) }));
    },
    [busy],
  );

  const resetWinProbabilities = useCallback(() => {
    if (!busy) setWinProbabilities(defaultWinProbabilities());
  }, [busy]);

  useEffect(() => saveSoundEnabled(soundEnabled), [soundEnabled]);
  useEffect(() => saveWinProbabilities(winProbabilities), [winProbabilities]);

  // Görevli için kısayol: 1 / 2 / 3 tuşları yatırımcı tipini seçer (spin ve sonuç sırasında kapalı).
  useEffect(() => {
    if (settingsOpen || busy) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const type = investorTypes[Number(event.key) - 1];
      if (type) selectType(type.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen, busy, selectType]);

  return (
    <div className={styles.app} style={{ '--accent': activeType.accent } as CSSProperties}>
      <aside className={styles.sidebar}>
        <Header />
        <InvestorTypeSelector
          types={investorTypes}
          activeId={activeTypeId}
          winProbabilities={winProbabilities}
          disabled={busy}
          onSelect={selectType}
        />
      </aside>

      <main className={styles.stage}>
        <div className={styles.wheelArea}>
          <Wheel
            segments={segments}
            accent={activeType.accent}
            rotationDeg={rotation}
            spinning={phase === 'spinning'}
            highlight={result && { index: result.segmentIndex, outcome: result.outcome }}
            onSpinEnd={finishSpin}
          />
          {result && <ResultReveal key={result.id} outcome={result.outcome} />}
        </div>
        <SpinButton disabled={busy} onSpin={spin} />
      </main>

      <footer className={styles.footer}>{brand.credit}</footer>

      <div className={styles.settings}>
        <SettingsButton onClick={() => setSettingsOpen(true)} />
      </div>
      <SettingsPanel
        open={settingsOpen}
        onClose={closeSettings}
        locked={busy}
        investorTypes={investorTypes}
        activeTypeId={activeTypeId}
        winProbabilities={winProbabilities}
        onChangeProbability={setWinProbability}
        onResetProbabilities={resetWinProbabilities}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
    </div>
  );
}
