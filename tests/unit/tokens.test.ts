import { readdirSync, readFileSync } from 'node:fs';
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

describe('paleta «Glass + Primer»', () => {
  const scales = readTokens(css, /^@theme static$/);
  const dark = readTokens(css, /^:root,\s*:root\[data-theme='dark'\]$/);
  const light = readTokens(css, /^:root\[data-theme='light'\]$/);
  const hues = ['green', 'cyan', 'blue', 'violet', 'magenta', 'amber', 'red'];
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  it('el verde de marca es el 500 y tiene variantes clara (400) y oscura (700)', () => {
    expect(scales['--color-green-500']).toBe('#01bf63');
    expect(scales['--color-green-400']).toBe('#3ddc97');
    expect(scales['--color-green-700']).toBe('#00713a');
  });

  it.each(hues)('%s tiene la escala completa 50–900', (hue) => {
    for (const step of steps) expect(scales[`--color-${hue}-${step}`]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it.each(hues)(
    '%s define color, texto, tinte y línea en ambos temas, y su clase .hue-*',
    (hue) => {
      for (const theme of [dark, light]) {
        for (const part of ['', '-fg', '-tint', '-line'])
          expect(theme[`--c-${hue}${part}`]).toBeTruthy();
      }
      expect(css).toContain(`.hue-${hue} {`);
    },
  );

  it('el fondo oscuro tiene tinte verdoso y el claro es un gris suave (no blanco plano)', () => {
    expect(dark['--bg']).toBe('#050807');
    expect(light['--bg']).toBe('#f6f8fa');
  });

  it('no hay colores hex sueltos en los componentes (todo sale de tokens.css)', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry.name)) {
          // Excepciones documentadas: el isotipo (SVG de marca) y el script de tema.
          if (entry.name === 'logo-mark.tsx') continue;
          const hits = readFileSync(full, 'utf8').match(/#[0-9a-fA-F]{6}/g);
          if (hits) offenders.push(`${full}: ${hits.join(', ')}`);
        }
      }
    };
    walk(path.join(process.cwd(), 'src/components'));
    walk(path.join(process.cwd(), 'src/app'));
    expect(offenders).toEqual([]);
  });
});
