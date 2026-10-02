import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ReaderSettings } from '../types/magazine';
import { cx } from '../lib/utils';
import './ReaderToolbar.css';

export interface ReaderToolbarProps {
  pageLabel: string;
  pageRatio: number;
  canPrev: boolean;
  canNext: boolean;
  zoom: number;
  zoomLevels: number[];
  sound: boolean;
  fullscreen: boolean;
  fullscreenSupported: boolean;
  contentsOpen: boolean;
  settings: ReaderSettings;
  mode: 'spread' | 'single';
  reducedMotion: boolean;
  onPrev: () => void;
  onNext: () => void;
  onZoom: (value: number) => void;
  onToggleContents: () => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onUpdateSettings: (patch: Partial<ReaderSettings>) => void;
}

interface IconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  compact?: boolean;
}

function IconButton({ label, icon, onClick, disabled, active, compact }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cx('tool', active && 'tool--active', compact && 'tool--compact')}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

const icons = {
  prev: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <rect x="3.2" y="3.2" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="11.4" y="3.2" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="3.2" y="11.4" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="11.4" y="11.4" width="5.4" height="5.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  zoomOut: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13 13l4 4M6.6 9h4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  zoomIn: (
    <svg viewBox="0 0 200 20" width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13 13l4 4M6.6 9h4.8M9 6.6v4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  expand: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M4 8V4h4M16 8V4h-4M4 12v4h4M16 12v4h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sound: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M4 8v4h3l4 3.4V4.6L7 8H4z" fill="currentColor" />
      <path d="M13.5 7.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  muted: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M4 8v4h3l4 3.4V4.6L7 8H4z" fill="currentColor" />
      <path d="M13 8.4l3.6 3.6M16.6 8.4L13 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d="M10 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M10 3.2v1.9M10 14.9v1.9M3.2 10h1.9M14.9 10h1.9M5.2 5.2l1.4 1.4M13.4 13.4l1.4 1.4M14.8 5.2l-1.4 1.4M6.6 13.4l-1.4 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  ),
} as const;

export function ReaderToolbar({
  pageLabel,
  pageRatio,
  canPrev,
  canNext,
  zoom,
  zoomLevels,
  sound,
  fullscreen,
  fullscreenSupported,
  contentsOpen,
  settings,
  mode,
  reducedMotion,
  onPrev,
  onNext,
  onZoom,
  onToggleContents,
  onToggleFullscreen,
  onToggleSound,
  onUpdateSettings,
}: ReaderToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [settingsOpen]);

  const zoomIndex = Math.max(0, zoomLevels.indexOf(zoom));

  return (
    <div className="toolbar" role="toolbar" aria-label="Reader controls">
      <div className="toolbar__group">
        <IconButton label="Previous page" icon={icons.prev} onClick={onPrev} disabled={!canPrev} />
        <IconButton label="Next page" icon={icons.next} onClick={onNext} disabled={!canNext} />
      </div>

      <div className="toolbar__counter" aria-live="polite" aria-atomic="true">
        <span className="toolbar__pages">{pageLabel}</span>
        <span className="toolbar__meter" aria-hidden="true">
          <i style={{ transform: `scaleX(${Math.max(0.02, pageRatio)})` }} />
        </span>
      </div>

      <div className="toolbar__group">
        <IconButton
          label="Contents & thumbnails"
          icon={icons.grid}
          onClick={onToggleContents}
          active={contentsOpen}
        />
        <IconButton label="Zoom out" icon={icons.zoomOut} onClick={() => onZoom(zoomLevels[Math.max(0, zoomIndex - 1)])} disabled={zoomIndex === 0} />
        <IconButton
          label="Zoom in"
          icon={icons.zoomIn}
          onClick={() => onZoom(zoomLevels[Math.min(zoomLevels.length - 1, zoomIndex + 1)])}
          disabled={zoomIndex === zoomLevels.length - 1}
        />
        <IconButton
          label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          icon={icons.expand}
          onClick={onToggleFullscreen}
          active={fullscreen}
          disabled={!fullscreenSupported}
        />
        <IconButton
          label={sound ? 'Mute page sounds' : 'Enable page sounds'}
          icon={sound ? icons.sound : icons.muted}
          onClick={onToggleSound}
          active={sound}
        />
        <div className="toolbar__settings" ref={settingsRef}>
          <IconButton
            label="Reading settings"
            icon={icons.settings}
            onClick={() => setSettingsOpen((open) => !open)}
            active={settingsOpen}
          />
          {settingsOpen ? (
            <div className="toolbar__panel" role="dialog" aria-label="Reading settings">
              <label className="toolbar__row">
                <span>Page sound</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={Math.round(settings.volume * 100)}
                  onChange={(event) => onUpdateSettings({ volume: Number(event.target.value) / 100 })}
                  aria-label="Sound volume"
                />
              </label>
              <div className="toolbar__row" role="radiogroup" aria-label="Motion">
                <span>Motion</span>
                <div className="toolbar__segment">
                  {(['auto', 'on', 'off'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={cx('toolbar__seg', settings.motion === value && 'toolbar__seg--on')}
                      aria-pressed={settings.motion === value}
                      onClick={() => onUpdateSettings({ motion: value })}
                    >
                      {value === 'auto' ? 'Auto' : value === 'on' ? 'Reduced' : 'Full'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="toolbar__row" role="radiogroup" aria-label="Page layout">
                <span>Pages</span>
                <div className="toolbar__segment">
                  {(['auto', 'spread', 'single'] as const).map((value) => (
                    <button
                      type="button"
                      className={cx('toolbar__seg', settings.view === value && 'toolbar__seg--on')}
                      aria-pressed={settings.view === value}
                      onClick={() => onUpdateSettings({ view: value })}
                    >
                      {value === 'auto' ? 'Auto' : value === 'spread' ? 'Two' : 'One'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="toolbar__hint">
                {mode === 'spread' ? 'Two-page view' : 'Single-page view'}
                {reducedMotion ? ' · reduced motion' : ''}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
