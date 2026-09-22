import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/env';

/**
 * Enlace de baja (RFC 8058): a diferencia del token de confirmación (aleatorio, un solo uso, se
 * guarda su hash), el de baja tiene que poder incluirse en CUALQUIER email futuro de ese suscriptor,
 * no solo en el de alta — así que es una firma HMAC determinista sobre el email normalizado, sin
 * estado que guardar ni caducidad: se puede recalcular igual en cualquier momento
 * (src/db/schema/newsletter.ts explica por qué no hay una columna para esto). Mismo secreto que el
 * token de descarga, con su propio prefijo de dominio (`CONTEXT`) para que nunca se confundan.
 */
const CONTEXT = 'newsletter-unsubscribe:v1';

function sign(email: string) {
  return createHmac('sha256', env.IP_HASH_SECRET).update(`${CONTEXT}:${email}`).digest('base64url');
}

export function createUnsubscribeToken(email: string) {
  return `${Buffer.from(email).toString('base64url')}.${sign(email)}`;
}

export function verifyUnsubscribeToken(token: string): { valid: boolean; email?: string } {
  const [emailPart, signature] = token.split('.');
  if (!emailPart || !signature) return { valid: false };

  const email = Buffer.from(emailPart, 'base64url').toString('utf8');
  const expected = Buffer.from(sign(email));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { valid: false };
  }

  return { valid: true, email };
}
