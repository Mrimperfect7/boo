import { useEffect, useState } from 'react';
import { flipSound } from '../engine/flip-sound';
import './LoadingScreen.css';

export interface LoadingScreenProps {
  magazineTitle: string;
  issueLabel: string;
  onEnter: () => void;
}

/**
 * The opening: "LOADING MAGAZINE", then a leaf opens to reveal the issue.
 * The first tap also unlocks the WebAudio context for later page sounds.
 */
export function LoadingScreen({ magazineTitle, issueLabel, onEnter }: LoadingScreenProps) {
  const [state, setState] = useState<'loading' | 'opening'>('loading');

  useEffect(() => {
    const timer = window.setTimeout(() => setState('opening'), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const enter = () => {
    flipSound.unlock();
    onEnter();
  };

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      enter();
    }
  };

  return (
    <div
      className={`loader${state === 'opening' ? ' loader--opening' : ''}`}
      role="dialog"
      aria-label="Loading the magazine"
      onKeyDown={handleKey}
    >
      <div className="loader__glow" aria-hidden="true" />
      <div className="loader__core">
        <p className="loader__kicker">{issueLabel}</p>
        <h1 className="loader__title">
          <span className="loader__masthead">{magazineTitle}</span>
          <span className="loader__action">Loading magazine</span>
        </h1>
        <div className="loader__sheet" aria-hidden="true">
          <div className="loader__leaf" />
        </div>
        <button type="button" className="loader__enter" onClick={enter}>
          Open the issue
          <span aria-hidden="true"> →</span>
        </button>
        <p className="loader__hint">
          Uses the arrow keys, or drag the corner of a page.
        </p>
      </div>
    </div>
  );
}
