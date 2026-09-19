import { describe, expect, it } from 'vitest';
import {
  clamp,
  gesture,
  project,
  resolveSnap,
  rubberband,
  spring,
  velocityFromSamples,
} from '@/styles/motion';

describe('project (proyección de momentum de Apple)', () => {
  it('coincide con la fórmula exponencial (v/1000)·d/(1−d)', () => {
    // 1000 px/s con d = 0.998 → 1 · 0.998 / 0.002 = 499 px
    expect(project(1000)).toBeCloseTo(499, 5);
  });

  it('conserva el signo de la velocidad', () => {
    expect(project(-1000)).toBeCloseTo(-499, 5);
    expect(project(0)).toBe(0);
  });

  it('una tasa menor de desaceleración proyecta menos (0.99 es más ágil)', () => {
    expect(Math.abs(project(1000, 0.99))).toBeLessThan(Math.abs(project(1000, 0.998)));
  });
});

describe('rubberband', () => {
  it('es 0 sin sobrepaso', () => {
    expect(rubberband(0, 400)).toBe(0);
  });

  it('siempre sigue menos que el dedo y conserva el signo', () => {
    expect(rubberband(100, 400)).toBeGreaterThan(0);
    expect(rubberband(100, 400)).toBeLessThan(100);
    expect(rubberband(-100, 400)).toBeLessThan(0);
    expect(rubberband(-100, 400)).toBeGreaterThan(-100);
  });

  it('la resistencia crece con la distancia (retornos decrecientes)', () => {
    const ratioNear = rubberband(50, 400) / 50;
    const ratioFar = rubberband(500, 400) / 500;
    expect(ratioFar).toBeLessThan(ratioNear);
  });

  it('nunca supera la dimensión del contenedor (asíntota)', () => {
    expect(rubberband(1e9, 400)).toBeLessThan(400);
  });

  it('con overshoot pequeño sigue ≈ constante · overshoot', () => {
    expect(rubberband(1, 400)).toBeCloseTo(gesture.rubberBand, 2);
  });
});

describe('resolveSnap', () => {
  const points = [0, 400];

  it('sin velocidad elige el punto más cercano a la posición', () => {
    expect(resolveSnap(150, 0, points)).toBe(0);
    expect(resolveSnap(250, 0, points)).toBe(400);
  });

  it('un flick hacia el cierre gana aunque el dedo esté más cerca de abierto', () => {
    // En x = 100 (cerca de 0) pero lanzado a 800 px/s hacia la derecha → proyecta ≫ 200.
    expect(resolveSnap(100, 800, points)).toBe(400);
  });

  it('un flick hacia dentro reabre aunque estuviera pasado de la mitad', () => {
    expect(resolveSnap(300, -800, points)).toBe(0);
  });
});

describe('velocityFromSamples', () => {
  it('es 0 con menos de dos muestras', () => {
    expect(velocityFromSamples([])).toBe(0);
    expect(velocityFromSamples([{ t: 0, x: 0 }])).toBe(0);
  });

  it('calcula px/s sobre la ventana reciente e ignora muestras antiguas', () => {
    const samples = [
      { t: 0, x: 0 }, // fuera de la ventana de 100 ms
      { t: 400, x: 500 },
      { t: 450, x: 525 },
      { t: 500, x: 550 },
    ];
    // 50 px en 100 ms = 500 px/s
    expect(velocityFromSamples(samples, 100)).toBeCloseTo(500, 5);
  });

  it('es 0 si el dedo estuvo quieto antes de soltar (no convierte una pausa en un lanzamiento)', () => {
    const samples = [
      { t: 0, x: 0 },
      { t: 50, x: 200 },
      { t: 100, x: 400 },
    ];
    expect(velocityFromSamples(samples, 100)).toBeGreaterThan(0); // sin `now`: usa el último movimiento
    expect(velocityFromSamples(samples, 100, 100)).toBeGreaterThan(0); // soltó al instante
    expect(velocityFromSamples(samples, 100, 400)).toBe(0); // 300 ms quieto antes de soltar
  });

  it('es negativa al moverse hacia la izquierda', () => {
    expect(
      velocityFromSamples([
        { t: 0, x: 100 },
        { t: 50, x: 80 },
      ]),
    ).toBeLessThan(0);
  });
});

describe('clamp y springs', () => {
  it('clamp acota', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });

  it('el spring por defecto no rebota (críticamente amortiguado); solo el de momentum sí', () => {
    expect(spring.default.bounce).toBe(0);
    expect(spring.snappy.bounce).toBe(0);
    expect(spring.momentum.bounce).toBeGreaterThan(0);
  });
});
