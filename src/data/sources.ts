import type { MagazineSource } from '../types/magazine';
import { sampleMagazineSource } from './providers/sample-provider';
import { configuredMagazineUrl, createRemoteSource } from './providers/remote-provider';

/**
 * The reader asks for *a* source and never cares where the issue came from.
 * Point `VITE_MAGAZINE_URL` at a CMS/API/Supabase endpoint and the sample issue
 * steps aside automatically.
 */
export function resolveMagazineSource(): MagazineSource {
  if (configuredMagazineUrl) {
    return createRemoteSource({ url: configuredMagazineUrl, label: 'Live issue' });
  }
  return sampleMagazineSource;
}
