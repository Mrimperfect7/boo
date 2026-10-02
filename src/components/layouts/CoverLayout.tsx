import type { Magazine, MagazinePage } from '../../types/magazine';
import { pad2 } from '../../lib/utils';
import { Photo } from '../Photo';

/**
 * Front cover: full-bleed photograph, masthead, issue line and sell lines —
 * the printed cover of the issue, laid out as a real one.
 */
export function CoverLayout({
  magazine,
  page,
  priority,
}: {
  magazine: Magazine;
  page: MagazinePage;
  priority: boolean;
}) {
  const cover = magazine.cover;

  return (
    <div className="cover">
      <div className="cover__image">
        <Photo
          src={cover.image}
          alt={`${magazine.title}, ${magazine.issueLabel} — ${page.title ?? 'cover'}`}
          tone="duotone"
          priority={priority}
        />
      </div>
      <div className="cover__scrim" aria-hidden="true" />

      <div className="cover__top">
        <p className="cover__tagline">{magazine.tagline}</p>
        <h1 className="cover__masthead">{magazine.title}</h1>
        <div className="cover__issue">
          {(cover.badges ?? [magazine.issueLabel, magazine.date]).map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
      </div>

      <div className="cover__lines">
        {cover.lines.map((line, index) => (
          <div className="cover__line" key={line.title}>
            <span className="cover__line-index">{pad2(index + 1)}</span>
            <span className="cover__line-text">
              <span className="cover__line-title">{line.title}</span>
              {line.note ? <span className="cover__line-note">{line.note}</span> : null}
            </span>
          </div>
        ))}
      </div>

      <div className="cover__foot">
        <span>{magazine.date}</span>
        {magazine.price ? <span className="cover__price">{magazine.price}</span> : null}
      </div>

      <span className="cover__spine-mark" aria-hidden="true" />
    </div>
  );
}
