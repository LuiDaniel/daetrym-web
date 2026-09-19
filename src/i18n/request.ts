import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';
import { routing } from './routing';

/**
 * El idioma sale del segmento raíz [locale] vía `next/root-params` (Next 16.3+), lo que mantiene el
 * renderizado estático sin `setRequestLocale` ni pasar `params` por los componentes. Un `locale`
 * explícito (p. ej. getTranslations({ locale })) tiene prioridad y evita leer root params, así que
 * también funciona fuera del árbol [locale] (feeds RSS, sitemap, OG…).
 */
export default getRequestConfig(async ({ locale: explicit }) => {
  const requested = explicit ?? (await rootLocale());
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
