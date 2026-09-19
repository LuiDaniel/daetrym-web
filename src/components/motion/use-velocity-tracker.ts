'use client';

import { useCallback, useRef } from 'react';
import { velocityFromSamples, type Sample } from '@/styles/motion';

const MAX_SAMPLES = 24;

/**
 * Historial corto de posiciones para estimar la velocidad al soltar (apple-design §2 y §5).
 * Se usa el `timeStamp` del evento (no Date.now) para que coincida con el reloj del puntero.
 */
export function useVelocityTracker() {
  const samples = useRef<Sample[]>([]);

  const reset = useCallback(() => {
    samples.current = [];
  }, []);

  const push = useCallback((x: number, t: number) => {
    samples.current.push({ x, t });
    if (samples.current.length > MAX_SAMPLES) samples.current.shift();
  }, []);

  /** Velocidad en px/s (positiva = hacia la derecha). `now` = timeStamp del evento de suelta. */
  const velocity = useCallback(
    (now?: number) => velocityFromSamples(samples.current, undefined, now),
    [],
  );

  return { reset, push, velocity };
}
