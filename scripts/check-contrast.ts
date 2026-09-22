/**
 * Verifica los contrastes WCAG 2.2 AA de los tokens de src/styles/tokens.css.
 *
 * Además de las superficies sólidas, cubre el vidrio: cada material translúcido se compone sobre los
 * fondos más desfavorables — el fondo liso y, por cada uno de los siete tonos, el resplandor de
 * SECCIÓN de ese tono a su intensidad real (`--glow-alpha`; ver `SectionGlow`) — y los textos, las
 * etiquetas de cada tono (`.hue-*`) y su tinte se miden sobre todo eso. También cubre la píldora
 * siempre oscura de las miniaturas de proyecto/post (`--thumb-fg` sobre `--thumb-scrim-bg`) contra el
 * peor caso: una miniatura casi blanca.
 * Uso: pnpm check:contrast  (falla con exit 1 si algún par no cumple)
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { composite, contrastRatio, parseColor, readTokens, type Rgba } from './lib/color';

const css = readFileSync(path.join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

const scales = readTokens(css, /^@theme static$/);
const themes = {
  dark: { ...scales, ...readTokens(css, /^:root,\s*:root\[data-theme='dark'\]$/) },
  light: { ...scales, ...readTokens(css, /^:root\[data-theme='light'\]$/) },
} as const;

const TEXT = 4.5; // WCAG 1.4.3
const NON_TEXT = 3; // WCAG 1.4.11

const hues = ['green', 'cyan', 'blue', 'violet', 'magenta', 'amber', 'red'] as const;

type Failure = { theme: string; pair: string; ratio: number; min: number };
const failures: Failure[] = [];
let checked = 0;

/** Resuelve `var(--otro)` recursivamente dentro del mismo tema. */
function resolve(theme: keyof typeof themes, name: string, depth = 0): string {
  const value = themes[theme][name];
  if (!value) throw new Error(`Token ausente en tema ${theme}: ${name}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (!ref) return value;
  if (depth > 8) throw new Error(`Referencia circular en ${name}`);
  return resolve(theme, ref[1]!, depth + 1);
}

const color = (theme: keyof typeof themes, name: string): Rgba => parseColor(resolve(theme, name));

function check(theme: string, label: string, fg: Rgba, bg: Rgba, min: number) {
  const ratio = contrastRatio(composite(fg, bg), bg);
  checked++;
  if (ratio < min) failures.push({ theme, pair: label, ratio, min });
}

/** Un fondo con nombre: lo que hay DETRÁS del texto una vez compuestas todas las capas. */
type Base = { name: string; rgb: Rgba };

for (const theme of ['dark', 'light'] as const) {
  const bg = color(theme, '--bg');

  // Lienzo: fondo liso + el resplandor de sección de cada tono a su intensidad real (--glow-alpha).
  // Cada `SectionGlow` pinta dos tonos en esquinas opuestas de SU sección con radio 70%: en pantalla
  // casi no llegan a solaparse, así que el peor caso real es un solo tono a la vez.
  const glowAlpha = parseFloat(resolve(theme, '--glow-alpha')) / 100;
  const canvases: Base[] = [
    { name: '--bg', rgb: bg },
    ...hues.map((hue) => ({
      name: `--bg + resplandor ${hue}`,
      rgb: composite({ ...color(theme, `--c-${hue}`), a: glowAlpha }, bg),
    })),
  ];
  const band = composite(color(theme, '--band-bg'), bg);

  const solids: Base[] = ['--surface-1', '--surface-2', '--surface-3'].map((name) => ({
    name,
    rgb: color(theme, name),
  }));

  // Vidrio compuesto sobre cada lienzo (los materiales translúcidos)
  const glassNames = ['--glass-bg', '--glass-hover-bg', '--glass-thin-bg', '--glass-thick-bg'];
  const glass: Base[] = glassNames.flatMap((material) =>
    canvases.map((canvas) => ({
      name: `${material} / ${canvas.name}`,
      rgb: composite(color(theme, material), canvas.rgb),
    })),
  );
  glass.push({ name: '--glass-solid', rgb: color(theme, '--glass-solid') });

  const bases: Base[] = [...canvases, { name: '--band-bg', rgb: band }, ...solids, ...glass];

  // Texto neutro y de marca sobre todos los fondos
  for (const fg of ['--fg', '--fg-muted', '--fg-subtle', '--accent-text']) {
    for (const base of bases) {
      check(theme, `${fg} sobre ${base.name}`, color(theme, fg), base.rgb, TEXT);
    }
  }
  for (const base of [...canvases, ...solids, ...glass]) {
    check(theme, `--danger sobre ${base.name}`, color(theme, '--danger'), base.rgb, TEXT);
    check(
      theme,
      `--focus-ring sobre ${base.name}`,
      color(theme, '--focus-ring'),
      base.rgb,
      NON_TEXT,
    );
    check(
      theme,
      `--input-border sobre ${base.name}`,
      color(theme, '--input-border'),
      base.rgb,
      NON_TEXT,
    );
  }

  // Texto de cada tono (etiquetas, enlaces, iconos con texto) sobre fondos y sobre su propio tinte;
  // el tinte es translúcido: se compone sobre el fondo donde puede aparecer. Los iconos (no texto) 3:1.
  for (const hue of hues) {
    const fg = color(theme, `--c-${hue}-fg`);
    const solid = color(theme, `--c-${hue}`);
    const tint = color(theme, `--c-${hue}-tint`);
    for (const base of bases) {
      check(theme, `--c-${hue}-fg sobre ${base.name}`, fg, base.rgb, TEXT);
      check(
        theme,
        `--c-${hue}-fg sobre --c-${hue}-tint / ${base.name}`,
        fg,
        composite(tint, base.rgb),
        TEXT,
      );
      check(
        theme,
        `--fg sobre --c-${hue}-tint / ${base.name}`,
        color(theme, '--fg'),
        composite(tint, base.rgb),
        TEXT,
      );
    }
    for (const base of [...canvases, ...solids]) {
      check(theme, `--c-${hue} (gráfico) sobre ${base.name}`, solid, base.rgb, NON_TEXT);
    }
  }

  // Aviso de contenido de ejemplo (ámbar)
  for (const base of [...canvases, ...solids, ...glass]) {
    const warningBg = composite(color(theme, '--warning-bg'), base.rgb);
    check(theme, `--warning sobre ${base.name}`, color(theme, '--warning'), base.rgb, TEXT);
    check(
      theme,
      `--warning sobre --warning-bg / ${base.name}`,
      color(theme, '--warning'),
      warningBg,
      TEXT,
    );
    check(theme, `--fg sobre --warning-bg / ${base.name}`, color(theme, '--fg'), warningBg, TEXT);
    check(
      theme,
      `--fg-muted sobre --warning-bg / ${base.name}`,
      color(theme, '--fg-muted'),
      warningBg,
      TEXT,
    );
  }

  // Tinte de acento (iconos, marcas)
  for (const base of [...canvases, ...solids, ...glass]) {
    const tint = composite(color(theme, '--accent-tint'), base.rgb);
    check(
      theme,
      `--accent-text sobre --accent-tint / ${base.name}`,
      color(theme, '--accent-text'),
      tint,
      TEXT,
    );
  }

  // Texto sobre botones de acento
  for (const bgName of ['--accent', '--accent-hover', '--accent-pressed']) {
    check(
      theme,
      `--on-accent sobre ${bgName}`,
      color(theme, '--on-accent'),
      color(theme, bgName),
      TEXT,
    );
  }
}

// Miniaturas de proyecto/post (Fase 3.1): `ThumbBadge` y el botón "Ver demo" van en una píldora
// SIEMPRE oscura (material-thumb-badge, --thumb-scrim-bg), sea cual sea el tema del sitio, porque
// tienen que leerse sobre CUALQUIER imagen o degradado subido a /public — no solo sobre el fondo del
// tema. Se comprueba una sola vez (no por tema) contra el peor caso real: una miniatura casi blanca
// (la mayor luminancia posible detrás del scrim reduce más el contraste del texto claro).
const constants = readTokens(css, /^:root$/);
const scrimBg = parseColor(constants['--thumb-scrim-bg']!);
const nearWhiteBackdrops: Base[] = [
  { name: 'blanco', rgb: { r: 255, g: 255, b: 255, a: 1 } },
  { name: '#f6f8fa', rgb: parseColor('#f6f8fa') },
  { name: '#eaeef2', rgb: parseColor('#eaeef2') },
];
for (const backdrop of nearWhiteBackdrops) {
  const scrimOverBackdrop = composite(scrimBg, backdrop.rgb);
  for (const hue of hues) {
    const thumbFg = parseColor(scales[`--color-${hue}-300`]!);
    check(
      'thumb',
      `--thumb-fg (${hue}) sobre --thumb-scrim-bg / ${backdrop.name}`,
      thumbFg,
      scrimOverBackdrop,
      TEXT,
    );
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
  `✓ ${checked} pares de contraste cumplen WCAG AA (temas oscuro y claro; vidrio sobre resplandores, 7 tonos y sus tintes).`,
);
