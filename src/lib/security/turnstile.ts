import { env } from '@/env';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifica un token de Turnstile en el servidor (nunca basta con que el widget se haya resuelto en
 * cliente: hay que comprobarlo aparte). Fuera de producción, `TURNSTILE_SECRET_KEY` por defecto es
 * la clave de pruebas de Cloudflare que siempre aprueba (ver env.ts), así que esta misma función se
 * ejerce de verdad (llamada real a Cloudflare) en desarrollo y en los tests e2e, sin credenciales.
 */
export async function verifyTurnstileToken(token: string, ip: string) {
  if (!token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success: boolean };
    return result.success === true;
  } catch (error) {
    console.error('[turnstile] fallo al verificar el token', error);
    return false;
  }
}
