import type { CSSProperties } from 'react';
import type { Magazine } from '../types/magazine';
import { Page } from './Page';
import './MagazineCover.css';

export interface MagazineCoverProps {
  magazine: Magazine;
  /** Sheet width in px — the whole cover scales from this. */
  width?: number;
  className?: string;
}

/**
 * The cover as a standalone object, used by the opening sequence so the issue
 * grows out of the loading screen and into the reader without a hard cut.
 */
export function MagazineCover({ magazine, width = 380, className }: MagazineCoverProps) {
  const cover = magazine.pages[0];
  if (!cover) return null;

  return (
    <div
      className={`cover-frame${className ? ` ${className}` : ''}`}
      style={{ '--page-w': `${width}px`, '--page-h': `${width / 0.75}px` } as CSSProperties}
    >
      <Page
        magazine={magazine}
        page={cover}
        side="single"
        total={magazine.pages.length}
        priority
      />
    </div>
  );
}
