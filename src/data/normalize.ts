import type {
  Magazine,
  MagazineCover,
  MagazinePage,
  MagazinePageType,
  PageBlock,
  PhotoTone,
} from '../types/magazine';

export class MagazineDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MagazineDataError';
  }
}

type Json = Record<string, unknown>;

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const str = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const strArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === 'string');
  return items.length > 0 ? items : undefined;
};

const PAGE_TYPES: MagazinePageType[] = [
  'cover',
  'contents',
  'article',
  'editorial',
  'feature',
  'image',
  'photography',
  'spread',
  'interview',
  'lifestyle',
  'technology',
  'quote',
  'advertisement',
  'back-cover',
];

const TONES: PhotoTone[] = ['color', 'mono', 'duotone'];

function normalizeBlock(raw: unknown): PageBlock | null {
  if (!isRecord(raw)) return null;
  const kind = str(raw.kind);
  switch (kind) {
    case 'text': {
      const body = strArray(raw.body);
      if (!body) return null;
      const columns = num(raw.columns, 1);
      return {
        kind: 'text',
        body,
        columns: columns === 3 ? 3 : columns === 2 ? 2 : 1,
        dropCap: raw.dropCap === true,
        lead: raw.lead === true,
      };
    }
    case 'headline': {
      const text = str(raw.text);
      if (!text) return null;
      const level = str(raw.level);
      return {
        kind: 'headline',
        text,
        level:
          level === 'display' || level === 'title' || level === 'kicker' || level === 'sub'
            ? level
            : 'title',
        align: raw.align === 'center' ? 'center' : 'left',
      };
    }
    case 'figure': {
      const image = str(raw.image);
      if (!image) return null;
      const tone = str(raw.tone);
      return {
        kind: 'figure',
        image,
        caption: str(raw.caption),
        credit: str(raw.credit),
        aspect: typeof raw.aspect === 'number' ? raw.aspect : undefined,
        bleed: raw.bleed === true,
        tone: TONES.find((t) => t === tone) ?? 'color',
      };
    }
    case 'quote': {
      const text = str(raw.text);
      if (!text) return null;
      return {
        kind: 'quote',
        text,
        attribution: str(raw.attribution),
        role: str(raw.role),
      };
    }
    case 'qa': {
      if (!Array.isArray(raw.items)) return null;
      const items = raw.items
        .map((item) => {
          if (!isRecord(item)) return null;
          const q = str(item.q);
          const a = str(item.a);
          return q && a ? { q, a } : null;
        })
        .filter((item): item is { q: string; a: string } => item !== null);
      return items.length > 0 ? { kind: 'qa', items } : null;
    }
    case 'meta': {
      if (!Array.isArray(raw.items)) return null;
      const items = raw.items
        .map((item) => {
          if (!isRecord(item)) return null;
          const label = str(item.label);
          const value = str(item.value);
          return label && value ? { label, value } : null;
        })
        .filter((item): item is { label: string; value: string } => item !== null);
      if (items.length === 0) return null;
      return {
        kind: 'meta',
        title: str(raw.title),
        columns: num(raw.columns, 1) === 2 ? 2 : 1,
        items,
      };
    }
    case 'stats': {
      if (!Array.isArray(raw.items)) return null;
      const items = raw.items
        .map((item) => {
          if (!isRecord(item)) return null;
          const label = str(item.label);
          const display = str(item.display);
          if (!label || !display) return null;
          return { label, display, value: num(item.value, 0) };
        })
        .filter((item): item is { label: string; display: string; value: number } => item !== null);
      return items.length > 0 ? { kind: 'stats', title: str(raw.title), items } : null;
    }
    case 'rule':
      return { kind: 'rule', label: str(raw.label) };
    case 'list': {
      if (!Array.isArray(raw.items)) return null;
      const items = raw.items
        .map((item) => {
          if (!isRecord(item)) return null;
          const primary = str(item.primary);
          if (!primary) return null;          return {
            primary,
            secondary: str(item.secondary),
            tertiary: str(item.tertiary),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
      return items.length > 0 ? { kind: 'list', title: str(raw.title), items } : null;
    }
    case 'note': {
      const text = str(raw.text);
      return text ? { kind: 'note', label: str(raw.label), text } : null;
    }
    case 'ad': {
      const brand = str(raw.brand);
      const tagline = str(raw.tagline);
      if (!brand || !tagline) return null;
      return {
        kind: 'ad',
        brand,
        tagline,
        body: str(raw.body),
        image: str(raw.image),
        cta: str(raw.cta),
        finePrint: str(raw.finePrint),
      };
    }
    default:
      return null;
  }
}

function normalizePage(raw: unknown, index: number): MagazinePage {
  if (!isRecord(raw)) throw new MagazineDataError(`Page ${index + 1} is not an object.`);
  const type = str(raw.type);
  if (!type || !PAGE_TYPES.includes(type as MagazinePageType)) {
    throw new MagazineDataError(`Page ${index + 1} has an unknown type "${String(raw.type)}".`);
  }
  const blocks = Array.isArray(raw.blocks)
    ? raw.blocks.map(normalizeBlock).filter((block): block is PageBlock => block !== null)
    : undefined;

  return {
    id: num(raw.id, index + 1),
    type: type as MagazinePageType,
    title: str(raw.title),
    subtitle: str(raw.subtitle),
    content: str(raw.content),
    image: str(raw.image),
    caption: str(raw.caption),
    kicker: str(raw.kicker),
    standfirst: str(raw.standfirst),
    byline: str(raw.byline),
    imageCredit: str(raw.imageCredit),
    runningHead: str(raw.runningHead),
    tone: raw.tone === 'ink' ? 'ink' : 'paper',
    blocks,
    tocLabel: str(raw.tocLabel),
  };
}

function normalizeCover(raw: unknown, fallbackImage?: string): MagazineCover {
  if (!isRecord(raw)) {
    return { image: fallbackImage ?? '', lines: [] };
  }
  const lines = Array.isArray(raw.lines)
    ? raw.lines
        .map((line) => {
          if (!isRecord(line)) return null;
          const title = str(line.title);
          return title ? { title, note: str(line.note) } : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];
  return {
    image: str(raw.image) ?? fallbackImage ?? '',
    lines,
    badges: strArray(raw.badges),
  };
}

/**
 * Validates and shapes untrusted magazine data (API response, CMS payload,
 * uploaded document metadata) into the reader's model.
 */
export function normalizeMagazine(raw: unknown): Magazine {
  if (!isRecord(raw)) throw new MagazineDataError('Magazine payload must be an object.');
  const title = str(raw.title);
  if (!title) throw new MagazineDataError('Magazine payload is missing a title.');
  if (!Array.isArray(raw.pages) || raw.pages.length < 2) {
    throw new MagazineDataError('A magazine needs at least two pages.');
  }

  const pages = raw.pages.map(normalizePage);
  const credits = Array.isArray(raw.credits)
    ? raw.credits
        .map((credit) => {
          if (!isRecord(credit)) return null;
          const role = str(credit.role);
          const name = str(credit.name);
          return role && name ? { role, name } : null;
        })
        .filter((credit): credit is { role: string; name: string } => credit !== null)
    : undefined;

  return {
    id: str(raw.id) ?? title.toLowerCase().replace(/\s+/g, '-'),
    title,
    tagline: str(raw.tagline),
    issue: str(raw.issue) ?? '01',
    issueLabel: str(raw.issueLabel) ?? `Issue ${str(raw.issue) ?? '01'}`,
    date: str(raw.date) ?? '',
    price: str(raw.price),
    accent: str(raw.accent),
    cover: normalizeCover(raw.cover, pages[0]?.image),
    pages,
    credits,
  };
}
