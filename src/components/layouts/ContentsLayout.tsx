import type { Magazine, MagazinePage } from '../../types/magazine';
import { tocFromPages } from '../../types/magazine';
import { pad2 } from '../../lib/utils';
import { Blocks } from '../Blocks';

interface Entry {
  label: string;
  note?: string;
  page: number | null;
}

/**
 * Contents: a printed index with dot leaders. Entries come from the pages that
 * declare a `tocLabel`, so the printed contents and the reader's panel can never
 * drift apart — and each row is clickable in the digital edition.
 */
export function ContentsLayout({
  magazine,
  page,
  onNavigate,
}: {
  magazine: Magazine;
  page: MagazinePage;
  onNavigate?: (pageId: number) => void;
}) {
  const authored = page.blocks?.find((block) => block.kind === 'list');
  const entries: Entry[] =
    authored && authored.kind === 'list'
      ? authored.items.map((item) => ({
          label: item.primary,
          note: item.secondary,
          page: item.tertiary ? Number.parseInt(item.tertiary, 10) : null,
        }))
      : tocFromPages(magazine).map((entry) => ({ label: entry.label, page: entry.page }));

  const rest = page.blocks?.filter((block) => block.kind !== 'list');

  return (
    <div className="contents">
      <span className="contents__edge" aria-hidden="true">
        {magazine.issueLabel} — {magazine.date}
      </span>

      <header className="contents__header">
        <p className="ed-kicker">{page.kicker}</p>
        <h2 className="contents__title">{page.title}</h2>
      </header>

      <ol className="contents__list">
        {entries.map((entry, index) => {
          const target = entry.page;
          const clickable = Boolean(onNavigate) && typeof target === 'number';
          const Row = clickable ? 'button' : 'div';
          return (
            <li key={`${entry.label}-${index}`}>
              <Row
                className="contents__row"
                {...(clickable
                  ? {
                      type: 'button' as const,
                      onClick: () => onNavigate?.(target as number),
                      'aria-label': `Go to ${entry.label}, page ${target}`,
                    }
                  : {})}
              >
                <span className="contents__index">{pad2(index + 1)}</span>
                <span className="contents__label">
                  {entry.label}
                  {entry.note ? <em>{entry.note}</em> : null}
                </span>
                <span className="contents__leader" aria-hidden="true" />
                <span className="contents__page">{target ? pad2(target) : '—'}</span>
              </Row>
            </li>
          );
        })}
      </ol>

      <div className="contents__rest">
        <Blocks blocks={rest} />
      </div>
    </div>
  );
}
