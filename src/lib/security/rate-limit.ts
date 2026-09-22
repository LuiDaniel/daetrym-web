import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/env';

/**
 * Límite por `ip_hash` (Upstash, ventana deslizante). Sin `UPSTASH_REDIS_REST_URL`/`_TOKEN` (dev/test
 * sin cuenta) deja pasar siempre — un aviso una sola vez en consola para que no pase inadvertido en
 * producción. `src/actions/*` deciden la ventana según lo sensible que sea la acción (más estricta en
 * el envío de emails que en la lista de espera).
 */
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;

let warned = false;

export type RateLimitResult = { success: boolean };

/**
 * `requests` intentos por `window` (formato de `@upstash/ratelimit`, p. ej. "60 s", "1 h").
 * `key` debe incluir el nombre de la acción, para que los contadores no se mezclen entre formularios.
 */
export function createRateLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  if (!redis) {
    if (!warned) {
      console.warn(
        '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN no configurados: sin límite de envíos. Solo aceptable fuera de producción.',
      );
      warned = true;
    }
    return { limit: async (): Promise<RateLimitResult> => ({ success: true }) };
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });

  return {
    async limit(key: string): Promise<RateLimitResult> {
      const { success } = await limiter.limit(key);
      return { success };
    },
  };
}
