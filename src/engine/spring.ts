/**
 * Minimal spring integrator.
 *
 * Semi-implicit Euler with fixed sub-steps: stable at any frame rate and
 * good enough to feel like paper — a little overshoot when a page is flicked,
 * a soft settle when it is released gently.
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export const SPRING_RELEASE: SpringConfig = { stiffness: 205, damping: 25.5, mass: 1 };
export const SPRING_FAST: SpringConfig = { stiffness: 620, damping: 40, mass: 1 };
export const SPRING_PREVIEW: SpringConfig = { stiffness: 320, damping: 30, mass: 1 };

export class Spring {
  value: number;
  velocity: number;
  target: number;
  config: SpringConfig;

  constructor(value = 0, config: SpringConfig = SPRING_RELEASE) {
    this.value = value;
    this.velocity = 0;
    this.target = value;
    this.config = config;
  }

  set(value: number, velocity = 0): void {
    this.value = value;
    this.velocity = velocity;
    this.target = value;
  }

  to(target: number, velocity?: number, config?: SpringConfig): void {
    this.target = target;
    if (velocity !== undefined) this.velocity = velocity;
    if (config) this.config = config;
  }

  /** Advances the spring. Returns true once it has come to rest. */
  step(dt: number): boolean {
    const step = Math.min(dt, 0.064);
    const sub = 1 / 240;
    let remaining = step;

    while (remaining > 0) {
      const h = remaining > sub ? sub : remaining;
      const { stiffness, damping, mass } = this.config;
      const acceleration = (-stiffness * (this.value - this.target) - damping * this.velocity) / mass;
      this.velocity += acceleration * h;
      this.value += this.velocity * h;
      remaining -= h;
    }

    return this.settled();
  }

  settled(): boolean {
    return Math.abs(this.value - this.target) < 0.0006 && Math.abs(this.velocity) < 0.012;
  }
}
