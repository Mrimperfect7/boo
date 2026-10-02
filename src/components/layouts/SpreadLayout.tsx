import type { MagazinePage } from '../../types/magazine';
import type { PageSide } from '../Page';
import { Photo } from '../Photo';
import { Blocks } from '../Blocks';
import { PageHeader, SpreadRule } from './parts';

/**
 * The two-page editorial spread. The left half is a full-bleed photograph that
 * runs to the gutter; the facing page carries the words, with a rule that lines
 * up at the same height so the pair reads as one sheet.
 */
export function SpreadLayout({
  page,
  side,
  priority,
}: {
  page: MagazinePage;
  side: PageSide;
  priority: boolean;
}) {
  if (side === 'right') {
    return (
      <div className="spread spread--text">
        <SpreadRule label={page.runningHead} />
        <PageHeader page={page} />
        <div className="spread__body">
          <Blocks blocks={page.blocks} />
        </div>
        <p className="spread__foot">{page.byline}</p>
      </div>
    );
  }

  return (
    <div className="spread spread--image">
      <SpreadRule />
      {page.image ? (
        <figure className="spread__figure">
          <Photo
            src={page.image}
            alt={page.caption ?? page.title ?? 'Studio photograph'}
            tone="mono"
            priority={priority}
          />
        </figure>
      ) : null}
      <div className="spread__caption">
        <p className="spread__caption-title">{page.title}</p>
        {page.caption ? <p>{page.caption}</p> : null}
        {page.imageCredit ? <p className="spread__credit">{page.imageCredit}</p> : null}
      </div>
    </div>
  );
}
