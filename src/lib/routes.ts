import { isBlogSlug, isProjectSlug } from '@/config/content-slugs';
import { isServiceSlug } from '@/config/services';
import { routing } from '@/i18n/routing';

/**
 * Validadores de segmentos dinámicos. Un segmento `[param]` SIN validador se considera inexistente:
 * falla cerrado, de modo que una ruta declarada en routing.ts pero aún sin página devuelve la 404 de
 * marca en lugar de la genérica de Next. Al añadir contenido nuevo, registrar aquí su validador.
 */
const paramValidators: Record<string, (value: string) => boolean> = {
  '/services/[slug]': isServiceSlug,
  '/blog/[slug]': isBlogSlug,
  '/projects/[slug]': isProjectSlug,
};

/**
 * Next sirve `opengraph-image.tsx`/`twitter-image.tsx`/`icon.tsx`/`apple-icon.tsx` como una ruta
 * HERMANA de la página, con un sufijo hash que cambia en cada build (p. ej. `opengraph-image-1ybbry`
 * bajo `/blog/[slug]/`) — un segmento más que la plantilla registrada en routing.ts. Si el último
 * segmento empieza por uno de estos nombres, se valida el resto de la ruta (sin él) como de costumbre.
 */
const METADATA_ROUTE_PREFIXES = ['opengraph-image', 'twitter-image', 'icon', 'apple-icon'];

function isMetadataRouteSegment(segment: string): boolean {
  return METADATA_ROUTE_PREFIXES.some(
    (prefix) => segment === prefix || segment.startsWith(`${prefix}-`),
  );
}

/**
 * ¿Existe esta URL (con prefijo de idioma)? Usa la misma tabla de rutas localizadas que next-intl
 * (src/i18n/routing.ts), así que no hay una segunda lista que mantener.
 *
 * Existe para que el proxy pueda responder las URLs desconocidas con una página 404 renderizada en
 * servidor y estado 404: un `notFound()` lanzado desde una página dinámica hace que Next recurra al
 * renderizado en cliente (sin contenido en el HTML para visitantes sin JavaScript ni rastreadores).
 */
export function isKnownPath(pathname: string): boolean {
  const [first, ...urlSegments] = pathname.split('/').filter(Boolean);
  const locale = routing.locales.find((candidate) => candidate === first);
  // Sin prefijo de idioma no decidimos nosotros: next-intl redirige a la versión con idioma.
  if (!locale) return true;

  const lastSegment = urlSegments.at(-1);
  const isMetadataRoute = !!lastSegment && isMetadataRouteSegment(lastSegment);
  const rest = isMetadataRoute ? urlSegments.slice(0, -1) : urlSegments;

  for (const [internal, config] of Object.entries(routing.pathnames)) {
    // Next sirve las rutas de metadatos (OG, iconos…) tal cual están en el disco, sin pasar por la
    // localización de next-intl — con `/projects/[slug]` en inglés en el archivo aunque el visitante
    // esté en `/es/proyectos/...`. Para esas se comprueba la plantilla de CUALQUIER idioma, no solo la
    // del prefijo de la URL; para una página normal, solo la del idioma detectado (como siempre).
    const templates = isMetadataRoute
      ? typeof config === 'string'
        ? [config]
        : Object.values(config)
      : [typeof config === 'string' ? config : config[locale]];

    for (const template of templates) {
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
  }
  return false;
}
