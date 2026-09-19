import { describe, expect, it } from 'vitest';
import { buildCsp, generateNonce, securityHeaders } from '@/lib/security/headers';

const NONCE = 'dGVzdC1ub25jZQ==';

const directive = (csp: string, name: string) =>
  csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));

describe('generateNonce', () => {
  it('es único por petición y suficientemente largo (≥ 128 bits)', () => {
    const nonces = new Set(Array.from({ length: 200 }, () => generateNonce()));
    expect(nonces.size).toBe(200);
    expect(atob([...nonces][0]!).length).toBeGreaterThanOrEqual(16);
  });

  it('es base64 válido para la CSP (sin comillas ni espacios)', () => {
    expect(generateNonce()).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe('CSP de producción', () => {
  const csp = buildCsp({ nonce: NONCE });

  it('script-src usa nonce + strict-dynamic y no permite unsafe-inline ni unsafe-eval', () => {
    const scriptSrc = directive(csp, 'script-src');
    expect(scriptSrc).toContain(`'nonce-${NONCE}'`);
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('style-src usa nonce; solo los atributos style admiten inline', () => {
    expect(directive(csp, 'style-src')).toBe(`style-src 'self' 'nonce-${NONCE}'`);
    expect(directive(csp, 'style-src-attr')).toBe("style-src-attr 'unsafe-inline'");
  });

  it('bloquea plugins, framing y base-uri ajenos', () => {
    expect(directive(csp, 'object-src')).toBe("object-src 'none'");
    expect(directive(csp, 'frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(directive(csp, 'base-uri')).toBe("base-uri 'self'");
    expect(directive(csp, 'form-action')).toBe("form-action 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('frame-src es none salvo orígenes explícitos', () => {
    expect(directive(csp, 'frame-src')).toBe("frame-src 'none'");
    expect(
      directive(
        buildCsp({ nonce: NONCE, frameSrc: ['https://challenges.cloudflare.com'] }),
        'frame-src',
      ),
    ).toBe('frame-src https://challenges.cloudflare.com');
  });

  it('cada nonce produce una política distinta', () => {
    expect(buildCsp({ nonce: 'aaa=' })).not.toBe(buildCsp({ nonce: 'bbb=' }));
  });
});

describe('CSP de desarrollo', () => {
  it('relaja solo lo necesario para HMR y React', () => {
    const csp = buildCsp({ nonce: NONCE, isDev: true });
    expect(directive(csp, 'script-src')).toContain("'unsafe-eval'");
    expect(directive(csp, 'connect-src')).toContain('ws:');
    expect(csp).not.toContain('upgrade-insecure-requests');
  });
});

describe('cabeceras estáticas de seguridad', () => {
  const headers = Object.fromEntries(securityHeaders().map((h) => [h.key, h.value]));

  it('incluye el conjunto requerido (la CSP la añade el proxy, no next.config)', () => {
    expect(headers['Content-Security-Policy']).toBeUndefined();
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Permissions-Policy']).toContain('camera=()');
  });

  it('HSTS cumple los requisitos de preload (≥ 1 año, includeSubDomains, preload)', () => {
    const hsts = headers['Strict-Transport-Security'] ?? '';
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1]);
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
    expect(hsts).toContain('includeSubDomains');
    expect(hsts).toContain('preload');
  });

  it('no envía HSTS en desarrollo', () => {
    const dev = securityHeaders({ isDev: true }).map((h) => h.key);
    expect(dev).not.toContain('Strict-Transport-Security');
  });
});
