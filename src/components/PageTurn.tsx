import { useEffect, useRef } from 'react';
import type { Magazine, MagazinePage } from '../types/magazine';
import type { FlipEmit, FlipListener } from '../engine/use-page-turn';
import { Page } from './Page';
import { PageTexture } from './PageTexture';
import './book.css';

export interface PageTurnProps {
  magazine: Magazine;
  /** Index of the leaf being turned (0-based). */
  sheetIndex: number;
  mode: 'spread' | 'single';
  strips: number;
  pageWidth: number;
  pageCount: number;
  subscribe: (listener: FlipListener) => () => void;
}

type RefList = { current: Array<HTMLDivElement | null> };

const refAt = (list: RefList, index: number) => (el: HTMLDivElement | null) => {
  list.current[index] = el;
};

/**
 * The leaf in flight.
 *
 * Both sides of the paper are rendered as the *same* faceted surface: a chain
 * of narrow slices, each placed at the true projected position of its joint and
 * rotated to the sheet's tangent angle there. The reverse side is a second
 * chain offset a hair behind the first along the surface normal, with its
 * content mirrored — so front and back always describe one bent sheet, and the
 * page you reveal is the physical back of the page you grabbed.
 *
 * Transforms are written straight to the DOM per frame; React never re-renders
 * during a turn.
 */
export function PageTurn({
  magazine,
  sheetIndex,
  mode,
  strips,
  pageWidth,
  pageCount,
  subscribe,
}: PageTurnProps) {
  const castRightRef = useRef<HTMLDivElement | null>(null);
  const castLeftRef = useRef<HTMLDivElement | null>(null);
  const facets = useRef<Array<HTMLDivElement | null>>([]);
  const backFacets = useRef<Array<HTMLDivElement | null>>([]);
  const shades = useRef<Array<HTMLDivElement | null>>([]);
  const backShades = useRef<Array<HTMLDivElement | null>>([]);
  const sheens = useRef<Array<HTMLDivElement | null>>([]);
  const backSheens = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const DEG = Math.PI / 180;
    const apply = ({ frame }: FlipEmit): void => {
      const { facets: chain, freeEdgeX, castShadow, dim, sheen, progress } = frame;

      for (let i = 0; i < chain.length; i++) {
        const joint = chain[i];
        const radians = joint.angle * DEG;
        const x = joint.x.toFixed(2);
        const z = joint.z.toFixed(2);
        // A hair behind the front surface, along its normal, so the two sides
        // of the sheet never z-fight.
        const bx = (joint.x - 0.9 * Math.sin(radians)).toFixed(2);
        const bz = (joint.z - 0.9 * Math.cos(radians)).toFixed(2);

        const front = facets.current[i];
        if (front) {
          front.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${joint.angle.toFixed(2)}deg)`;
        }
        const back = backFacets.current[i];
        if (back) {
          back.style.transform = `translate3d(${bx}px, 0, ${bz}px) rotateY(${joint.angle.toFixed(2)}deg)`;
        }

        // Paper darkens as it turns away from the reading light.
        const alpha = Math.min(0.8, 0.05 + Math.min(1, joint.shade * 1.08) * 0.42 + dim);
        const shade = shades.current[i];
        if (shade) shade.style.opacity = alpha.toFixed(3);
        const backShade = backShades.current[i];
        if (backShade) backShade.style.opacity = (alpha + 0.04).toFixed(3);

        // A narrow specular band travels along the sheet mid-turn.
        const t = (i + 0.5) / chain.length;
        const highlight = Math.max(0, 1 - Math.abs(t - sheen) * 2.6) * frame.edgeOn * 0.4;
        const sheenEl = sheens.current[i];
        if (sheenEl) sheenEl.style.opacity = highlight.toFixed(3);
        const backSheen = backSheens.current[i];
        if (backSheen) backSheen.style.opacity = (highlight * 0.65).toFixed(3);
      }

      // The leaf's shadow on the page beneath it.
      const spread = Math.max(0, Math.min(Math.abs(freeEdgeX), pageWidth));
      const right = castRightRef.current;
      if (right) {
        right.style.width = `${spread.toFixed(1)}px`;
        right.style.opacity = (progress < 0.5 ? castShadow : 0).toFixed(3);
      }
      const left = castLeftRef.current;
      if (left) {
        left.style.width = `${spread.toFixed(1)}px`;
        left.style.opacity = (progress >= 0.5 ? castShadow : 0).toFixed(3);
      }
    };

    return subscribe(apply);
  }, [pageWidth, subscribe]);

  // ── Page content ───────────────────────────────────────────────────────────
  const frontPage: MagazinePage | undefined =
    mode === 'single' ? magazine.pages[sheetIndex] : magazine.pages[sheetIndex * 2];
  const backPage: MagazinePage | undefined =
    mode === 'single' ? undefined : magazine.pages[sheetIndex * 2 + 1];

  const renderFacet = (index: number, face: 'front' | 'back') => {
    const list = face === 'front' ? facets : backFacets;
    const page = face === 'front' ? frontPage : backPage;
    const side = face === 'front' ? 'right' : 'left';

    return (
      <div
        key={`${face}-${index}`}
        className={`facet facet--${face}`}
        ref={refAt(list, index)}
        style={{ width: `calc(${100 / strips}% + 0.8px)` }}
      >
        <div
          className={`facet__inner${face === 'back' ? ' facet__inner--mirror' : ''}`}
          style={{
            left: `${-index * 100}%`,
            transformOrigin:
              face === 'back' ? `${(((index + 0.5) / strips) * 100).toFixed(3)}% 50%` : undefined,
          }}
          aria-hidden="true"
        >
          {page ? (
            <Page magazine={magazine} page={page} side={side} total={pageCount} ariaHidden />
          ) : (
            <div className={`page page--${side} page--blank`}>
              <PageTexture variant="paper" />
            </div>
          )}
        </div>
        <div
          className="facet__shade"
          ref={face === 'front' ? refAt(shades, index) : refAt(backShades, index)}
        />
        <div
          className="facet__sheen"
          ref={face === 'front' ? refAt(sheens, index) : refAt(backSheens, index)}
        />
      </div>
    );
  };

  return (
    <>
      <div className="book__cast book__cast--right" ref={castRightRef} aria-hidden="true" />
      <div className="book__cast book__cast--left" ref={castLeftRef} aria-hidden="true" />
      <div className="sheet" aria-hidden="true">
        {Array.from({ length: strips }, (_, index) => renderFacet(index, 'front'))}
        {Array.from({ length: strips }, (_, index) => renderFacet(index, 'back'))}
      </div>
    </>
  );
}
