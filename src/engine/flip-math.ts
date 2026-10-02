/**
 * Page-flip geometry.
 *
 * A turning sheet is modelled as a chain of narrow facets that share edges.
 * Each facet is placed at the true projected position of its joint and rotated
 * to the tangent angle of the sheet at that point — so the sheet bends like
 * paper instead of swinging like a board. The reverse side is rendered as the
 * same chain mirrored, so front and back always describe one bent sheet.
 */

const DEG = Math.PI / 180;

export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface FacetFrame {
  /** Tangent angle of the sheet at this facet (degrees: 0 flat, -180 fully turned). */
  angle: number;
  /** Projected position of the facet's leading edge, relative to the spine. */
  x: number;
  /** Out-of-plane offset of the facet's leading edge (+ = toward the reader). */
  z: number;
  /** 0 = facing the reader, 1 = edge-on (drives shading). */
  shade: number;
}

export interface FlipFrame {
  progress: number;
  facets: FacetFrame[];
  /** Projected position of the sheet's free edge relative to the spine (px). */
  freeEdgeX: number;
  /** How edge-on the sheet is overall. */
  edgeOn: number;
  /** Ambient occlusion applied as the sheet settles over the left stack. */
  dim: number;
  /** Strength of the shadow cast onto the page underneath. */
  castShadow: number;
  /** Position of the travelling specular sheen (1 = free edge, 0 = spine). */
  sheen: number;
  /** Visible paper thickness at the free edge. */
  thickness: number;
  /** Which face of the leaf is toward the reader. */
  face: 'front' | 'back';
}

export interface FlipGeometryOptions {
  strips: number;
  /** 0 = rigid board, 1 = springy magazine stock. */
  curvature: number;
  /** Sheet width in px (spine → free edge). */
  sheetWidth: number;
}

/**
 * The tangent profile runs from `(1 - k)` at the spine to `(1 + k)` at the free
 * edge of the total rotation: the free edge leads, the spine lags, and the sheet
 * bulges between them. `k` fades to zero at both ends of the turn, so the page is
 * perfectly flat at rest.
 */
export function buildFlipFrame(progress: number, options: FlipGeometryOptions): FlipFrame {
  const { strips, curvature, sheetWidth } = options;
  const p = clamp(progress, -0.08, 1.08);
  const total = -180 * p;
  const bow = Math.sin(Math.PI * clamp(p, 0, 1));

  let k = curvature * 0.3 * bow;
  // Never let the leading edge punch through the page it is landing on.
  const maxK = Math.abs(total) > 1 ? Math.max(0, 180 / Math.abs(total) - 1) : 0;
  k = Math.min(k, maxK);

  const facets: FacetFrame[] = new Array(strips);
  const facetWidth = sheetWidth / strips;
  let x = 0;
  let z = 0;

  for (let i = 0; i < strips; i++) {
    const t = i / strips;
    const eased = Math.pow(t, 1.15);
    const angle = clamp(total * (1 - k + 2 * k * eased), -180, 0);
    const radians = angle * DEG;
    facets[i] = { angle, x, z, shade: 1 - Math.abs(Math.cos(radians)) };
    x += facetWidth * Math.cos(radians);
    z -= facetWidth * Math.sin(radians);
  }

  const edgeOn = 1 - Math.abs(Math.cos(total * DEG));

  return {
    progress: p,
    facets,
    freeEdgeX: x,
    edgeOn,
    dim: 0.32 * smoothstep(0.4, 1, p),
    castShadow: 0.6 * Math.pow(Math.sin(Math.PI * clamp(p, 0, 1)), 0.85),
    sheen: 1 - clamp(p, 0, 1),
    thickness: edgeOn,
    face: p < 0.5 ? 'front' : 'back',
  };
}
