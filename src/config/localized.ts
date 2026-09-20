import type { Locale } from '@/i18n/routing';

/** Texto con una versión por idioma, para datos de ejemplo que viven en /src/config. */
export type Localized = Record<Locale, string>;

export function pick(value: Localized, locale: Locale): string {
  return value[locale];
}
