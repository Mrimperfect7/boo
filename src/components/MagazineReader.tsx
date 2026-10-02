import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { Magazine } from '../types/magazine';
import { flipSound } from '../engine/flip-sound';
import { clamp } from '../engine/flip-math';
import { usePageTurn } from '../engine/use-page-turn';
import { useElementSize } from '../hooks/use-element-size';
import { useFullscreen } from '../hooks/use-fullscreen';
import { useIsWide } from '../hooks/use-media-query';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cx, pad2 } from '../lib/utils';
import { PageSpread } from './PageSpread';
import { PageStack } from './PageStack';
import { PageTurn } from './PageTurn';
import { ReaderToolbar } from './ReaderToolbar';
import { PageCounter } from './PageCounter';
import { ContentsPanel } from './ContentsPanel';
import './book.css';

const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5, 2];
const PAGE_ASPECT = 0.75;
const STRIPS = 12;
/** Width of the grabbable corner strip, as a fraction of one page. */
const EDGE = 0.16;

type Mode = 'spread' | 'single';

export interface MagazineReaderProps {
  magazine: Magazine;
  settings: {
    sound: boolean;
    volume: number;
    motion: 'auto' | 'on' | 'off';
    view: 'auto' | 'spread' | 'single';
  };
  onSettingsChange: (patch: Partial<MagazineReaderProps['settings']>) => void;
}

function computeMode(preference: 'auto' | 'spread' | 'single', wide: boolean): Mode {
  if (preference === 'spread') return 'spread';
  if (preference === 'single') return 'single';
  return wide ? 'spread' : 'single';
}

/** Printed page id → sheet index for the current mode. */
function sheetForPage(pageId: number, mode: Mode): number {
  return mode === 'spread' ? Math.floor(pageId / 2) : pageId - 1;
}

function formatSpread(sheet: number, pageCount: number): string {
  const leftId = sheet * 2;
  const rightId = leftId + 1;
  if (leftId === 0) return `01`;
  if (rightId >= pageCount) return `${pad2(leftId)}`;
  return `${pad2(leftId)} — ${pad2(rightId)}`;
}

function progressRatio(sheet: number, sheetCount: number): number {
  if (sheetCount <= 1) return 1;
  return clamp((sheet + 1) / sheetCount, 0, 1);
}

/**
 * The reading room: fits the book to the viewport, wires the flip engine to
 * pointer, keyboard and toolbar input, and layers chrome over the scene.
 */
export function MagazineReader({ magazine, settings, onSettingsChange }: MagazineReaderProps) {
  const readerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const readerSize = useElementSize(readerRef);
  const wide = useIsWide();
  const reducedMotion = useReducedMotion(settings.motion);

  const [mode, setMode] = useState<Mode>('spread');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [contentsOpen, setContentsOpen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);

  const pageCount = magazine.pages.length;
  const modeRef = useRef<Mode>('spread');
  modeRef.current = mode;

  /* ── Sizing ──────────────────────────────────────────────────────────── */

  const fit = useMemo(() => {
    const width = readerSize.width || window.innerWidth;
    const height = readerSize.height || window.innerHeight;
    const padX = width < 560 ? 12 : width < 1100 ? 32 : 64;
    const padTop = width < 560 ? 10 : 26;
    const padBottom = width < 560 ? 86 : 104;

    const availW = width - padX * 2;
    const availH = Math.max(220, height - padTop - padBottom);
    const single = width < 700;
    const perPageW = single ? availW : availW / 2;
    const pageW = Math.max(190, Math.min(720, Math.min(perPageW, availH * PAGE_ASPECT)));
    return { pageW, pageH: pageW / PAGE_ASPECT };
  }, [readerSize]);

  /* ── Mode ────────────────────────────────────────────────────────────── */

  useEffect(() => {
    setMode(computeMode(settings.view, wide));
  }, [settings.view, wide]);

  /* ── Flip engine ─────────────────────────────────────────────────────── */

  const sheetCount = mode === 'spread' ? Math.ceil(pageCount / 2) : pageCount;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const turn = usePageTurn({
    sheetCount,
    reducedMotion,
    geometry: () => ({ strips: STRIPS, curvature: 0.95, sheetWidth: fit.pageW }),
    onSound: (kind) => {
      if (settingsRef.current.sound) flipSound.play(kind);
    },
  });

  const sheet = turn.sheet;
  const single = mode === 'single';

  // Pages at rest. Left page is the back of the previous leaf (a real book).
  const leftPage = single ? undefined : magazine.pages[sheet * 2 - 1];
  const rightPage = single ? magazine.pages[sheet] : magazine.pages[sheet * 2];
  const canPrev = sheet > 0;
  const canNext = single ? sheet < pageCount - 1 : sheet * 2 + 2 < pageCount;

  const navigateToPage = useCallback(
    (pageId: number) => {
      const target = sheetForPage(clamp(pageId, 1, pageCount), modeRef.current);
      if (target !== turn.sheet) turn.goToSheet(target);
      setContentsOpen(false);
    },
    [pageCount, turn],
  );

  useEffect(() => {
    flipSound.setEnabled(settings.sound);
    flipSound.setVolume(settings.volume);
  }, [settings.sound, settings.volume]);

  /* ── Zoom ────────────────────────────────────────────────────────────── */

  const applyZoom = useCallback((value: number) => {
    setZoom(clamp(value, 0.75, 2));
    if (value === 1) setPan({ x: 0, y: 0 });
  }, []);

  const toggleZoom = useCallback(() => {
    applyZoom(zoom === 1 ? 1.5 : 1);
  }, [applyZoom, zoom]);

  /* ── Keyboard ────────────────────────────────────────────────────────── */

  const fullscreenApi = useFullscreen(readerRef);
  const fullscreenRef = useRef(fullscreenApi);
  fullscreenRef.current = fullscreenApi;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          event.preventDefault();
          turn.next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          turn.prev();
          break;
        case 'Home':
          event.preventDefault();
          navigateToPage(1);
          break;
        case 'End':
          event.preventDefault();
          navigateToPage(pageCount);
          break;
        case '+':
        case '=':
          applyZoom(ZOOM_LEVELS[Math.min(ZOOM_LEVELS.indexOf(zoom) + 1, ZOOM_LEVELS.length - 1)]);
          break;
        case '-':
          applyZoom(ZOOM_LEVELS[Math.max(0, ZOOM_LEVELS.indexOf(zoom) - 1)]);
          break;
        case 'f':
        case 'F':
          fullscreenRef.current.toggle();
          break;
        case 'Escape':
          if (contentsOpen) setContentsOpen(false);
          else if (zoom !== 1) applyZoom(1);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyZoom, contentsOpen, navigateToPage, turn, zoom, pageCount]);

  /* ── Auto-hiding chrome ──────────────────────────────────────────────── */

  useEffect(() => {
    let timer = 0;
    const wake = () => {
      setChromeVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setChromeVisible(false), 3600);
    };
    wake();
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  /* ── Pointer interaction ─────────────────────────────────────────────── */

  const dragRef = useRef<{
    pointerId: number;
    sheetIndex: number;
    direction: 1 | -1;
    moved: boolean;
  } | null>(null);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);
  const velocityRef = useRef(0);
  const lastSample = useRef<{ x: number; t: number } | null>(null);
  const lastTap = useRef<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 });

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if (event.target instanceof Element && event.target.closest('button, a, input, [role="dialog"]')) {
        return;
      }
      const book = bookRef.current;
      if (!book) return;
      const rect = book.getBoundingClientRect();
      const pageW = rect.width / (single ? 1 : 2);

      if (zoom !== 1) {
        panRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          baseX: pan.x,
          baseY: pan.y,
        };
        return;
      }

      const localX = event.clientX - rect.left;
      const fromRight = localX > rect.width - pageW * EDGE;
      const fromLeft = localX < pageW * EDGE;
      if (!fromRight && !fromLeft) return;
      if (fromRight && !canNext) return;
      if (fromLeft && !canPrev) return;

      const direction: 1 | -1 = fromRight ? 1 : -1;
      const sheetIndex = direction === 1 ? sheet : sheet - 1;
      dragRef.current = { pointerId: event.pointerId, sheetIndex, direction, moved: false };
      lastSample.current = { x: event.clientX, t: event.timeStamp };
      velocityRef.current = 0;
      turn.startDrag({ sheet: sheetIndex, direction, mode: 'drag' }, direction === 1 ? 0 : 1);
    },
    [canNext, canPrev, pan.x, pan.y, sheet, single, turn, zoom],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const panDrag = panRef.current;
      if (panDrag && panDrag.pointerId === event.pointerId) {
        setPan({
          x: clamp(panDrag.baseX + (event.clientX - panDrag.startX), -700, 700),
          y: clamp(panDrag.baseY + (event.clientY - panDrag.startY), -700, 700),
        });
        return;
      }

      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.moved = true;

      const book = bookRef.current;
      if (!book) return;
      const rect = book.getBoundingClientRect();
      const pageW = rect.width / (single ? 1 : 2);
      // The leaf's spine is at the right edge (forward) or left edge (back).
      const originX = drag.direction === 1 ? rect.right - pageW : rect.left;
      const raw = (event.clientX - originX) / pageW;
      turn.moveDrag(drag.direction === 1 ? raw : 1 - raw);

      const sample = lastSample.current;
      if (sample) {
        const dt = Math.max(1, event.timeStamp - sample.t);
        velocityRef.current = clamp(((event.clientX - sample.x) / dt) * 16, -1.6, 1.6);
      }
      lastSample.current = { x: event.clientX, t: event.timeStamp };
    },
    [single, turn],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const panDrag = panRef.current;
      if (panDrag && panDrag.pointerId === event.pointerId) {
        panRef.current = null;
        return;
      }
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      turn.endDrag(velocityRef.current);
      velocityRef.current = 0;
      lastSample.current = null;
    },
    [turn],
  );

  /** Click-to-turn plus double-click zoom. */
  const onClick = useCallback(
    (event: ReactPointerEvent) => {
      if (event.target instanceof Element && event.target.closest('button, a, input')) return;
      const book = bookRef.current;
      if (!book) return;

      const now = performance.now();
      const isDouble =
        now - lastTap.current.t < 340 &&
        Math.abs(event.clientX - lastTap.current.x) < 40 &&
        Math.abs(event.clientY - lastTap.current.y) < 40;
      lastTap.current = { x: event.clientX, y: event.clientY, t: now };
      if (isDouble) {
        toggleZoom();
        return;
      }
      if (zoom !== 1) return;

      const rect = book.getBoundingClientRect();
      const midX = rect.left + rect.width / (single ? 2 : 1);
      if (event.clientX > midX) {
        if (canNext) turn.next();
      } else if (canPrev) {
        turn.prev();
      }
    },
    [canNext, canPrev, single, toggleZoom, turn, zoom],
  );

  /* ── Corner hover preview ────────────────────────────────────────────── */

  const onPreviewStart = useCallback(() => {
    if (canNext) turn.preview(1, 0.07);
  }, [canNext, turn]);

  const onPreviewEnd = useCallback(() => turn.clearPreview(), [turn]);

  /* ── Stack thickness ─────────────────────────────────────────────────── */

  const leftLayers = sheet;
  const rightLayers = single ? pageCount - sheet - 1 : sheetCount - sheet - 1;

  const active = turn.active;

  return (      <div
        className="reader"
        ref={readerRef}
        data-zoomed={zoom !== 1}
        style={{ '--pan-x': `${pan.x}px`, '--pan-y': `${pan.y}px`, '--zoom': zoom } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLDivElement>}
      >
      <div className="reader__stage">
        <div
          className={cx('book', `book--${mode}`)}
          data-mode={mode}
          ref={bookRef}
          style={{ '--page-w': `${fit.pageW}px`, '--page-h': `${fit.pageH}px` } as CSSProperties}
        >
          <div className="book__floor" aria-hidden="true" />
          <div className="book__shadow" />
          <PageStack side="left" layers={leftLayers} />
          <PageStack side="right" layers={rightLayers} />

          <div className="book__spread">
            <PageSpread
              magazine={magazine}
              mode={mode}
              leftPage={leftPage}
              rightPage={rightPage}
              pageCount={pageCount}
              priority={sheet === 0}
              canPrev={canPrev}
              canNext={canNext}
              onNavigate={navigateToPage}
              onPreviewStart={onPreviewStart}
              onPreviewEnd={onPreviewEnd}
            />
            {active ? (
              <PageTurn
                key={`${active.sheet}-${active.direction}-${active.mode === 'preview' ? 'p' : 'a'}`}
                magazine={magazine}
                sheetIndex={active.sheet}
                mode={mode}
                strips={STRIPS}
                pageWidth={fit.pageW}
                pageCount={pageCount}
                subscribe={turn.subscribe}
              />
            ) : null}
            <div className="book__spine" aria-hidden="true" />
          </div>
        </div>
      </div>

      <PageCounter
        left={single ? rightPage?.id ?? null : leftPage?.id ?? null}
        right={single ? null : rightPage?.id ?? null}
        total={pageCount}
        visible={chromeVisible && !contentsOpen}
      />

      <ReaderToolbar
        pageLabel={
          single
            ? `${pad2(rightPage?.id ?? 1)} / ${pad2(pageCount)}`
            : `${formatSpread(sheet, pageCount)} / ${pad2(pageCount)}`
        }
        pageRatio={progressRatio(sheet, sheetCount)}
        canPrev={canPrev}
        canNext={canNext}
        zoom={zoom}
        zoomLevels={ZOOM_LEVELS}
        sound={settings.sound}
        fullscreen={fullscreenApi.active}
        fullscreenSupported={fullscreenApi.supported}
        contentsOpen={contentsOpen}
        settings={settings}
        mode={mode}
        reducedMotion={reducedMotion}
        onPrev={() => turn.prev()}
        onNext={() => turn.next()}
        onZoom={applyZoom}
        onToggleContents={() => setContentsOpen((open) => !open)}
        onToggleFullscreen={fullscreenApi.toggle}
        onToggleSound={() => {
          flipSound.unlock();
          onSettingsChange({ sound: !settings.sound });
        }}
        onUpdateSettings={onSettingsChange}
      />

      <ContentsPanel
        magazine={magazine}
        open={contentsOpen}
        currentSheet={sheet}
        mode={mode}
        onNavigate={navigateToPage}
        onClose={() => setContentsOpen(false)}
      />
    </div>
  );
}
