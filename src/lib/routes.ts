import { isServiceSlug } from '@/config/services';
import { routing } from '@/i18n/routing';

/**
 * Validadores de segmentos dinámicos. Un segmento `[param]` SIN validador se considera inexistente:
 * falla cerrado, de modo que una ruta declarada en routing.ts pero aún sin página (p. ej. /blog/[slug]
 * antes de la Fase 3) devuelve la 404 de marca en lugar de la genérica de Next.
 * Al construir el blog y los proyectos, registrar aquí su validador con los slugs del contenido.
 */
const paramValidators: Record<string, (value: string) => boolean> = {
  '/services/[slug]': isServiceSlug,
};

/**
 * ¿Existe esta URL (con prefijo de idioma)? Usa la misma tabla de rutas localizadas que next-intl
 * (src/i18n/routing.ts), así que no hay una segunda lista que mantener.
 *
 * Existe para que el proxy pueda responder las URLs desconocidas con una página 404 renderizada en
 * servidor y estado 404: un `notFound()` lanzado desde una página dinámica hace que Next recurra al
 * renderizado en cliente (sin contenido en el HTML para visitantes sin JavaScript ni rastreadores).
 */
export function isKnownPath(pathname: string): boolean {
  const [first, ...rest] = pathname.split('/').filter(Boolean);
  const locale = routing.locales.find((candidate) => candidate === first);
  // Sin prefijo de idioma no decidimos nosotros: next-intl redirige a la versión con idioma.
  if (!locale) return true;

  for (const [internal, config] of Object.entries(routing.pathnames)) {
    const template = typeof config === 'string' ? config : config[locale];
    const templateSegments = template.split('/').filter(Boolean);
    if (templateSegments.length !== rest.length) continue;

    let matches = true;
    for (const [index, segment] of templateSegments.entries()) {
      const actual = rest[index] ?? '';
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const validate = paramValidators[internal];
        if (!validate || !validate(actual)) matches = false;
      } else if (segment !== actual) {
        matches = false;
      }
      if (!matches) break;
    }
    if (matches) return true;
  }
  return false;
}
