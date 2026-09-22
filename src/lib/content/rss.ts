import { siteConfig } from '@/config/site';
import { routing, type Locale } from '@/i18n/routing';
import type { BlogPost } from './blog';

/** Escapa lo mínimo que exige XML en texto y en atributos (no hace falta una librería para esto). */
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Ruta localizada de `/blog` o `/blog/[slug]`, sin pasar por `@/i18n/navigation`: esa capa arrastra
 * `next/navigation`, que no resuelve fuera del runtime de Next (rompe en Vitest) y aquí no hace falta
 * nada de lo que aporta (redirecciones, `usePathname`…), solo sustituir `[slug]` en una plantilla.
 */
function blogPath(locale: Locale, slug?: string): string {
  const template = slug ? routing.pathnames['/blog/[slug]'] : routing.pathnames['/blog'];
  const path = typeof template === 'string' ? template : template[locale];
  return `/${locale}${slug ? path.replace('[slug]', slug) : path}`;
}

/**
 * RSS 2.0 del blog, uno por idioma (`/<locale>/blog/feed.xml`). Sin dependencias: los feeds cambian
 * poco y el formato es sencillo — una librería aquí sería más código que el que ahorra.
 */
export function buildBlogRss({
  locale,
  posts,
  title,
  description,
}: {
  locale: Locale;
  posts: BlogPost[];
  title: string;
  description: string;
}): string {
  const origin = siteConfig.url.replace(/\/$/, '');
  const feedPath = `${blogPath(locale)}/feed.xml`;
  const items = posts
    .map((post) => {
      const url = `${origin}${blogPath(locale, post.slug)}`;
      const pubDate = new Date(`${post.frontmatter.date}T00:00:00Z`).toUTCString();
      return [
        '<item>',
        `<title>${escapeXml(post.frontmatter.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        `<category>${escapeXml(post.frontmatter.category)}</category>`,
        `<description>${escapeXml(post.frontmatter.description)}</description>`,
        '</item>',
      ].join('');
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(title)}</title>`,
    `<link>${origin}${blogPath(locale)}</link>`,
    `<atom:link href="${escapeXml(`${origin}${feedPath}`)}" rel="self" type="application/rss+xml" />`,
    `<description>${escapeXml(description)}</description>`,
    `<language>${locale}</language>`,
    items,
    '</channel>',
    '</rss>',
  ].join('');
}
