/**
 * Cabeceras de seguridad HTTP. Módulo puro (sin imports de Next) para poder probarlo con Vitest.
 *
 * CSP estricta con NONCE por petición + 'strict-dynamic' (sin 'unsafe-inline' en scripts).
 * El nonce lo genera src/proxy.ts y Next lo aplica a sus scripts y estilos; por eso las páginas
 * se renderizan bajo demanda (decisión D1 en docs/ARCHITECTURE.md: el spike demostró que la
 * alternativa estática con SRI no funciona en Next 16.3).
 *
 * El resto de cabeceras no dependen de la petición y se fijan en next.config.ts.
 */

export type CspOptions = {
  /** Nonce único por petición (base64). */
  nonce: string;
  isDev?: boolean;
  /** Orígenes extra, p. ej. frames de Turnstile o conexiones de analítica (fases 4 y 5). */
  frameSrc?: string[];
  connectSrc?: string[];
};

/** 128 bits aleatorios en base64: impredecible y único por petición. */
export function generateNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

export function buildCsp({ nonce, isDev = false, frameSrc = [], connectSrc = [] }: CspOptions) {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", // ignorado por navegadores con 'strict-dynamic'; fallback para los antiguos
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // React usa eval en desarrollo para reconstruir stacks; no se necesita en producción.
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", `'nonce-${nonce}'`, ...(isDev ? ["'unsafe-inline'"] : [])],
    // Atributos style="" (React/motion). No permite <style> inline ni scripts.
    'style-src-attr': ["'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...connectSrc, ...(isDev ? ['ws:', 'wss:'] : [])],
    'frame-src': frameSrc.length > 0 ? frameSrc : ["'none'"],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');

  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

export type Header = { key: string; value: string };

/** Cabeceras que no dependen de la petición (todas salvo la CSP). */
export function securityHeaders({ isDev = false }: { isDev?: boolean } = {}): Header[] {
  const headers: Header[] = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value:
        'accelerometer=(), autoplay=(), browsing-topics=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), midi=(), payment=(), usb=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
  ];

  if (!isDev) {
    // 2 años + preload. Requiere HTTPS en todos los subdominios antes de enviar a hstspreload.org.
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}
