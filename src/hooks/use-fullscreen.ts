import { useCallback, useEffect, useState } from 'react';

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenEnabled?: boolean;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

export interface FullscreenApi {
  active: boolean;
  supported: boolean;
  toggle: () => void;
  exit: () => void;
}

export function useFullscreen(target?: React.RefObject<HTMLElement | null>): FullscreenApi {
  const [active, setActive] = useState(false);
  const supported =
    typeof document !== 'undefined' &&
    Boolean(
      document.fullscreenEnabled ??
        (document as FullscreenDocument).webkitFullscreenEnabled ??
        true,
    );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const doc = document as FullscreenDocument;
    const onChange = () => setActive(Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const exit = useCallback(() => {
    const doc = document as FullscreenDocument;
    if (doc.fullscreenElement ?? doc.webkitFullscreenElement) {
      void (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
    }
  }, []);

  const toggle = useCallback(() => {
    const doc = document as FullscreenDocument;
    const element = (target?.current ?? doc.documentElement) as FullscreenElement;
    if (doc.fullscreenElement ?? doc.webkitFullscreenElement) {
      exit();
      return;
    }
    void (element.requestFullscreen?.({ navigationUI: 'hide' }) ?? element.webkitRequestFullscreen?.());
  }, [exit, target]);

  return { active, supported, toggle, exit };
}
