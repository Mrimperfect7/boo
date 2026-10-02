import { useCallback, useEffect, useRef, useState } from 'react';
import { buildFlipFrame, type FlipFrame, type FlipGeometryOptions } from './flip-math';
import { Spring, SPRING_FAST, SPRING_PREVIEW, SPRING_RELEASE } from './spring';

export type TurnDirection = 1 | -1;

export interface ActiveFlip {
  sheet: number;
  direction: TurnDirection;
  mode: 'animate' | 'drag' | 'preview';
}

export interface FlipEmit {
  frame: FlipFrame;
  active: ActiveFlip | null;
  dragging: boolean;
}

export type FlipListener = (emit: FlipEmit) => void;

export interface PageTurnOptions {
  /** Number of turnable leaves (pageCount / 2 in spread mode). */
  sheetCount: number;
  geometry: () => FlipGeometryOptions;
  reducedMotion: boolean;
  onCommit?: (sheet: number, direction: TurnDirection) => void;
  onFlipStart?: (sheet: number, direction: TurnDirection) => void;
  onSound?: (kind: 'lift' | 'settle') => void;
}

export interface PageTurn {
  sheet: number;
  active: ActiveFlip | null;
  dragging: boolean;
  turning: boolean;
  next: () => void;
  prev: () => void;
  goToSheet: (sheet: number) => void;
  subscribe: (listener: FlipListener) => () => void;
  progress: React.RefObject<number>;
  startDrag: (target: ActiveFlip, fromProgress: number) => void;
  moveDrag: (progress: number) => void;
  endDrag: (velocity: number) => void;
  preview: (direction: TurnDirection, amount: number) => void;
  clearPreview: () => void;
}

const clampProgress = (value: number): number => Math.max(-0.06, Math.min(1.06, value));

/**
 * Owns the whole turn lifecycle — which sheet is on screen, how far it has
 * turned, whether it is being dragged or springing home — while keeping React
 * out of the animation loop. Everything per-frame is written straight to the
 * DOM by `PageTurn` through `subscribe`.
 */
export function usePageTurn(options: PageTurnOptions): PageTurn {
  const { reducedMotion } = options;
  const [sheet, setSheet] = useState(0);
  const [active, setActive] = useState<ActiveFlip | null>(null);
  const [dragging, setDragging] = useState(false);

  const sheetRef = useRef(0);
  const activeRef = useRef<ActiveFlip | null>(null);
  const springRef = useRef(new Spring(0));
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const listenersRef = useRef(new Set<FlipListener>());
  const queueRef = useRef<TurnDirection[]>([]);
  const fastRef = useRef(false);
  const pendingRef = useRef<{ from: number; to: number; config: typeof SPRING_RELEASE } | null>(null);
  const settleRef = useRef<{ commit: boolean; stayMounted: boolean }>({ commit: false, stayMounted: false });
  const lastEmitRef = useRef<FlipEmit | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const draggingRef = useRef(false);
  draggingRef.current = dragging;

  const emit = useCallback((): void => {
    const payload: FlipEmit = {
      frame: buildFlipFrame(progressRef.current, optionsRef.current.geometry()),
      active: activeRef.current,
      dragging: draggingRef.current,
    };
    lastEmitRef.current = payload;
    listenersRef.current.forEach((listener) => listener(payload));
  }, []);

  const stopLoop = useCallback((): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const settle = useCallback((): void => {
    stopLoop();
    const current = activeRef.current;
    const pending = settleRef.current;
    const progress = progressRef.current;

    if (current && pending.commit) {
      const landed = current.direction === 1 ? progress > 0.5 : progress < 0.5;
      if (landed) {
        const nextSheet = current.sheet + current.direction;
        sheetRef.current = nextSheet;
        setSheet(nextSheet);
        optionsRef.current.onCommit?.(nextSheet, current.direction);
        optionsRef.current.onSound?.('settle');
      }
    }

    if (!pending.stayMounted) {
      activeRef.current = null;
      setActive(null);
      // At rest the leaf sits flat on the right stack again, so the resting
      // geometry is always progress 0 — whichever direction we came from.
      progressRef.current = 0;
      springRef.current.set(0, 0);
    }
    settleRef.current = { commit: false, stayMounted: false };
    setDragging(false);
    emit();
  }, [emit, stopLoop]);

  const loop = useCallback(
    (now: number): void => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.064);
      lastTimeRef.current = now;
      const spring = springRef.current;
      const settled = spring.step(dt);
      progressRef.current = spring.value;
      emit();
      if (settled) {
        settle();
      } else {
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [emit, settle],
  );

  const startLoop = useCallback((): void => {
    stopLoop();
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, stopLoop]);

  const beginAnimation = useCallback(
    (target: ActiveFlip, from: number, to: number, config: typeof SPRING_RELEASE): void => {
      // Set the geometry synchronously: the leaf mounts before the animation
      // effect runs, and it must already be at `from` when it appears.
      progressRef.current = from;
      springRef.current.set(from, 0);
      activeRef.current = target;
      setActive(target);
      pendingRef.current = { from, to, config };
    },
    [],
  );

  /** Starts the queued/committed animation once the sheet has mounted. */
  useEffect(() => {
    if (!active) return;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    progressRef.current = pending.from;
    springRef.current.set(pending.from, 0);
    springRef.current.to(pending.to, 0, pending.config);
    startLoop();
  }, [active, startLoop]);

  /** Consumes queued turns once the reader is back at rest. */
  useEffect(() => {
    if (active) return;
    const queue = queueRef.current;
    if (queue.length === 0) {
      fastRef.current = false;
      return;
    }
    const direction = queue.shift() as TurnDirection;
    const flipSheet = direction === 1 ? sheetRef.current : sheetRef.current - 1;
    beginAnimation(
      { sheet: flipSheet, direction, mode: 'animate' },
      direction === 1 ? 0 : 1,
      direction === 1 ? 1 : 0,
      fastRef.current ? SPRING_FAST : SPRING_RELEASE,
    );
    optionsRef.current.onSound?.('lift');
  }, [active, beginAnimation]);

  const instantTurn = useCallback((direction: TurnDirection): void => {
    const current = sheetRef.current;
    const nextSheet = current + direction;
    if (nextSheet < 0 || nextSheet > optionsRef.current.sheetCount) return;
    sheetRef.current = nextSheet;
    progressRef.current = direction === 1 ? 1 : 0;
    setSheet(nextSheet);
    optionsRef.current.onCommit?.(nextSheet, direction);
    optionsRef.current.onSound?.('settle');
  }, []);

  const next = useCallback((): void => {
    optionsRef.current.onFlipStart?.(sheetRef.current, 1);
    if (reducedMotion) {
      instantTurn(1);
      return;
    }
    if (sheetRef.current >= optionsRef.current.sheetCount) return;    const previewing = activeRef.current?.mode === 'preview';
    if (previewing) {
      const from = progressRef.current;
      const target: ActiveFlip = { sheet: sheetRef.current, direction: 1, mode: 'animate' };
      beginAnimation(target, from, 1, SPRING_RELEASE);
      settleRef.current = { commit: true, stayMounted: false };
      queueRef.current = [];
      // The preview leaf is already on screen, so the loop can start right away.
      pendingRef.current = null;
      startLoop();
      return;
    }
    if (activeRef.current) {
      if (queueRef.current.length < 2) queueRef.current.push(1);
      return;
    }
    beginAnimation({ sheet: sheetRef.current, direction: 1, mode: 'animate' }, 0, 1, SPRING_RELEASE);
    settleRef.current = { commit: true, stayMounted: false };
    optionsRef.current.onSound?.('lift');
  }, [beginAnimation, instantTurn, reducedMotion, startLoop]);

  const prev = useCallback((): void => {
    optionsRef.current.onFlipStart?.(sheetRef.current, -1);
    if (reducedMotion) {
      instantTurn(-1);
      return;
    }
    if (sheetRef.current <= 0) return;
    if (activeRef.current?.mode === 'preview') {
      stopLoop();
      activeRef.current = null;
      setActive(null);
    }
    if (activeRef.current) {
      if (queueRef.current.length < 2) queueRef.current.push(-1);
      return;
    }
    beginAnimation(
      { sheet: sheetRef.current - 1, direction: -1, mode: 'animate' },
      1,
      0,
      SPRING_RELEASE,
    );
    settleRef.current = { commit: true, stayMounted: false };
    optionsRef.current.onSound?.('lift');
  }, [beginAnimation, instantTurn, reducedMotion, setActive, stopLoop]);

  const goToSheet = useCallback(
    (target: number): void => {
      const clamped = Math.max(0, Math.min(optionsRef.current.sheetCount, target));
      const distance = clamped - sheetRef.current;
      if (distance === 0) return;
      if (reducedMotion) {
        queueRef.current = [];
        instantTurn(distance > 0 ? 1 : -1);
        sheetRef.current = clamped;
        setSheet(clamped);
        optionsRef.current.onCommit?.(clamped, distance > 0 ? 1 : -1);
        return;
      }
      if (activeRef.current?.mode === 'preview') {
        stopLoop();
        activeRef.current = null;
        setActive(null);
      }
      if (activeRef.current) {
        // Replace whatever is queued with the direct route.
        queueRef.current = [];
        const direction: TurnDirection = distance > 0 ? 1 : -1;
        for (let i = 0; i < Math.abs(distance); i++) queueRef.current.push(direction);
        fastRef.current = true;
        return;
      }
      const direction: TurnDirection = distance > 0 ? 1 : -1;
      const steps = Math.abs(distance);
      if (steps > 6) {
        // Long jumps: travel instantly most of the way, then riffle the last leaf.
        sheetRef.current = clamped - direction;
        setSheet(sheetRef.current);
        beginAnimation(
          { sheet: clamped - direction, direction, mode: 'animate' },
          direction === 1 ? 0 : 1,
          direction === 1 ? 1 : 0,
          SPRING_RELEASE,
        );
        settleRef.current = { commit: true, stayMounted: false };
      } else {
        for (let i = 0; i < steps - 1; i++) queueRef.current.push(direction);
        fastRef.current = true;
        beginAnimation(
          { sheet: direction === 1 ? sheetRef.current : sheetRef.current - 1, direction, mode: 'animate' },
          direction === 1 ? 0 : 1,
          direction === 1 ? 1 : 0,
          SPRING_FAST,
        );
        settleRef.current = { commit: true, stayMounted: false };
      }
      optionsRef.current.onSound?.('lift');
    },
    [beginAnimation, instantTurn, reducedMotion, setActive, stopLoop],
  );

  const startDrag = useCallback(
    (target: ActiveFlip, fromProgress: number): void => {
      stopLoop();
      queueRef.current = [];
      activeRef.current = target;
      pendingRef.current = null;
      progressRef.current = fromProgress;
      springRef.current.set(fromProgress, 0);
      settleRef.current = { commit: true, stayMounted: false };
      setDragging(true);
      setActive(target);
      optionsRef.current.onSound?.('lift');
      emit();
    },
    [emit, setActive, stopLoop],
  );

  const moveDrag = useCallback(
    (progress: number): void => {
      if (activeRef.current?.mode !== 'drag') return;
      progressRef.current = clampProgress(progress);
      springRef.current.value = progressRef.current;
      emit();
    },
    [emit],
  );

  const endDrag = useCallback(
    (velocity: number): void => {
      const current = activeRef.current;
      if (current?.mode !== 'drag') return;
      const p = progressRef.current;
      const target =
        current.direction === 1 ? (velocity > 0.28 || p > 0.42 ? 1 : 0) : velocity < -0.28 || p < 0.58 ? 0 : 1;
      setDragging(false);
      springRef.current.to(target, velocity * 0.9, SPRING_RELEASE);
      settleRef.current = { commit: true, stayMounted: false };
      startLoop();
    },
    [startLoop],
  );

  const preview = useCallback(
    (direction: TurnDirection, amount: number): void => {
      if (reducedMotion) return;
      if (direction !== 1) return;
      const current = activeRef.current;
      if (current && current.mode !== 'preview') return;
      if (!current) {
        activeRef.current = { sheet: sheetRef.current, direction: 1, mode: 'preview' };
        setActive(activeRef.current);
        progressRef.current = 0;
        springRef.current.set(0, 0);
      } else {
        stopLoop();
      }
      springRef.current.to(amount, 0, SPRING_PREVIEW);
      settleRef.current = { commit: false, stayMounted: true };
      startLoop();
    },
    [reducedMotion, setActive, startLoop, stopLoop],
  );

  const clearPreview = useCallback((): void => {
    const current = activeRef.current;
    if (current?.mode !== 'preview') return;
    springRef.current.to(0, 0, SPRING_PREVIEW);
    settleRef.current = { commit: false, stayMounted: false };
    startLoop();
  }, [startLoop]);

  const subscribe = useCallback((listener: FlipListener): (() => void) => {
    listenersRef.current.add(listener);
    // Hand new subscribers the live geometry rather than a stale frame.
    listener({
      frame: buildFlipFrame(progressRef.current, optionsRef.current.geometry()),
      active: activeRef.current,
      dragging: draggingRef.current,
    });
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => stopLoop, [stopLoop]);

  return {
    sheet,
    active,
    dragging,
    turning: active !== null && active.mode !== 'preview',
    next,
    prev,
    goToSheet,
    subscribe,
    progress: progressRef,
    startDrag,
    moveDrag,
    endDrag,
    preview,
    clearPreview,
  };
}
