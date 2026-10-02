import type { MagazinePage } from '../../types/magazine';
import { Photo } from '../Photo';
import { PageHeader } from './parts';

/** Interview: portrait column on the left, questions and answers on the right. */
export function InterviewLayout({ page }: { page: MagazinePage }) {
  const qa = page.blocks?.find((block) => block.kind === 'qa');
  const extras = page.blocks?.filter((block) => block.kind !== 'qa');

  return (
    <div className="interview">
      <PageHeader page={page} />

      <div className="interview__grid">
        <div className="interview__portrait">
          {page.image ? (
            <figure className="interview__figure">
              <Photo
                src={page.image}
                alt={page.caption ?? `Portrait of ${page.title ?? 'the interviewee'}`}
                tone="mono"
              />
              <figcaption>
                {page.caption}
                {page.imageCredit ? (
                  <span className="interview__credit">Photograph — {page.imageCredit}</span>
                ) : null}
              </figcaption>
            </figure>
          ) : null}
        </div>

        <div className="interview__qa">
          {qa && qa.kind === 'qa' ? (
            <div className="block-qa block-qa--tight">
              {qa.items.map((item, index) => (
                <div className="block-qa__item" key={index}>
                  <p className="block-qa__q">{item.q}</p>
                  <p className="block-qa__a">{item.a}</p>
                </div>
              ))}
            </div>
          ) : null}
          {extras?.length ? (
            <div className="interview__extras">
              {extras.map((block, index) =>
                block.kind === 'note' ? (
                  <aside className="block-note" key={index}>
                    {block.label ? <span className="block-note__label">{block.label}</span> : null}
                    <p>{block.text}</p>
                  </aside>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
