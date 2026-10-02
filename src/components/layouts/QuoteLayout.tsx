import type { MagazinePage } from '../../types/magazine';
import { Blocks } from '../Blocks';
import { PageHeader } from './parts';

/** A page given over entirely to one line of type. */
export function QuoteLayout({ page }: { page: MagazinePage }) {
  const quote = page.blocks?.find((block) => block.kind === 'quote');
  const rest = page.blocks?.filter(
    (block) => block.kind !== 'quote' && block.kind !== 'rule',
  );

  return (
    <div className="quote-page">
      <PageHeader page={page} align="center" />
      {quote && quote.kind === 'quote' ? (
        <blockquote className="quote-page__quote">
          <span className="quote-page__mark" aria-hidden="true">
            “
          </span>
          <p>{quote.text}</p>
          {quote.attribution ? (
            <footer>
              <span className="quote-page__name">{quote.attribution}</span>
              {quote.role ? <span className="quote-page__role">{quote.role}</span> : null}
            </footer>
          ) : null}
        </blockquote>
      ) : null}
      <div className="quote-page__rest">
        <Blocks blocks={rest} />
      </div>
    </div>
  );
}
