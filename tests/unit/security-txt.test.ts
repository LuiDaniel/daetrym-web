import { describe, expect, it } from 'vitest';
import { buildSecurityTxt, type SecurityTxtInput } from '@/lib/seo/security-txt';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const daysFromNow = (days: number) => new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);

const input: SecurityTxtInput = {
  contactEmail: 'security@example.com',
  expires: daysFromNow(330),
  preferredLanguages: ['es', 'en'],
  canonical: 'https://example.com/.well-known/security.txt',
  policies: ['https://example.com/es/seguridad', 'https://example.com/en/security'],
};

describe('buildSecurityTxt (RFC 9116)', () => {
  const lines = buildSecurityTxt(input, NOW).split('\n');

  it('incluye los campos obligatorios Contact y Expires, una sola vez cada uno', () => {
    expect(lines.filter((l) => l.startsWith('Contact:'))).toEqual([
      'Contact: mailto:security@example.com',
    ]);
    expect(lines.filter((l) => l.startsWith('Expires:'))).toHaveLength(1);
  });

  it('Expires es ISO 8601 en UTC, futuro y a menos de un año', () => {
    const value = lines.find((l) => l.startsWith('Expires:'))!.replace('Expires: ', '');
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const remaining = new Date(value).getTime() - NOW.getTime();
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThan(365 * 24 * 60 * 60 * 1000);
  });

  it('Preferred-Languages aparece una vez; Canonical y Policy pueden repetirse', () => {
    expect(lines.filter((l) => l.startsWith('Preferred-Languages:'))).toEqual([
      'Preferred-Languages: es, en',
    ]);
    expect(lines).toContain('Canonical: https://example.com/.well-known/security.txt');
    expect(lines.filter((l) => l.startsWith('Policy:'))).toHaveLength(2);
  });

  it('termina con un salto de línea y no usa CRLF ni espacios sobrantes', () => {
    const body = buildSecurityTxt(input, NOW);
    expect(body.endsWith('\n')).toBe(true);
    expect(body).not.toContain('\r');
    expect(body.split('\n').every((l) => l === l.trimEnd())).toBe(true);
  });

  it('rechaza un Expires en el pasado o de un año o más', () => {
    expect(() => buildSecurityTxt({ ...input, expires: daysFromNow(-1) }, NOW)).toThrow(/futuro/);
    expect(() => buildSecurityTxt({ ...input, expires: daysFromNow(365) }, NOW)).toThrow(/un año/);
  });

  it('rechaza un Contact que no sea un correo', () => {
    expect(() => buildSecurityTxt({ ...input, contactEmail: 'no-es-un-correo' }, NOW)).toThrow(
      /Contact/,
    );
  });
});
