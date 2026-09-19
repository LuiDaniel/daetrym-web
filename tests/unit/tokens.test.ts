import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio, parseColor, readTokens } from '../../scripts/lib/color';
import { press } from '@/styles/motion';

const css = readFileSync(path.join(process.cwd(), 'src/styles/tokens.css'), 'utf8');
const constants = readTokens(css, /^:root$/);

describe('tokens.css ↔ motion.ts (una sola fuente de verdad)', () => {
  it('press: escala y duración coinciden', () => {
    expect(Number(constants['--press-scale'])).toBe(press.scale);
    expect(constants['--press-duration']).toBe(`${press.durationMs}ms`);
  });
});

describe('utilidades de color', () => {
  it('parsea hex y rgb con alpha', () => {
    expect(parseColor('#040712')).toEqual({ r: 4, g: 7, b: 18, a: 1 });
    expect(parseColor('rgb(255 255 255 / 0.72)')).toEqual({ r: 255, g: 255, b: 255, a: 0.72 });
  });

  it('el contraste blanco/negro es 21:1', () => {
    expect(contrastRatio(parseColor('#fff'), parseColor('#000'))).toBeCloseTo(21, 5);
  });

  it('documenta por qué el texto sobre el verde de marca es oscuro (blanco < 4.5:1)', () => {
    const accent = parseColor('#01bf63');
    expect(contrastRatio(parseColor('#ffffff'), accent)).toBeLessThan(4.5);
    expect(contrastRatio(parseColor('#04110a'), accent)).toBeGreaterThan(4.5);
  });
});
