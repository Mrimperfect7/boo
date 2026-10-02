import type { MagazinePage } from '../../types/magazine';
import { Photo } from '../Photo';
import { PlateCaption } from './parts';

/**
 * Full-bleed layouts: the cover-story opener and the photographic plates.
 * The photograph is the page — type sits on it and never competes with it.
 */
export function FeatureLayout({ page, priority }: { page: MagazinePage; priority: boolean }) {
  const image = page.image;
  const isPlate = page.type === 'photography' || page.type === 'image';

  return (
    <div className={`feature feature--${page.type}`}>
      {image ? (
        <div className="feature__image">
          <Photo
            src={image}
            alt={page.caption ?? page.title ?? 'Editorial photograph'}
            tone={isPlate ? 'mono' : 'duotone'}
            priority={priority}
          />
        </div>
      ) : null}
      <div className="feature__scrim" aria-hidden="true" />

      {isPlate ? (
        <PlateCaption
          label={page.kicker}
          title={page.title}
          caption={page.caption}
          credit={page.imageCredit}
        />
      ) : (
        <div className="feature__copy">
          {page.kicker ? <p className="ed-kicker ed-kicker--light">{page.kicker}</p> : null}
          {page.title ? <h2 className="feature__title">{page.title}</h2> : null}
          {page.standfirst ? <p className="feature__standfirst">{page.standfirst}</p> : null}
          {page.byline ? <p className="ed-byline ed-byline--light">{page.byline}</p> : null}
          {page.caption ? <p className="feature__caption">{page.caption}</p> : null}
        </div>
      )}
    </div>
  );
}
