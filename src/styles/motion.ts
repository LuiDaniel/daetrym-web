/**
 * DaeTrym — tokens y helpers de motion (única fuente de verdad, derivada de apple-design).
 *
 * Filosofía: comportamiento sobre animación. Todo lo que el usuario toca usa springs
 * (interrumpibles, parten del valor actual y heredan velocidad). Nada gestual usa CSS transitions.
 * Damping 1.0 (bounce 0) por defecto; rebote solo cuando el gesto trajo inercia.
 */
import type { Transition } from 'motion/react';

/** `bounce` ≈ 1 − damping ratio; `duration` ≈ response de Apple (no es una duración fija). */
export const spring = {
  /** Reposicionar, aparecer, layout. Críticamente amortiguado. */
  default: { type: 'spring', bounce: 0, duration: 0.4 },
  /** Popovers, toggles, indicadores. */
  snappy: { type: 'spring', bounce: 0, duration: 0.3 },
  /** SOLO tras un gesto con inercia (flick de un sheet). damping ≈ 0.8. */
  momentum: { type: 'spring', bounce: 0.2, duration: 0.4 },
} as const satisfies Record<string, Transition>;

/** Alternativa con prefers-reduced-motion: fundido corto, sin overshoot ni desplazamiento. */
export const reducedFade = {
  type: 'tween',
  duration: 0.2,
  ease: 'easeOut',
} as const satisfies Transition;

/** Debe coincidir con --press-scale / --press-duration de tokens.css (lo verifica un test). */
export const press = { scale: 0.97, durationMs: 100 } as const;

export const gesture = {
  /** Píxeles de movimiento antes de comprometer un gesto (histéresis). */
  hysteresis: 10,
  /** Tasa de desaceleración de scroll de iOS (0.998 normal, 0.99 más ágil). */
  decelerationRate: 0.998,
  /** Constante de rubber-banding. */
  rubberBand: 0.55,
  /** Ventana (ms) del historial usado para estimar la velocidad al soltar. */
  velocityWindowMs: 100,
} as const;

export type Sample = { t: number; x: number };

/**
 * Distancia adicional que recorrería el contenido si siguiera decelerando desde `velocity` (px/s).
 * Forma exponencial de Apple (no v²/2a). Positiva en la dirección de la velocidad.
 */
export function project(velocity: number, decelerationRate: number = gesture.decelerationRate) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Resistencia progresiva pasado un borde: cuanto más se sobrepasa, menos sigue el elemento.
 * `overshoot` es la distancia pasada del límite (con signo), `dimension` el tamaño del contenedor.
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant: number = gesture.rubberBand,
) {
  if (overshoot === 0 || dimension <= 0) return 0;
  const sign = Math.sign(overshoot);
  const distance = Math.abs(overshoot);
  return (sign * (distance * dimension * constant)) / (dimension + constant * distance);
}

/** Elige el punto de reposo más cercano a donde el gesto TERMINARÍA (posición proyectada). */
export function resolveSnap(position: number, velocity: number, snapPoints: readonly number[]) {
  const projected = position + project(velocity);
  let best = snapPoints[0] ?? position;
  for (const point of snapPoints) {
    if (Math.abs(point - projected) < Math.abs(best - projected)) best = point;
  }
  return best;
}

/** Velocidad (px/s) a partir de las últimas muestras dentro de la ventana temporal. */
export function velocityFromSamples(
  samples: readonly Sample[],
  windowMs: number = gesture.velocityWindowMs,
  /** Instante de la suelta. Si el dedo estuvo quieto antes de soltar, la velocidad es 0. */
  now?: number,
) {
  const last = samples[samples.length - 1];
  if (!last) return 0;
  if (now !== undefined && now - last.t > windowMs) return 0;
  const recent = samples.filter((s) => last.t - s.t <= windowMs);
  const first = recent[0];
  if (!first || first === last) return 0;
  const dt = last.t - first.t;
  return dt > 0 ? ((last.x - first.x) / dt) * 1000 : 0;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
