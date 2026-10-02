import type { PageBlock } from '../types/magazine';
import { cx } from '../lib/utils';
import { Photo } from './Photo';

/** A piece of structured editorial content. Layouts compose these freely. */
export function Blocks({ blocks }: { blocks?: PageBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </>
  );
}

function Block({ block }: { block: PageBlock }) {
  switch (block.kind) {
    case 'text': {
      const { columns = 1, dropCap = false, lead = false } = block;
      return (
        <div
          className={cx(
            'block-text',
            columns > 1 && `block-text--cols${columns}`,
            dropCap && 'block-text--dropcap',
            lead && 'block-text--lead',
          )}
        >
          {block.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      );
    }

    case 'headline': {
      const level = block.level ?? 'title';
      const Tag = level === 'display' ? 'h1' : level === 'title' ? 'h2' : level === 'sub' ? 'h3' : 'p';
      return (
        <Tag
          className={cx(
            'block-headline',
            `block-headline--${level}`,
            block.align === 'center' && 'block-headline--center',
          )}
        >
          {block.text}
        </Tag>
      );
    }

    case 'figure': {
      const aspect = block.aspect ?? 0.72;
      return (
        <figure
          className={cx('block-figure', block.bleed && 'block-figure--bleed')}
          style={{ aspectRatio: String(block.bleed ? 'auto' : aspect) }}
        >
          <Photo src={block.image} alt={block.caption ?? 'Editorial photograph'} tone={block.tone} />
          {block.caption || block.credit ? (
            <figcaption className="block-figure__caption">
              {block.caption ? <span>{block.caption}</span> : null}
              {block.credit ? <span className="block-figure__credit">{block.credit}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case 'quote':
      return (
        <blockquote className="block-quote">
          <p>{block.text}</p>
          {block.attribution ? (
            <footer>
              <span className="block-quote__name">{block.attribution}</span>
              {block.role ? <span className="block-quote__role">{block.role}</span> : null}
            </footer>
          ) : null}
        </blockquote>
      );

    case 'qa':
      return (
        <div className="block-qa">
          {block.items.map((item, index) => (
            <div className="block-qa__item" key={index}>
              <p className="block-qa__q">{item.q}</p>
              <p className="block-qa__a">{item.a}</p>
            </div>
          ))}
        </div>
      );

    case 'meta':
      return (
        <div className={cx('block-meta', block.columns === 2 && 'block-meta--cols2')}>
          {block.title ? <p className="block-meta__title">{block.title}</p> : null}
          <div className="block-meta__grid">
            {block.items.map((item) => (
              <div className="block-meta__row" key={item.label}>
                <span className="block-meta__label">{item.label}</span>
                <span className="block-meta__value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className="block-stats">
          {block.title ? <p className="block-stats__title">{block.title}</p> : null}
          {block.items.map((item) => (
            <div className="block-stats__row" key={item.label}>
              <div className="block-stats__head">
                <span className="block-stats__label">{item.label}</span>
                <span className="block-stats__value">{item.display}</span>
              </div>
              <div className="block-stats__bar">
                <i style={{ width: `${Math.round(Math.max(0, Math.min(1, item.value)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'rule':
      return (
        <div className="block-rule" aria-hidden="true">
          {block.label ? <span>{block.label}</span> : null}
        </div>
      );

    case 'list':
      return (
        <div className="block-list">
          {block.title ? <p className="block-list__title">{block.title}</p> : null}
          <ol>
            {block.items.map((item) => (
              <li className="block-list__row" key={item.primary}>
                <span className="block-list__primary">{item.primary}</span>
                {item.secondary ? <span className="block-list__secondary">{item.secondary}</span> : null}
                <span className="block-list__leader" aria-hidden="true" />
                {item.tertiary ? <span className="block-list__tertiary">{item.tertiary}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      );

    case 'note':
      return (
        <aside className="block-note">
          {block.label ? <span className="block-note__label">{block.label}</span> : null}
          <p>{block.text}</p>
        </aside>
      );

    case 'ad':
      return (
        <div className="block-ad">
          <p className="block-ad__brand">{block.brand}</p>
          {block.image ? (
            <div className="block-ad__image">
              <Photo src={block.image} alt={block.tagline} tone="mono" />
            </div>
          ) : null}
          <p className="block-ad__tagline">{block.tagline}</p>
          {block.body ? <p className="block-ad__body">{block.body}</p> : null}
          {block.cta ? <p className="block-ad__cta">{block.cta}</p> : null}
          {block.finePrint ? <p className="block-ad__fine">{block.finePrint}</p> : null}
        </div>
      );

    default:
      return null;
  }
}
