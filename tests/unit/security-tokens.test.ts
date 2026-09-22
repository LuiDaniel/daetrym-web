import { describe, expect, it } from 'vitest';
import { createDownloadToken, verifyDownloadToken } from '@/lib/security/download-token';
import { hashIp } from '@/lib/security/ip-hash';
import { createUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/security/newsletter-token';
import { generateToken, hashToken, verifyToken } from '@/lib/security/tokens';
import { isHoneypotFilled } from '@/lib/security/honeypot';

describe('hashIp', () => {
  it('nunca devuelve la IP en claro', () => {
    const hash = hashIp('203.0.113.42');
    expect(hash).not.toContain('203.0.113.42');
  });

  it('es determinista para la misma IP', () => {
    expect(hashIp('203.0.113.42')).toBe(hashIp('203.0.113.42'));
  });

  it('produce hashes distintos para IPs distintas', () => {
    expect(hashIp('203.0.113.42')).not.toBe(hashIp('203.0.113.43'));
  });
});

describe('tokens (confirmación de newsletter, un solo uso)', () => {
  it('genera tokens distintos cada vez', () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it('verifyToken acepta el token correcto y rechaza cualquier otro', () => {
    const token = generateToken();
    const hash = hashToken(token);
    expect(verifyToken(token, hash)).toBe(true);
    expect(verifyToken('un-token-distinto', hash)).toBe(false);
  });
});

describe('download-token (recurso descargable, firmado, vida corta)', () => {
  it('un token recién creado es válido y devuelve el email', () => {
    const token = createDownloadToken('lead@example.com');
    const result = verifyDownloadToken(token);
    expect(result.valid).toBe(true);
    expect(result.email).toBe('lead@example.com');
  });

  it('rechaza un token manipulado', () => {
    const token = createDownloadToken('lead@example.com');
    const tampered = token.slice(0, -2) + 'zz';
    expect(verifyDownloadToken(tampered).valid).toBe(false);
  });

  it('rechaza un token con formato inválido', () => {
    expect(verifyDownloadToken('no-es-un-token-valido').valid).toBe(false);
  });
});

describe('newsletter unsubscribe token (determinista, sin caducidad)', () => {
  it('se puede recalcular igual en cualquier momento para el mismo email', () => {
    const a = createUnsubscribeToken('lead@example.com');
    const b = createUnsubscribeToken('lead@example.com');
    expect(a).toBe(b);
  });

  it('verifica correctamente y devuelve el email', () => {
    const token = createUnsubscribeToken('lead@example.com');
    const result = verifyUnsubscribeToken(token);
    expect(result.valid).toBe(true);
    expect(result.email).toBe('lead@example.com');
  });

  it('rechaza un token de otro email pegado a mano', () => {
    const token = createUnsubscribeToken('lead@example.com');
    const [, signature] = token.split('.');
    const forged = `${Buffer.from('otro@example.com').toString('base64url')}.${signature}`;
    expect(verifyUnsubscribeToken(forged).valid).toBe(false);
  });
});

describe('honeypot', () => {
  it('un campo vacío u omitido no delata nada', () => {
    expect(isHoneypotFilled(undefined)).toBe(false);
    expect(isHoneypotFilled('')).toBe(false);
    expect(isHoneypotFilled('   ')).toBe(false);
  });

  it('cualquier valor relleno delata al bot', () => {
    expect(isHoneypotFilled('http://spam.example')).toBe(true);
  });
});
