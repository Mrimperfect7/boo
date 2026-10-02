import { useEffect, useState, type RefObject } from 'react';

export interface Size {
  width: number;
  height: number;
}

/** Observes an element's content box. Used to fit the magazine to the viewport. */
export function useElementSize<T extends HTMLElement>(ref: RefObject<T | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const box = entry.contentBoxSize?.[0];
      setSize({
        width: box ? box.inlineSize : entry.contentRect.width,
        height: box ? box.blockSize : entry.contentRect.height,
      });
    });
    observer.observe(element);
    setSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
