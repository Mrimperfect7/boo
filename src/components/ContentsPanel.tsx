import { useEffect, useMemo, useState } from 'react';
import { tocFromPages, type Magazine, type TocEntry } from '../types/magazine';
import { pad2 } from '../lib/utils';
import './ContentsPanel.css';

export interface ContentsPanelProps {
  magazine: Magazine;
  open: boolean;
  currentSheet: number;
  mode: 'spread' | 'single';
  onNavigate: (pageId: number) => void;
  onClose: () => void;
}

interface ThumbEntry {
  entry: TocEntry;
  thumb: Magazine['pages'][number];
}

/** One thumbnail in the contents grid. */
function Thumb({
  entry,
  thumb,
  active,
  onNavigate,
}: {
  entry: TocEntry;
  thumb: Magazine['pages'][number];
  active: boolean;
  onNavigate: (pageId: number) => void;
}) {
  return (
    <button
      type="button"
      className={`contents-panel__thumb${active ? ' contents-panel__thumb--active' : ''}`}
      onClick={() => onNavigate(entry.page)}
      aria-label={`Go to ${entry.label}, page ${entry.page}`}
      aria-current={active ? 'true' : undefined}
    >
      <span className="contents-panel__page-chip">{pad2(entry.page)}</span>
      {thumb.image ? (
        <img src={thumb.image} alt="" loading="lazy" decoding="async" draggable={false} />
      ) : (
        <span className="contents-panel__thumb-fallback" aria-hidden="true">
          {entry.label.slice(0, 1)}
        </span>
      )}
      <span className="contents-panel__thumb-label">{entry.label}</span>
    </button>
  );
}

/**
 * Contents & thumbnails panel. The printed contents page stays in the issue;
 * this drawer is the reader's quick navigation with live page thumbnails.
 */
export function ContentsPanel({
  magazine,
  open,
  currentSheet,
  mode,
  onNavigate,
  onClose,
}: ContentsPanelProps) {
  const toc = useMemo(() => tocFromPages(magazine), [magazine]);
  const [query, setQuery] = useState('');

  const entries: ThumbEntry[] = useMemo(
    () =>
      toc.map((entry) => ({
        entry,
        thumb: magazine.pages.find((page) => page.id === entry.page) ?? magazine.pages[0],
      })),
    [toc, magazine],
  );

  const filtered = query
    ? entries.filter((item) => item.entry.label.toLowerCase().includes(query.toLowerCase()))
    : entries;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      className={`contents-panel${open ? ' contents-panel--open' : ''}`}
      aria-hidden={!open}
    >
      <div className="contents-panel__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="contents-panel__drawer"
        role="dialog"
        aria-label="Contents and page thumbnails"
      >
        <header className="contents-panel__head">
          <div>
            <p className="contents-panel__kicker">
              {magazine.issueLabel} · {magazine.date}
            </p>
            <h2 className="contents-panel__title">Contents</h2>
          </div>
          <button
            type="button"
            className="contents-panel__close"
            onClick={onClose}
            aria-label="Close contents"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <path
                d="M5.5 5.5l9 9M14.5 5.5l-9 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <input
          className="contents-panel__search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter contents…"
          aria-label="Filter contents"
        />

        <div className="contents-panel__grid" role="list">
          {filtered.map((item) => {
            const activePage = mode === 'spread' ? currentSheet * 2 : currentSheet + 1;
            const active =
              mode === 'spread'
                ? item.entry.page === activePage || item.entry.page === activePage + 1
                : item.entry.page === activePage;
            return (
              <Thumb
                key={item.entry.page}
                entry={item.entry}
                thumb={item.thumb}
                active={active}
                onNavigate={onNavigate}
              />
            );
          })}
        </div>

        <footer className="contents-panel__foot">
          {magazine.credits?.slice(0, 3).map((credit) => (
            <span key={credit.role}>
              {credit.role} — {credit.name}
            </span>
          ))}
        </footer>
      </div>
    </aside>
  );
}
