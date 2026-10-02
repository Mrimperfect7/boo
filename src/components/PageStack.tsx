import { useMemo } from 'react';

export interface PageStackProps {
  side: 'left' | 'right';
  /** Number of visible leaves left in this stack. */
  layers: number;
}

const FROM = [239, 232, 218];
const TO = [198, 189, 168];

/**
 * The fore-edge of the magazine: a few offset leaves peeking out from under the
 * current page. Reading the issue visibly moves paper from one side to the other.
 */
export function PageStack({ side, layers }: PageStackProps) {
  const boxShadow = useMemo(() => {
    const count = Math.max(0, Math.min(8, Math.round(layers)));
    const parts: string[] = [];
    for (let i = 1; i <= count; i++) {
      const t = i / Math.max(1, count);
      const rgb = FROM.map((from, index) => Math.round(from + (TO[index] - from) * t)).join(', ');
      const dx = side === 'right' ? i : -i;
      parts.push(`${dx}px ${i}px 0 rgb(${rgb})`);
    }
    return parts.join(', ');
  }, [layers, side]);

  return (
    <div
      className={`stack stack--${side}`}
      style={{ boxShadow }}
      aria-hidden="true"
      data-layers={layers}
    />
  );
}
