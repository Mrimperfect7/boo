import { useEffect, useState } from 'react';

export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? fallback : window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Wide enough for a true two-page spread. */
export function useIsWide(): boolean {
  return useMediaQuery('(min-width: 900px) and (orientation: landscape)', true);
}

/** Coarse pointer — phones and tablets. */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}
