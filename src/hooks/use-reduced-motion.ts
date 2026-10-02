import { useMediaQuery } from './use-media-query';

/**
 * Resolves the effective motion preference: the OS setting wins unless the
 * reader has explicitly overridden it in the settings panel.
 */
export function useReducedMotion(preference: 'auto' | 'on' | 'off'): boolean {
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');
  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return system;
}
