import type { MagazinePage } from '../../types/magazine';
import { Blocks } from '../Blocks';
import { PageHeader } from './parts';

/**
 * Article layouts — editor's note, features, lifestyle and technology pages.
 * One header, then whatever blocks the issue authored.
 */
export function EditorialLayout({ page }: { page: MagazinePage }) {
  return (
    <div className={`editorial editorial--${page.type}`}>
      <PageHeader page={page} />
      <div className="editorial__body">
        <Blocks blocks={page.blocks} />
      </div>
      {page.imageCredit ? (
        <p className="editorial__credit">Photography — {page.imageCredit}</p>
      ) : null}
    </div>
  );
}
