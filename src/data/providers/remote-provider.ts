import type { MagazineSource } from '../../types/magazine';
import { MagazineDataError, normalizeMagazine } from '../normalize';

export interface RemoteSourceOptions {
  /** Endpoint returning a magazine payload (`{ title, pages: [...] }`). */
  url: string;
  headers?: Record<string, string>;
  /** Optional credentials — `include` for cookie-based auth. */
  credentials?: RequestCredentials;
  label?: string;
}

/**
 * Loads a magazine from any JSON endpoint — a REST API, a CMS delivery URL,
 * a Firebase callable, a Supabase edge function or a static file in storage.
 *
 * ```ts
 * const source = createRemoteSource({
 *   url: 'https://cms.example.com/api/issues/07',
 *   headers: { Authorization: `Bearer ${token}` },
 * });
 * ```
 */
export function createRemoteSource({
  url,
  headers,
  credentials,
  label = 'Remote issue',
}: RemoteSourceOptions): MagazineSource {
  return {
    id: `remote:${url}`,
    label,
    async load(signal?: AbortSignal) {
      const response = await fetch(url, {
        signal,
        headers: { Accept: 'application/json', ...headers },
        credentials,
      });
      if (!response.ok) {
        throw new MagazineDataError(`Magazine request failed (${response.status}).`);
      }
      const payload: unknown = await response.json();
      // Some backends wrap the issue: `{ data: { ... } }`
      const record = payload as Record<string, unknown> | null;
      const candidate =
        record && typeof record === 'object' && 'data' in record ? record.data : payload;
      return normalizeMagazine(candidate);
    },
  };
}

/** Uses `VITE_MAGAZINE_URL` when set, otherwise falls back to the sample issue. */
export const configuredMagazineUrl: string | undefined = import.meta.env.VITE_MAGAZINE_URL;
