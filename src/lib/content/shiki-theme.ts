/**
 * Tema de Shiki para los bloques de código (Fase 3): en vez de un tema con colores fijos (VS Code,
 * GitHub…), cada regla de color es literalmente la cadena `var(--shiki-token-*)` — Shiki no valida que
 * sea un color real, solo la vuelca en el `style` inline. Las variables se definen en
 * `src/styles/code.css` con los tokens de `tokens.css` (7 tonos), así el resaltado de sintaxis sale de
 * la MISMA paleta que el resto del sitio, no de una ajena.
 *
 * Shiki ≥ 3 retiró el tema `css-variables` que traía este mismo truco de fábrica; se reconstruye aquí.
 */
import type { ThemeRegistrationRaw } from 'shiki';

type TokenColorRule = { scope: string[]; settings: { foreground: string } };

const tokenColors: TokenColorRule[] = [
  {
    scope: ['comment', 'punctuation.definition.comment'],
    settings: { foreground: 'var(--shiki-token-comment)' },
  },
  {
    scope: ['string', 'string.quoted', 'string.template'],
    settings: { foreground: 'var(--shiki-token-string)' },
  },
  {
    scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other'],
    settings: { foreground: 'var(--shiki-token-constant)' },
  },
  {
    scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator'],
    settings: { foreground: 'var(--shiki-token-keyword)' },
  },
  {
    scope: ['entity.name.function', 'support.function', 'meta.function-call'],
    settings: { foreground: 'var(--shiki-token-function)' },
  },
  {
    scope: ['variable.parameter', 'entity.other.attribute-name'],
    settings: { foreground: 'var(--shiki-token-parameter)' },
  },
  {
    scope: ['punctuation', 'meta.brace'],
    settings: { foreground: 'var(--shiki-token-punctuation)' },
  },
  {
    scope: ['entity.name.tag', 'support.class', 'entity.name.type', 'support.type'],
    settings: { foreground: 'var(--shiki-token-tag)' },
  },
  { scope: ['markup.underline.link'], settings: { foreground: 'var(--shiki-token-link)' } },
];

/** `type`/`name` son obligatorios para Shiki pero no afectan al resultado: todo sale de las variables. */
export const cssVariablesShikiTheme: ThemeRegistrationRaw = {
  name: 'daetrym-css-variables',
  type: 'dark',
  colors: {
    'editor.foreground': 'var(--shiki-color-text)',
    'editor.background': 'var(--shiki-color-background)',
  },
  // `settings` es el campo "en bruto" (vscode-textmate); vacío porque usamos `tokenColors`, que Shiki
  // sabe leer igual — pero el tipo lo exige.
  settings: [],
  tokenColors,
};
