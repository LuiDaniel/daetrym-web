import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { routing } from '@/i18n/routing';
import { isKnownPath } from '@/lib/routes';
import { buildCsp, generateNonce } from '@/lib/security/headers';

const handleI18n = createMiddleware(routing);
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Proxy (antes "middleware"):
 *  1) genera el nonce de la CSP y lo pasa a Next por cabecera de petición (así lo aplica a sus scripts),
 *  2) modo mantenimiento,
 *  3) URLs inexistentes → página 404 renderizada en servidor (estado 404),
 *  4) detección y enrutado de idioma.
 * Las demás cabeceras de seguridad (HSTS, COOP…) son estáticas y viven en next.config.ts.
 */
export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  // Origen de la analítica (Fase 5): a diferencia de Turnstile, no es fijo — depende de si es Umami
  // cloud, autoalojado, o Plausible — así que se calcula de la propia variable de entorno.
  const analyticsOrigin = env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL
    ? new URL(env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL).origin
    : undefined;
  const csp = buildCsp({
    nonce,
    isDev,
    // Turnstile (formularios, Fase 4): su iframe y su verificación en cliente necesitan este origen.
    frameSrc: ['https://challenges.cloudflare.com'],
    connectSrc: [
      'https://challenges.cloudflare.com',
      ...(analyticsOrigin ? [analyticsOrigin] : []),
    ],
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  let response: NextResponse;

  if (env.MAINTENANCE_MODE) {
    const [, first] = request.nextUrl.pathname.split('/');
    const locale = routing.locales.find((l) => l === first) ?? routing.defaultLocale;

    // Se reescribe a la ruta INTERNA (carpeta app/[locale]/(marketing)/maintenance), no a la localizada.
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/maintenance`;

    response = NextResponse.rewrite(url, {
      status: 503,
      headers: { 'Retry-After': '3600', 'X-Robots-Tag': 'noindex' },
      request: { headers: requestHeaders },
    });
  } else if (!isKnownPath(request.nextUrl.pathname)) {
    // URL inexistente: se reescribe a una página 404 real (renderizada en servidor) con estado 404.
    // Ver src/lib/routes.ts para el motivo (un notFound() dinámico se pintaría solo en el cliente).
    const [, first] = request.nextUrl.pathname.split('/');
    const locale = routing.locales.find((l) => l === first) ?? routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/404`;

    response = NextResponse.rewrite(url, {
      status: 404,
      headers: { 'X-Robots-Tag': 'noindex' },
      request: { headers: requestHeaders },
    });
  } else {
    response = handleI18n(new NextRequest(request, { headers: requestHeaders }));
  }

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  // Excluye API, internos de Next y cualquier ruta con extensión (incluye /.well-known/security.txt).
  // Incluye los prefetch de next/link: con rutas localizadas (/es/nosotros → /about) también necesitan
  // el reescrito de next-intl; sin él responderían 404 y se perdería la precarga.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
