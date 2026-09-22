import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { getAllPosts } from '@/lib/content/blog';
import { buildBlogRss } from '@/lib/content/rss';

type Params = { params: Promise<{ locale: string }> };

/** `/<locale>/blog/feed.xml` — un feed por idioma (RFC/Fase 3). Ver docs/ARCHITECTURE.md §13. */
export async function GET(_request: Request, { params }: Params) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const posts = getAllPosts(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const xml = buildBlogRss({
    locale: locale as Locale,
    posts,
    title: t('meta.title'),
    description: t('meta.description'),
  });

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
}
