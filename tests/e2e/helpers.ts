import type { Page } from '@playwright/test';

/** Espera a que React haya hidratado (React marca los nodos con __reactFiber$...). */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.querySelector('main');
    return !!main && Object.keys(main).some((key) => key.startsWith('__reactFiber'));
  });
}

/** Registra violaciones de CSP y errores de consola: el sitio debe cargar SIN ninguna. */
export async function watchForProblems(page: Page) {
  const problems: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      const w = window as unknown as { __csp?: string[] };
      (w.__csp ??= []).push(
        `${event.violatedDirective} → ${event.blockedURI || 'inline'} (${event.sample ?? ''})`,
      );
    });
  });
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return {
    async collect() {
      const csp = await page.evaluate(
        () => (window as unknown as { __csp?: string[] }).__csp ?? [],
      );
      return [...problems, ...csp.map((v) => `csp: ${v}`)];
    },
  };
}

/** Rutas públicas de la fase 2 (las secciones «en construcción» se prueban aparte). */
export const contentRoutes = {
  es: [
    '/es',
    '/es/servicios',
    '/es/servicios/web-apps',
    '/es/servicios/custom-software',
    '/es/servicios/cybersecurity',
    '/es/servicios/consulting',
    '/es/ciberseguridad',
    '/es/nosotros',
    '/es/proceso',
    '/es/legal/privacidad',
    '/es/legal/terminos',
    '/es/legal/cookies',
    '/es/seguridad',
  ],
  en: [
    '/en',
    '/en/services',
    '/en/services/web-apps',
    '/en/services/custom-software',
    '/en/services/cybersecurity',
    '/en/services/consulting',
    '/en/cybersecurity',
    '/en/about',
    '/en/process',
    '/en/legal/privacy',
    '/en/legal/terms',
    '/en/legal/cookies',
    '/en/security',
  ],
} as const;

export const allContentRoutes = [...contentRoutes.es, ...contentRoutes.en];

/** Secciones provisionales que llegan en fases posteriores. */
export const comingSoonRoutes = [
  '/es/proyectos',
  '/es/blog',
  '/es/contacto',
  '/es/solicitar-propuesta',
  '/es/recursos',
  '/en/projects',
  '/en/blog',
  '/en/contact',
  '/en/request-quote',
  '/en/resources',
];

/** Por debajo de 1024 px el header usa el menú lateral (móvil y tablet); a partir de ahí, la navegación completa. */
export const SHEET_BREAKPOINT = 1024;
export const isSheetLayout = (page: Page) => page.viewportSize()!.width < SHEET_BREAKPOINT;

/** Por debajo de 640 px, idioma y tema salen del header y viven solo dentro del menú lateral. */
export const COMPACT_HEADER_BREAKPOINT = 640;
export const isCompactHeader = (page: Page) =>
  page.viewportSize()!.width < COMPACT_HEADER_BREAKPOINT;

/** Ancho visible del sheet lateral: 88 % del viewport con un máximo de 26 rem (416 px). Ver components/ui/side-sheet.tsx. */
export const sheetVisibleWidth = (viewportWidth: number) => Math.min(viewportWidth * 0.88, 416);
