/**
 * Synthesised paper sounds — no audio assets, nothing to download.
 *
 * A page turn is two events: the sheet sliding off the stack (a filtered noise
 * sweep) and the paper settling (a short, damped thump). Both are built from a
 * single noise buffer, so the whole controller costs a few kilobytes.
 */

export type FlipSoundKind = 'lift' | 'settle';

export class FlipSound {
  private context: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private master: GainNode | null = null;
  private muted = true;
  private level = 0.5;

  /** Created lazily — browsers only allow audio after a user gesture. */
  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.context) return this.context;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      const context = new Ctor();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      const length = Math.floor(context.sampleRate * 0.6);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const channel = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < length; i++) {
        // Brown-ish noise reads as paper rather than hiss.
        const white = Math.random() * 2 - 1;
        previous = (previous + 0.02 * white) / 1.02;
        channel[i] = previous * 3.2;
      }

      this.context = context;
      this.noise = buffer;
      this.master = master;
      return context;
    } catch {
      return null;
    }
  }

  /** Call from a real user gesture (click, tap, key press). */
  unlock(): void {
    const context = this.ensure();
    if (context && context.state === 'suspended') void context.resume();
    this.applyGain();
  }

  setEnabled(enabled: boolean): void {
    this.muted = !enabled;
    if (enabled) this.unlock();
    this.applyGain();
  }

  setVolume(volume: number): void {
    this.level = Math.max(0, Math.min(1, volume));
    this.applyGain();
  }

  private applyGain(): void {
    if (!this.master || !this.context) return;
    const target = this.muted ? 0 : this.level * 0.5;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(target, this.context.currentTime, 0.02);
  }

  play(kind: FlipSoundKind): void {
    if (this.muted) return;
    const context = this.ensure();
    if (!context || !this.noise || !this.master) return;
    if (context.state === 'suspended') void context.resume();

    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = this.noise;
    source.playbackRate.value = 0.85 + Math.random() * 0.3;

    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    if (kind === 'lift') {
      filter.type = 'bandpass';
      filter.Q.value = 0.9;
      filter.frequency.setValueAtTime(620 + Math.random() * 180, now);
      filter.frequency.exponentialRampToValueAtTime(2600, now + 0.26);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      source.start(now, Math.random() * 0.2, 0.34);
      source.stop(now + 0.34);
    } else {
      filter.type = 'lowpass';
      filter.Q.value = 0.6;
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(420, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.62, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
      source.start(now, Math.random() * 0.2, 0.2);
      source.stop(now + 0.22);
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
  }
}

export const flipSound = new FlipSound();
