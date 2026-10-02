import type { Magazine, MagazinePage, MagazinePageType, MagazineSource } from '../../types/magazine';
import { normalizeMagazine } from '../normalize';

/**
 * PDF → magazine pipeline.
 *
 * ```text
 * upload PDF
 *      ↓  extract pages            (your renderer, e.g. pdf.js)
 *      ↓  convert to images        (canvas → WebP/AVIF, capped width)
 *      ↓  read the text layer      (a11y + search + captions)
 *      ↓  map to MagazinePage[]
 *      ↓  interactive 3D page turning  (this reader — unchanged)
 * ```
 *
 * The reader never looks like a document viewer: PDFs only ever become page
 * *content*. A renderer is injected rather than imported so the app carries no
 * PDF dependency until you install one:
 *
 * ```ts
 * // npm i pdfjs-dist
 * import * as pdfjs from 'pdfjs-dist';
 * import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
 * pdfjs.GlobalWorkerOptions.workerSrc = worker;
 *
 * const renderer: PdfRenderer = {
 *   async render(file, { maxWidth, onProgress }) {
 *     const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
 *     const pages = [];
 *     for (let n = 1; n <= doc.numPages; n++) {
 *       const page = await doc.getPage(n);
 *       const viewport = page.getViewport({ scale: 1 });
 *       const scale = Math.min(maxWidth / viewport.width, 2);
 *       const canvas = document.createElement('canvas');
 *       const context = canvas.getContext('2d')!;
 *       canvas.width = Math.ceil(viewport.width * scale);
 *       canvas.height = Math.ceil(viewport.height * scale);
 *       await page.render({
 *         canvasContext: context,
 *         viewport: page.getViewport({ scale }),
 *       }).promise;
 *       const text = (await page.getTextContent()).items
 *         .map((item) => ('str' in item ? item.str : ''))
 *         .join(' ');
 *       pages.push({
 *         pageNumber: n,
 *         width: canvas.width,
 *         height: canvas.height,
 *         image: canvas.toDataURL('image/webp', 0.86),
 *         text,
 *       });
 *       onProgress?.(n / doc.numPages);
 *     }
 *     return pages;
 *   },
 * };
 * ```
 */

export interface PdfPageRender {
  pageNumber: number;
  width: number;
  height: number;
  /** Data URL, blob URL or CDN URL of the rasterised page. */
  image: string;
  /** Extracted text layer — kept for screen readers, search and captions. */
  text?: string;
}

export interface PdfRenderer {
  render(
    file: File | ArrayBuffer,
    options: {
      maxWidth?: number;
      quality?: number;
      onProgress?: (ratio: number) => void;
    },
  ): Promise<PdfPageRender[]>;
}

export interface PdfSourceOptions {
  file: File;
  renderer: PdfRenderer;
  maxWidth?: number;
  title?: string;
  issue?: string;
  date?: string;
  onProgress?: (ratio: number) => void;
}

/**
 * Heuristic layout mapping: the first rendered page becomes the cover, the last
 * becomes the back cover, everything else is an editorial page. Tune this once
 * you know the shape of your publications.
 */
export function inferPageType(index: number, total: number): MagazinePageType {
  if (index === 0) return 'cover';
  if (index === total - 1) return 'back-cover';
  return index % 4 === 0 ? 'image' : 'article';
}

export function pagesFromPdfRenders(renders: PdfPageRender[]): MagazinePage[] {
  return renders.map((render, index) => {
    const firstLine = render.text?.trim().split(/\n|\s{3,}/)[0]?.slice(0, 90);
    return {
      id: index + 1,
      type: inferPageType(index, renders.length),
      title: firstLine || undefined,
      image: render.image,
      content: render.text,
      blocks: [{ kind: 'figure', image: render.image, bleed: true, aspect: render.width / render.height }],
    } satisfies MagazinePage;
  });
}

/** Builds a `MagazineSource` from an uploaded PDF. */
export function createPdfMagazineSource({
  file,
  renderer,
  maxWidth = 1600,
  title = file.name.replace(/\.pdf$/i, ''),
  issue = '01',
  date = '',
  onProgress,
}: PdfSourceOptions): MagazineSource {
  return {
    id: `pdf:${file.name}`,
    label: title,
    async load(signal?: AbortSignal) {
      const renders = await renderer.render(file, { maxWidth, onProgress });
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (renders.length < 2) throw new Error('A PDF needs at least two pages to become a magazine.');
      const magazine: Magazine = {
        id: `pdf-${file.name}`,
        title,
        issue,
        issueLabel: `Issue ${issue}`,
        date,
        cover: { image: renders[0].image, lines: [] },
        pages: pagesFromPdfRenders(renders),
      };
      return normalizeMagazine(magazine);
    },
  };
}
