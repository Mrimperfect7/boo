import { useEffect, useState } from 'react';
import type { Magazine } from './types/magazine';
import { resolveMagazineSource } from './data/sources';
import { MagazineReader } from './components/MagazineReader';
import { LoadingScreen } from './components/LoadingScreen';
import { useSettings } from './hooks/use-settings';
import { flipSound } from './engine/flip-sound';
import './App.css';

type Phase =
  | { status: 'loading' }
  | { status: 'ready'; magazine: Magazine }
  | { status: 'error'; message: string };

export default function App() {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [entered, setEntered] = useState(false);
  const { settings, update } = useSettings();

  useEffect(() => {
    const controller = new AbortController();
    const source = resolveMagazineSource();
    source
      .load(controller.signal)
      .then((magazine) => setPhase({ status: 'ready', magazine }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPhase({
          status: 'error',
          message: error instanceof Error ? error.message : 'The issue could not be opened.',
        });
      });
    return () => controller.abort();
  }, []);

  // Keep the synthesized page sounds in step with the reader's preference.
  useEffect(() => {
    flipSound.setEnabled(entered && settings.sound);
    flipSound.setVolume(settings.volume);
  }, [entered, settings.sound, settings.volume]);

  const magazine = phase.status === 'ready' ? phase.magazine : null;

  return (
    <div className="app">
      <div className="app__ambient" aria-hidden="true" />
      {magazine ? (
        <MagazineReader magazine={magazine} settings={settings} onSettingsChange={update} />
      ) : (
        <div className="app__status" role="status">
          {phase.status === 'error' ? (
            <div className="load-error">
              <p>The issue could not be opened. {phase.message}</p>
              <button type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : (
            <p>Opening…</p>
          )}
        </div>
      )}

      {magazine && !entered ? (
        <LoadingScreen
          magazineTitle={magazine.title}
          issueLabel={magazine.issueLabel}
          onEnter={() => setEntered(true)}
        />
      ) : null}

      <div className="app__vignette" aria-hidden="true" />
      <div className="app__grain" aria-hidden="true" />
    </div>
  );
}
