import type { Magazine, MagazinePage } from '../types/magazine';
import { Page } from './Page';

export interface PageSpreadProps {
  magazine: Magazine;
  mode: 'spread' | 'single';
  leftPage?: MagazinePage;
  rightPage?: MagazinePage;
  pageCount: number;
  priority: boolean;
  canPrev: boolean;
  canNext: boolean;
  onNavigate?: (pageId: number) => void;
  onPreviewStart?: () => void;
  onPreviewEnd?: () => void;
}

/**
 * The pages currently at rest: two facing pages on wide screens, one on phones.
 * The leaf in flight is rendered separately, on top of these.
 */
export function PageSpread({
  magazine,
  mode,
  leftPage,
  rightPage,
  pageCount,
  priority,
  canPrev,
  canNext,
  onNavigate,
  onPreviewStart,
  onPreviewEnd,
}: PageSpreadProps) {
  return (
    <>
      {mode === 'spread' ? (
        <div className="book__half book__half--left">
          {leftPage ? (
            <Page
              magazine={magazine}
              page={leftPage}
              side="left"
              total={pageCount}
              onNavigate={onNavigate}
            />
          ) : (
            <div className="page page--left page--empty" />
          )}
          <div className="book__gutter--left" aria-hidden="true" />
        </div>
      ) : null}

      <div className="book__half book__half--right">
        {rightPage ? (
          <Page
            magazine={magazine}
            page={rightPage}
            side={mode === 'single' ? 'single' : 'right'}
            total={pageCount}
            priority={priority}
            onNavigate={onNavigate}
          />
        ) : (
          <div className="page page--empty" />
        )}
        <div className="book__gutter--right" aria-hidden="true" />
        <div
          className="book__hover book__hover--next"
          data-disabled={!canNext}
          onPointerEnter={onPreviewStart}
          onPointerLeave={onPreviewEnd}
          aria-hidden="true"
        />
      </div>

      {mode === 'spread' ? (
        <div
          className="book__hover book__hover--prev"
          data-disabled={!canPrev}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
