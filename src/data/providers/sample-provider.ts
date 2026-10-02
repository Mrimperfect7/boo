import type { MagazineSource } from '../../types/magazine';
import { normalizeMagazine } from '../normalize';
import { sampleMagazine } from '../sample-magazine';

/**
 * Bundled sample issue. The payload is passed through `normalizeMagazine`, so
 * the exact same validation path is used for remote/CMS data.
 */
export const sampleMagazineSource: MagazineSource = {
  id: 'sample',
  label: 'MERIDIAN 07 — The Craft Issue',
  async load(signal?: AbortSignal) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return normalizeMagazine(sampleMagazine);
  },
};
