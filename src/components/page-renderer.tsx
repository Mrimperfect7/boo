import type { Magazine, MagazinePage, PhotoTone } from '../types/magazine';
import { Blocks } from './Blocks';
import { CoverLayout } from './layouts/CoverLayout';
import { ContentsLayout } from './layouts/ContentsLayout';
import { EditorialLayout } from './layouts/EditorialLayout';
import { FeatureLayout } from './layouts/FeatureLayout';
import { InterviewLayout } from './layouts/InterviewLayout';
import { SpreadLayout } from './layouts/SpreadLayout';
import { QuoteLayout } from './layouts/QuoteLayout';
import { AdLayout } from './layouts/AdLayout';
import { BackCoverLayout } from './layouts/BackCoverLayout';
import type { PageSide } from './Page';
import './layouts/layouts.css';

export interface PageRendererProps {
  magazine: Magazine;
  page: MagazinePage;
  side: PageSide;
  priority: boolean;
  /** Wired to the contents page so printed entries are clickable. */
  onNavigate?: (pageId: number) => void;
}

/**
 * Dispatches a page to its editorial layout. Every layout is a pure function of
 * the page data, which keeps the reader free of content assumptions.
 */
export function PageRenderer(props: PageRendererProps) {
  const { page, magazine, side } = props;

  switch (page.type) {
    case 'cover':
      return <CoverLayout magazine={magazine} page={page} priority={props.priority} />;
    case 'back-cover':
      return <BackCoverLayout magazine={magazine} page={page} />;
    case 'contents':
      return <ContentsLayout magazine={magazine} page={page} onNavigate={props.onNavigate} />;
    case 'advertisement':
      return <AdLayout page={page} />;
    case 'quote':
      return <QuoteLayout page={page} />;
    case 'feature':
    case 'photography':
    case 'image':
      return <FeatureLayout page={page} priority={props.priority} />;
    case 'interview':
      return <InterviewLayout page={page} />;
    case 'spread':
      return <SpreadLayout page={page} side={side} priority={props.priority} />;
    case 'editorial':
    case 'article':
    case 'lifestyle':
    case 'technology':
      return <EditorialLayout page={page} />;
    default:
      return <Blocks blocks={page.blocks} />;
  }
}

export type { PhotoTone };
