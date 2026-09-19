import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

type Href = Parameters<typeof getPathname>[0]['href'];

/**
 * `alternates` de metadata: canonical del idioma actual + hreflang de todos los idiomas + x-default.
 * Las URLs son relativas; `metadataBase` (layout) las vuelve absolutas.
 */
export function buildAlternates(locale: Locale, href: Href): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};
  for (const code of routing.locales) {
    languages[code] = getPathname({ locale: code, href });
  }
  languages['x-default'] = getPathname({ locale: routing.defaultLocale, href });

  return {
    canonical: getPathname({ locale, href }),
    languages,
  };
}
