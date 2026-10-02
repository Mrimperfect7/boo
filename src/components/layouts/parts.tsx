import type { MagazinePage } from '../../types/magazine';
import { cx } from '../../lib/utils';

/** Editorial header shared by the article-style layouts. */
export function PageHeader({
  page,
  className,
  align = 'left',
}: {
  page: MagazinePage;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <header className={cx('ed-header', align === 'center' && 'ed-header--center', className)}>
      {page.kicker ? <p className="ed-kicker">{page.kicker}</p> : null}
      {page.title ? <h2 className="ed-title">{page.title}</h2> : null}
      {page.standfirst ? <p className="ed-standfirst">{page.standfirst}</p> : null}
      {page.byline ? <p className="ed-byline">{page.byline}</p> : null}
      <span className="ed-header__rule" aria-hidden="true" />
    </header>
  );
}

/** Plate caption printed over the bottom of a full-bleed photograph. */
export function PlateCaption({
  label,
  title,
  caption,
  credit,
}: {
  label?: string;
  title?: string;
  caption?: string;
  credit?: string;
}) {
  return (
    <div className="plate-caption">
      {label ? <p className="plate-caption__label">{label}</p> : null}
      {title ? <p className="plate-caption__title">{title}</p> : null}
      {caption ? <p className="plate-caption__text">{caption}</p> : null}
      {credit ? <p className="plate-caption__credit">Photograph — {credit}</p> : null}
    </div>
  );
}

/** Thin rule that reads as one continuous line across the gutter. */
export function SpreadRule({ label }: { label?: string }) {
  return (
    <div className="spread-rule" aria-hidden="true">
      {label ? <span>{label}</span> : null}
    </div>
  );
}
