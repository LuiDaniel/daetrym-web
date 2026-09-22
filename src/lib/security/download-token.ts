import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/env';

/**
 * Token de descarga del recurso descargable (checklist, docs/ARCHITECTURE.md §3): firmado con HMAC,
 * sin estado (no necesita fila propia ni tabla). Reutiliza `IP_HASH_SECRET` con un prefijo de
 * dominio distinto (separación de dominios de un HMAC: mismo secreto, dos usos que nunca se
 * confunden) en vez de pedir otra variable de entorno solo para esto — ver docs/ARCHITECTURE.md §14.
 * Vida corta (1 hora): se emite tras confirmar el email, no antes.
 */
const CONTEXT = 'resource-download:v1';
const TTL_MS = 60 * 60 * 1000;

function sign(email: string, expiresAt: number) {
  return createHmac('sha256', env.IP_HASH_SECRET)
    .update(`${CONTEXT}:${email}:${expiresAt}`)
    .digest('base64url');
}

export function createDownloadToken(email: string) {
  const expiresAt = Date.now() + TTL_MS;
  const signature = sign(email, expiresAt);
  return `${Buffer.from(email).toString('base64url')}.${expiresAt}.${signature}`;
}

export function verifyDownloadToken(token: string): { valid: boolean; email?: string } {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };
  const [emailPart, expiresAtPart, signature] = parts as [string, string, string];

  const expiresAt = Number(expiresAtPart);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return { valid: false };

  const email = Buffer.from(emailPart, 'base64url').toString('utf8');
  const expected = Buffer.from(sign(email, expiresAt));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { valid: false };
  }

  return { valid: true, email };
}
