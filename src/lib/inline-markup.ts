/**
 * Marcado en línea mínimo para los textos largos (legales, política de divulgación):
 *  - `{clave}`               → se sustituye por un valor de la configuración (correo, razón social…)
 *  - `[texto](destino)`      → enlace; destino = ruta interna (`/security`) o `mailto:`
 *  - `[COMPLETAR: …]` / `[COMPLETE: …]` → marcador de dato pendiente (se resalta en pantalla)
 *
 * Es deliberadamente pequeño: sin HTML, sin negritas. Cualquier destino que no sea una ruta interna
 * o un mailto se degrada a texto plano (nunca se genera `javascript:` ni un enlace externo por sorpresa).
 */

export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'placeholder'; text: string };

const PLACEHOLDER = /\[(?:COMPLETAR|COMPLETE):[^\]]*\]/g;
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Sustituye `{clave}` por su valor. Las claves desconocidas se dejan tal cual (así se ven en pantalla). */
export function fillTokens(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/**
 * Solo rutas internas y `mailto:`. Una ruta interna empieza por UNA barra y no contiene barras
 * invertidas ni espacios: los navegadores tratan `\` como `/` en URLs http(s), así que `/\host` se
 * resolvería como `//host` (un enlace externo).
 */
const INTERNAL_PATH = /^\/(?![/\\])[^\\\s]*$/;

export function isSafeHref(href: string): boolean {
  if (href.startsWith('mailto:')) return href.length > 'mailto:'.length;
  return INTERNAL_PATH.test(href);
}

function splitLinks(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [whole, label, href] = match;
    const index = match.index ?? 0;
    if (index > last) tokens.push({ type: 'text', text: text.slice(last, index) });
    if (label && href && isSafeHref(href)) tokens.push({ type: 'link', text: label, href });
    else tokens.push({ type: 'text', text: label ?? whole });
    last = index + whole.length;
  }
  if (last < text.length) tokens.push({ type: 'text', text: text.slice(last) });
  return tokens;
}

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const match of text.matchAll(PLACEHOLDER)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push(...splitLinks(text.slice(last, index)));
    tokens.push({ type: 'placeholder', text: match[0] });
    last = index + match[0].length;
  }
  if (last < text.length) tokens.push(...splitLinks(text.slice(last)));
  return tokens;
}
