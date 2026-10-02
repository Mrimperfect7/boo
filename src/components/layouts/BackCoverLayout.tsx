import type { Magazine, MagazinePage } from '../../types/magazine';
import { Blocks } from '../Blocks';

/** Back cover: masthead, next-issue teaser, barcode and the small print. */
export function BackCoverLayout({ magazine, page }: { magazine: Magazine; page: MagazinePage }) {
  const blocks = page.blocks?.filter((block) => block.kind !== 'headline');
  const extras = page.blocks?.find((block) => block.kind === 'text');

  return (
    <div className="back-cover">
      <div className="back-cover__top">
        <p className="back-cover__masthead">{magazine.title}</p>
        <p className="back-cover__tagline">{magazine.tagline}</p>
      </div>

      <div className="back-cover__next">
        {page.kicker ? <p className="ed-kicker ed-kicker--light">{page.kicker}</p> : null}
        {page.title ? <p className="back-cover__issue">{page.title}</p> : null}
        {page.subtitle ? <p className="back-cover__standfirst">{page.subtitle}</p> : null}
      </div>

      <div className="back-cover__body">
        {extras && extras.kind === 'text' ? (
          <p className="back-cover__line">{extras.body[0]}</p>
        ) : null}
        <Blocks blocks={blocks?.filter((block) => block.kind !== 'text')} />
      </div>

      <div className="back-cover__foot">
        <div className="back-cover__barcode" aria-hidden="true">
          <span />
          <em>ISBN 978-2-514-0773-{magazine.issue}</em>
        </div>
        <p className="back-cover__print">
          Printed in Belgium by Van der Meer on 300gsm uncoated board. {magazine.date}.{' '}
          {magazine.price}
        </p>
      </div>
    </div>
  );
}
