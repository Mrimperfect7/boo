import type { MagazinePage } from '../../types/magazine';
import { Blocks } from '../Blocks';

/** Advertisement page — dark, quiet, one product, one line. */
export function AdLayout({ page }: { page: MagazinePage }) {
  const ad = page.blocks?.find((block) => block.kind === 'ad');

  return (
    <div className="ad-page">
      <span className="ad-page__label" aria-hidden="true">
        Advertisement
      </span>
      {ad && ad.kind === 'ad' ? (
        <div className="ad-page__inner">
          <p className="ad-page__brand">{ad.brand}</p>
          {ad.image ? (
            <div className="ad-page__image">
              <img src={ad.image} alt={ad.tagline} loading="lazy" decoding="async" draggable={false} />
            </div>
          ) : null}
          <p className="ad-page__tagline">{ad.tagline}</p>
          {ad.body ? <p className="ad-page__body">{ad.body}</p> : null}
          {ad.cta ? <p className="ad-page__cta">{ad.cta}</p> : null}
        </div>
      ) : (
        <Blocks blocks={page.blocks} />
      )}
    </div>
  );
}
