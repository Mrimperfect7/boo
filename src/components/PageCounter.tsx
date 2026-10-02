import { useEffect, useRef, type CSSProperties } from 'react';
import { formatPageRange } from '../lib/utils';
import './PageCounter.css';

export interface PageCounterProps {
  left: number | null;
  right: number | null;
  total: number;
  visible: boolean;
  /** Paper moves as the leaf lifts, so the counter can breathe with it. */
  lift?: number;
}

/**
 * The large folio readout: `08 — 09 / 16`. Numbers roll when they change, the
 * way a press-room counter would.
 */
export function PageCounter({ left, right, total, visible, lift = 0 }: PageCounterProps) {
  const label = `${formatPageRange(left, right)} / ${String(total).padStart(2, '0')}`;
  const ref = useRef<HTMLParagraphElement | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const node = ref.current;
    if (!node) return;
    node.classList.remove('page-counter__label--roll');
    void node.offsetWidth;
    node.classList.add('page-counter__label--roll');
  }, [label]);

  return (
    <div
      className="page-counter"
      data-visible={visible}
      aria-live="polite"
      aria-atomic="true"
      style={{ '--lift': lift.toFixed(3) } as CSSProperties}
    >
      <p className="page-counter__label" ref={ref} key={label}>
        <span className="page-counter__spread">{label}</span>
      </p>
      <span className="page-counter__issue">ISSUE 07 — THE CRAFT ISSUE</span>
    </div>
  );
}
