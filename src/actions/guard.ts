import { getClientIp, hashIp } from '@/lib/security/ip-hash';
import { createRateLimiter } from '@/lib/security/rate-limit';
import { verifyTurnstileToken } from '@/lib/security/turnstile';
import { isHoneypotFilled } from '@/lib/security/honeypot';
import type { ActionResult } from './types';

/**
 * Comprobaciones comunes a los cuatro formularios, en el orden de docs/ARCHITECTURE.md §3
 * (honeypot → Turnstile → límite de envíos por IP): las cuatro Server Actions llaman a esto antes de
 * volver a validar con Zod y escribir en la base. `limiterConfig` deja que cada formulario tenga su
 * propia ventana (p. ej. la lista de espera es más permisiva que el envío de emails).
 */
export async function guardSubmission({
  website,
  turnstileToken,
  action,
  limiterConfig,
}: {
  website: unknown;
  turnstileToken: string;
  /** Nombre de la acción (contact/quote/newsletter/waitlist): separa los contadores de límite. */
  action: string;
  limiterConfig: { requests: number; window: `${number} ${'s' | 'm' | 'h' | 'd'}` };
}): Promise<{ ok: true; ipHash: string } | { ok: false; result: ActionResult; silent?: boolean }> {
  // Un bot casi siempre rellena hasta los campos invisibles. Se responde "todo bien" (silent) para
  // no delatar que se detectó — pero no se guarda ni se envía nada.
  if (isHoneypotFilled(website)) {
    return { ok: false, result: { ok: true }, silent: true };
  }

  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  const limiter = createRateLimiter(limiterConfig.requests, limiterConfig.window);
  const { success } = await limiter.limit(`${action}:${ipHash}`);
  if (!success) {
    return { ok: false, result: { ok: false, error: 'rate_limit' } };
  }

  const turnstileOk = await verifyTurnstileToken(turnstileToken, ip);
  if (!turnstileOk) {
    return { ok: false, result: { ok: false, error: 'turnstile' } };
  }

  return { ok: true, ipHash };
}
