import { describe, expect, it } from 'vitest';
import { fillTokens, isSafeHref, parseInline } from '@/lib/inline-markup';

describe('fillTokens', () => {
  it('sustituye las claves conocidas', () => {
    expect(
      fillTokens('Escribe a {email} ({legalName})', { email: 'a@b.co', legalName: 'ACME' }),
    ).toBe('Escribe a a@b.co (ACME)');
  });

  it('deja visibles las claves desconocidas (así se detectan en pantalla)', () => {
    expect(fillTokens('Hola {nadie}', {})).toBe('Hola {nadie}');
  });
});

describe('isSafeHref', () => {
  it('admite rutas internas y mailto', () => {
    expect(isSafeHref('/security')).toBe(true);
    expect(isSafeHref('/.well-known/security.txt')).toBe(true);
    expect(isSafeHref('mailto:hola@example.com')).toBe(true);
  });

  it('rechaza esquemas peligrosos y URLs externas o protocolo-relativas', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('data:text/html,<script>')).toBe(false);
    expect(isSafeHref('https://evil.example')).toBe(false);
    expect(isSafeHref('//evil.example')).toBe(false);
    expect(isSafeHref('mailto:')).toBe(false);
    // Los navegadores tratan \ como / en URLs http(s): /\host equivale a //host.
    expect(isSafeHref('/\\evil.example')).toBe(false); // /\evil.example
    expect(isSafeHref('/\\\\evil.example')).toBe(false); // /\\evil.example
    expect(isSafeHref('/ruta con espacios')).toBe(false);
    expect(isSafeHref('/legal/privacy')).toBe(true);
  });
});

describe('parseInline', () => {
  it('devuelve un único token de texto si no hay marcado', () => {
    expect(parseInline('Texto simple')).toEqual([{ type: 'text', text: 'Texto simple' }]);
  });

  it('extrae enlaces internos y mailto conservando el texto alrededor', () => {
    expect(
      parseInline('Lee la [política](/legal/privacy) o escribe a [a@b.co](mailto:a@b.co).'),
    ).toEqual([
      { type: 'text', text: 'Lee la ' },
      { type: 'link', text: 'política', href: '/legal/privacy' },
      { type: 'text', text: ' o escribe a ' },
      { type: 'link', text: 'a@b.co', href: 'mailto:a@b.co' },
      { type: 'text', text: '.' },
    ]);
  });

  it('degrada a texto un enlace con destino no permitido (nunca genera javascript:)', () => {
    const tokens = parseInline('Pulsa [aquí](javascript:alert(1))');
    expect(tokens.some((token) => token.type === 'link')).toBe(false);
  });

  it('marca los datos pendientes en ambos idiomas', () => {
    expect(parseInline('Domicilio: [COMPLETAR: dirección]')).toEqual([
      { type: 'text', text: 'Domicilio: ' },
      { type: 'placeholder', text: '[COMPLETAR: dirección]' },
    ]);
    expect(parseInline('[COMPLETE: address] and more')).toEqual([
      { type: 'placeholder', text: '[COMPLETE: address]' },
      { type: 'text', text: ' and more' },
    ]);
  });

  it('no confunde corchetes normales con marcadores', () => {
    expect(parseInline('Un [dato] cualquiera')).toEqual([
      { type: 'text', text: 'Un [dato] cualquiera' },
    ]);
  });
});
