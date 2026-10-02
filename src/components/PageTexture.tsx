import './PageTexture.css';

export interface PageTextureProps {
  /** `ink` pages are printed dark — grain reads differently on coated stock. */
  variant?: 'paper' | 'ink';
  /** Adds the faint ruled texture of a recycled sheet. */
  fibre?: boolean;
}

/**
 * Printed-paper surface: fine grain, faint fibre, and a whisper of warmth.
 * Purely decorative and pointer-transparent.
 */
export function PageTexture({ variant = 'paper', fibre = true }: PageTextureProps) {
  return (
    <div className={`texture texture--${variant}`} aria-hidden="true">
      <div className="texture__grain" />
      {fibre ? <div className="texture__fibre" /> : null}
      <div className="texture__vignette" />
    </div>
  );
}
