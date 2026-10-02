/**
 * Magazine data model.
 *
 * The reader is content-agnostic: it renders whatever a `MagazineSource`
 * resolves to. Swap the sample source for a CMS, Firebase, Supabase, REST
 * endpoint or a PDF pipeline without touching a single component.
 */

export type MagazinePageType =
  | 'cover'
  | 'contents'
  | 'article'
  | 'editorial'
  | 'feature'
  | 'image'
  | 'photography'
  | 'spread'
  | 'interview'
  | 'lifestyle'
  | 'technology'
  | 'quote'
  | 'advertisement'
  | 'back-cover';

/** Colour treatment applied to a photograph by the layout. */
export type PhotoTone = 'color' | 'mono' | 'duotone';

export type PageBlock =
  | {
      kind: 'text';
      body: string[];
      columns?: 1 | 2 | 3;
      dropCap?: boolean;
      lead?: boolean;
    }
  | {
      kind: 'headline';
      text: string;
      level?: 'display' | 'title' | 'sub' | 'kicker';
      align?: 'left' | 'center';
    }
  | {
      kind: 'figure';
      image: string;
      caption?: string;
      credit?: string;
      aspect?: number;
      bleed?: boolean;
      tone?: PhotoTone;
    }
  | {
      kind: 'quote';
      text: string;
      attribution?: string;
      role?: string;
    }
  | {
      kind: 'qa';
      items: { q: string; a: string }[];
    }
  | {
      kind: 'meta';
      title?: string;
      columns?: 1 | 2;
      items: { label: string; value: string }[];
    }
  | {
      kind: 'stats';
      title?: string;
      items: { label: string; display: string; value: number }[];
    }
  | { kind: 'rule'; label?: string }
  | {
      kind: 'list';
      title?: string;
      items: { primary: string; secondary?: string; tertiary?: string }[];
    }
  | { kind: 'note'; label?: string; text: string }
  | {
      kind: 'ad';
      brand: string;
      tagline: string;
      body?: string;
      image?: string;
      cta?: string;
      finePrint?: string;
    };

export interface MagazinePage {
  /** Printed page number (1-based). */
  id: number;
  type: MagazinePageType;
  title?: string;
  subtitle?: string;
  /** Plain-text fallback of the page body — used for a11y, search and PDF text layers. */
  content?: string;
  image?: string;
  caption?: string;
  kicker?: string;
  standfirst?: string;
  byline?: string;
  imageCredit?: string;
  /** Running head printed at the top of the page. */
  runningHead?: string;
  /** `ink` pages are printed dark (photo plates, ads, back cover). */
  tone?: 'paper' | 'ink';
  blocks?: PageBlock[];
  /** When present the page is listed in the interactive contents panel. */
  tocLabel?: string;
}

export interface MagazineCover {
  image: string;
  /** Cover headlines — the "sell lines" of a printed cover. */
  lines: { title: string; note?: string }[];
  badges?: string[];
}

export interface Magazine {
  id: string;
  title: string;
  tagline?: string;
  issue: string;
  issueLabel: string;
  date: string;
  price?: string;
  accent?: string;
  cover: MagazineCover;
  pages: MagazinePage[];
  credits?: { role: string; name: string }[];
}

/** A pluggable content origin: sample data, CMS, API, uploads, PDF… */
export interface MagazineSource {
  id: string;
  label: string;
  load: (signal?: AbortSignal) => Promise<Magazine>;
}

export interface TocEntry {
  label: string;
  page: number;
  type: MagazinePageType;
}

/** Reading preferences (persisted to localStorage). */
export interface ReaderSettings {
  sound: boolean;
  volume: number;
  /** `auto` follows the OS `prefers-reduced-motion` setting. */
  motion: 'auto' | 'on' | 'off';
  /** `auto` = two-page spread on wide screens, single page on phones. */
  view: 'auto' | 'spread' | 'single';
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  sound: false,
  volume: 0.5,
  motion: 'auto',
  view: 'auto',
};

export function tocFromPages(magazine: Magazine): TocEntry[] {
  return magazine.pages
    .filter((page) => Boolean(page.tocLabel))
    .map((page) => ({ label: page.tocLabel as string, page: page.id, type: page.type }))
    .sort((a, b) => a.page - b.page);
}
