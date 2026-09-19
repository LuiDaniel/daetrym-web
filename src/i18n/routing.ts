import { defineRouting } from 'next-intl/routing';

/**
 * Única fuente de verdad del routing: idiomas y rutas localizadas.
 * Para añadir un idioma: agregarlo a `locales`, crear src/messages/<locale>.json y una
 * entrada por cada ruta en `pathnames`. Ver README ("Cómo añadir un idioma").
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  // El sitio decide el idioma por Accept-Language la primera vez y luego respeta la cookie
  // NEXT_LOCALE (selector manual persistente). hreflang se emite vía metadata, no por cabecera.
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/services': { es: '/servicios', en: '/services' },
    '/services/[slug]': { es: '/servicios/[slug]', en: '/services/[slug]' },
    '/cybersecurity': { es: '/ciberseguridad', en: '/cybersecurity' },
    '/projects': { es: '/proyectos', en: '/projects' },
    '/projects/[slug]': { es: '/proyectos/[slug]', en: '/projects/[slug]' },
    '/about': { es: '/nosotros', en: '/about' },
    '/process': { es: '/proceso', en: '/process' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/contact': { es: '/contacto', en: '/contact' },
    '/request-quote': { es: '/solicitar-propuesta', en: '/request-quote' },
    '/resources': { es: '/recursos', en: '/resources' },
    '/legal/privacy': { es: '/legal/privacidad', en: '/legal/privacy' },
    '/legal/terms': { es: '/legal/terminos', en: '/legal/terms' },
    '/legal/cookies': '/legal/cookies',
    '/security': { es: '/seguridad', en: '/security' },
    '/maintenance': { es: '/mantenimiento', en: '/maintenance' },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
