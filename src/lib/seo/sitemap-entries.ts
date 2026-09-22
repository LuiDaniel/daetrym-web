import { siteConfig } from '@/config/site';
import { serviceSlugs } from '@/config/services';
import { routing, type AppPathname, type Locale } from '@/i18n/routing';
import { getAllPosts } from '@/lib/content/blog';
import { getAllProjects } from '@/lib/content/projects';

/**
 * Páginas de contenido de verdad (se excluyen a propósito: 404, mantenimiento, y newsletter/confirm
 * y /unsubscribe — utilidad transaccional, ya `noindex` en su metadata, no algo que buscar).
 */
const STATIC_PATHNAMES: AppPathname[] = [
  '/',
  '/services',
  '/cybersecurity',
  '/projects',
  '/about',
  '/process',
  '/blog',
  '/contact',
  '/request-quote',
  '/resources',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
  '/security',
];

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
  /** Un `url` alterno por idioma (incluido el propio) para `<xhtml:link rel="alternate" hreflang>`. */
  alternates?: { languages: Record<string, string> };
};

/**
 * Ruta localizada de una `pathname` de `routing.pathnames`, sin pasar por `@/i18n/navigation` (esa
 * capa arrastra `next/navigation`, que no resuelve en Vitest — mismo motivo que `lib/content/rss.ts`).
 */
function localizedPath(pathname: AppPathname, locale: Locale, slug?: string): string {
  const template = routing.pathnames[pathname];
  const path = typeof template === 'string' ? template : template[locale];
  const resolved = slug ? path.replace('[slug]', slug) : path;
  // La home es "/" en la plantilla: sin este caso, `/${locale}/` quedaría con barra final, distinto
  // del canónico real que genera `getPathname` (sin barra) — ver buildAlternates.
  return resolved === '/' ? `/${locale}` : `/${locale}${resolved}`;
}

function withAlternates(
  pathname: AppPathname,
  slug: string | undefined,
  origin: string,
  build: (locale: Locale) => string | undefined,
): Pick<SitemapEntry, 'alternates'> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const path = build(locale);
    if (path) languages[locale] = `${origin}${path}`;
  }
  languages['x-default'] = `${origin}${localizedPath(pathname, routing.defaultLocale, slug)}`;
  return { alternates: { languages } };
}

/** Todas las entradas del sitemap (una función pura: fácil de probar sin el runtime de Next). */
export function buildSitemapEntries(): SitemapEntry[] {
  const origin = siteConfig.url.replace(/\/$/, '');
  const entries: SitemapEntry[] = [];

  for (const pathname of STATIC_PATHNAMES) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${origin}${localizedPath(pathname, locale)}`,
        changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
        priority: pathname === '/' ? 1 : 0.6,
        ...withAlternates(pathname, undefined, origin, (l) => localizedPath(pathname, l)),
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${origin}${localizedPath('/services/[slug]', locale, slug)}`,
        changeFrequency: 'monthly',
        priority: 0.7,
        ...withAlternates('/services/[slug]', slug, origin, (l) =>
          localizedPath('/services/[slug]', l, slug),
        ),
      });
    }
  }

  // El slug es el mismo nombre de archivo en los dos idiomas (tests/unit/content.test.ts exige que
  // exista en ambos), así que sí se puede construir el hreflang aquí, a diferencia de un slug que
  // pudiera variar por idioma.
  for (const locale of routing.locales) {
    for (const project of getAllProjects(locale)) {
      entries.push({
        url: `${origin}${localizedPath('/projects/[slug]', locale, project.slug)}`,
        changeFrequency: 'monthly',
        priority: 0.6,
        ...withAlternates('/projects/[slug]', project.slug, origin, (l) =>
          localizedPath('/projects/[slug]', l, project.slug),
        ),
      });
    }
    for (const post of getAllPosts(locale)) {
      entries.push({
        url: `${origin}${localizedPath('/blog/[slug]', locale, post.slug)}`,
        lastModified: new Date(`${post.frontmatter.date}T00:00:00Z`),
        changeFrequency: 'monthly',
        priority: 0.6,
        ...withAlternates('/blog/[slug]', post.slug, origin, (l) =>
          localizedPath('/blog/[slug]', l, post.slug),
        ),
      });
    }
  }

  return entries;
}
