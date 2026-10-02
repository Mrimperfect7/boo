import type { ReactNode } from 'react';
import type { Magazine, MagazinePage } from '../types/magazine';
import { cx, pad2 } from '../lib/utils';
import { PageTexture } from './PageTexture';
import { PageRenderer } from './page-renderer';

export type PageSide = 'left' | 'right' | 'single';

export interface PageProps {
  magazine: Magazine;
  page: MagazinePage;
  side: PageSide;
  total: number;
  /** The cover is the first thing seen, so it skips the lazy loader. */
  priority?: boolean;
  /**
   * Faceted copies of a page exist purely for the 3D illusion; they are hidden
   * from assistive technology so content is never announced twelve times.
   */
  ariaHidden?: boolean;
  /** Wired to the contents page so printed entries are clickable. */
  onNavigate?: (pageId: number) => void;
}

/** A single printed page — texture, running head, content and folio. */
export function Page({
  magazine,
  page,
  side,
  total,
  priority = false,
  ariaHidden = false,
  onNavigate,
}: PageProps) {
  const ink = page.tone === 'ink';
  const hideFolio = page.type === 'cover' || page.type === 'back-cover';

  return (
    <article
      className={cx(
        'page',
        `page--${page.type}`,
        ink ? 'page--ink' : 'page--paper',
        `page--${side}`,
      )}
      aria-hidden={ariaHidden || undefined}
      aria-label={ariaHidden ? undefined : `Page ${page.id} of ${total}: ${page.title ?? page.type}`}
    >
      <PageTexture variant={ink ? 'ink' : 'paper'} />

      {page.runningHead && page.type !== 'cover' ? (
        <p className="page__head">{page.runningHead}</p>
      ) : null}

      <div className="page__body">
        <PageRenderer
          magazine={magazine}
          page={page}
          side={side}
          priority={priority}
          onNavigate={onNavigate}
        />
      </div>

      {!hideFolio ? (
        <div className="page__folio">
          <span className="page__folio-rule" aria-hidden="true" />
          <span className="page__folio-num">{pad2(page.id)}</span>
        </div>
      ) : null}
    </article>
  );
}

/** Rendered page content, exposed for layouts that compose pages themselves. */
export function PageContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('page__content', className)}>{children}</div>;
}
