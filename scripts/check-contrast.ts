/**
 * Verifica los contrastes WCAG 2.2 AA de los tokens de src/styles/tokens.css, también sobre
 * los materiales translúcidos (compuestos sobre los fondos más desfavorables).
 * Uso: pnpm check:contrast  (falla con exit 1 si algún par no cumple)
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { composite, contrastRatio, parseColor, readTokens, type Rgba } from './lib/color';

const css = readFileSync(path.join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

const themes = {
  dark: readTokens(css, /^:root,\s*:root\[data-theme='dark'\]$/),
  light: readTokens(css, /^:root\[data-theme='light'\]$/),
} as const;

const TEXT = 4.5; // WCAG 1.4.3
const NON_TEXT = 3; // WCAG 1.4.11

type Failure = { theme: string; pair: string; ratio: number; min: number };
const failures: Failure[] = [];
let checked = 0;

function color(theme: keyof typeof themes, name: string): Rgba {
  const value = themes[theme][name];
  if (!value) throw new Error(`Token ausente en tema ${theme}: ${name}`);
  return parseColor(value);
}

function check(theme: keyof typeof themes, label: string, fg: Rgba, bg: Rgba, min: number) {
  const ratio = contrastRatio(composite(fg, bg), bg);
  checked++;
  if (ratio < min) failures.push({ theme, pair: label, ratio, min });
}

for (const theme of ['dark', 'light'] as const) {
  const surfaces = ['--bg', '--surface-1', '--surface-2', '--surface-3'];

  // Texto sobre superficies sólidas
  for (const fg of ['--fg', '--fg-muted', '--fg-subtle', '--accent-text']) {
    for (const bg of surfaces) {
      check(theme, `${fg} sobre ${bg}`, color(theme, fg), color(theme, bg), TEXT);
    }
  }
  for (const bg of ['--bg', '--surface-1']) {
    check(theme, `--danger sobre ${bg}`, color(theme, '--danger'), color(theme, bg), TEXT);
  }

  // Avisos (contenido de ejemplo) y tinte de acento: el fondo es translúcido, así que se compone
  // sobre cada superficie donde puede aparecer.
  for (const surfaceName of surfaces) {
    const surface = color(theme, surfaceName);
    const warningBg = composite(color(theme, '--warning-bg'), surface);
    check(theme, `--warning sobre ${surfaceName}`, color(theme, '--warning'), surface, TEXT);
    check(
      theme,
      `--warning sobre --warning-bg / ${surfaceName}`,
      color(theme, '--warning'),
      warningBg,
      TEXT,
    );
    check(theme, `--fg sobre --warning-bg / ${surfaceName}`, color(theme, '--fg'), warningBg, TEXT);

    const tint = composite(color(theme, '--accent-tint'), surface);
    check(
      theme,
      `--accent-text sobre --accent-tint / ${surfaceName}`,
      color(theme, '--accent-text'),
      tint,
      TEXT,
    );
  }

  // Texto sobre botones de acento
  for (const bg of ['--accent', '--accent-hover', '--accent-pressed']) {
    check(theme, `--on-accent sobre ${bg}`, color(theme, '--on-accent'), color(theme, bg), TEXT);
  }

  // Foco (no texto)
  for (const bg of surfaces) {
    check(
      theme,
      `--focus-ring sobre ${bg}`,
      color(theme, '--focus-ring'),
      color(theme, bg),
      NON_TEXT,
    );
  }

  // Texto sobre materiales translúcidos, compuestos sobre los fondos más desfavorables
  // Regla de diseño: el material `thin` (controles) nunca va sobre un relleno de acento.
  const backdropsFor = (material: string) =>
    material === '--material-thin-bg'
      ? ['--bg', '--surface-3']
      : ['--bg', '--surface-3', '--accent'];
  for (const material of ['--material-thin-bg', '--material-regular-bg', '--material-thick-bg']) {
    for (const backdropName of backdropsFor(material)) {
      const backdrop = color(theme, backdropName);
      const surface = composite(color(theme, material), backdrop);
      for (const fg of ['--fg', '--fg-muted']) {
        check(theme, `${fg} sobre ${material} / ${backdropName}`, color(theme, fg), surface, TEXT);
      }
    }
  }
}

const fmt = (n: number) => n.toFixed(2);
if (failures.length > 0) {
  console.error(`✗ ${failures.length} de ${checked} pares no cumplen WCAG AA:\n`);
  for (const f of failures) {
    console.error(`  [${f.theme}] ${f.pair}: ${fmt(f.ratio)}:1 (mínimo ${f.min}:1)`);
  }
  process.exit(1);
}

console.log(
  `✓ ${checked} pares de contraste cumplen WCAG AA (temas oscuro y claro, incluidos materiales).`,
);
