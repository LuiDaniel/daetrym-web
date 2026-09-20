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
  const csp = buildCsp({ nonce, isDev });

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
