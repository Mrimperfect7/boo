import { useState } from 'react';
import type { PhotoTone } from '../types/magazine';
import { cx } from '../lib/utils';
import './Photo.css';

export interface PhotoProps {
  src: string;
  alt: string;
  tone?: PhotoTone;
  className?: string;
  /** Cover art and the first spread load eagerly; everything else waits. */
  priority?: boolean;
  /** `sizes` hint for the browser. */
  sizes?: string;
}

/**
 * Doubles the requested raster size for 2× displays. Only applied to the
 * deterministic photo host used by the sample issue — any other URL is served
 * exactly as authored.
 */
function retinaSrc(src: string): string | null {
  const match = /^(https:\/\/picsum\.photos\/seed\/[^/]+)\/(\d+)\/(\d+)(\?.*)?$/.exec(src);
  if (!match) return null;
  const [, base, width, height, query = ''] = match;
  return `${base}/${Number(width) * 2}/${Number(height) * 2}${query}`;
}

/**
 * Photograph with a skeleton while loading and an art-directed plate if the
 * image never arrives — a page must never look broken mid-read.
 */
export function Photo({ src, alt, tone = 'color', className, priority = false, sizes }: PhotoProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const srcSet = retinaSrc(src);

  return (
    <div className={cx('photo', `photo--${tone}`, `photo--${status}`, className)}>
      <div className="photo__plate" aria-hidden="true">
        <span className="photo__plate-mark" />
      </div>
      {status !== 'error' ? (
        <img
          className="photo__img"
          src={src}
          srcSet={srcSet ? `${src} 1x, ${srcSet} 2x` : undefined}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      ) : null}
      {tone !== 'color' ? <div className="photo__tone" aria-hidden="true" /> : null}
    </div>
  );
}
