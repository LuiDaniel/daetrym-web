/**
 * Validación de variables de entorno al arrancar (build y runtime) con Zod.
 * - `server`: solo disponibles en el servidor. Nunca llevan el prefijo NEXT_PUBLIC_.
 * - `client`: públicas (se incluyen en el bundle). Nada sensible aquí.
 * En producción faltar una variable obligatoria rompe la build en vez de fallar en runtime.
 * Ver .env.example para la descripción de cada una.
 *
 * Fase 4 (backend): varias variables son opcionales fuera de producción y tienen un valor por
 * defecto que permite `pnpm dev`/`pnpm test` sin ninguna cuenta externa — ver el comentario de cada
 * una. En producción son obligatorias (o, en el caso de Turnstile, el valor de pruebas de Cloudflare
 * se sustituye por defecto y hay que ponerlo explícitamente si de verdad se quiere seguir usándolo).
 */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProd = process.env.NODE_ENV === 'production';

export const env = createEnv({
  server: {
    /** "true" activa la página de mantenimiento (503) en todo el sitio. */
    MAINTENANCE_MODE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),

    /**
     * Cadena de conexión de Neon (HTTP). Sin ella, `src/db/index.ts` usa una base Postgres embebida
     * en memoria (`@electric-sql/pglite`, sin instalar nada ni tener Docker) — ver
     * docs/ARCHITECTURE.md §14. A propósito SIN `isProd` (a diferencia del resto de variables de esta
     * sección): tanto `next build`/`next typegen` como una build real en Vercel corren con
     * `NODE_ENV=production`, así que exigirla aquí rompería `pnpm build`/`pnpm typecheck` en local
     * sin una cuenta de Neon — justo lo que el motor embebido evita. La obligatoriedad real en un
     * despliegue de verdad se documenta en docs/DEPLOY.md, no se fuerza aquí.
     */
    DATABASE_URL: z.url().optional(),

    /**
     * Secreto del HMAC-SHA256 que anonimiza la IP antes de guardarla (`src/lib/security/ip-hash.ts`).
     * ≥ 32 caracteres: `openssl rand -base64 32`. El valor por defecto fuera de producción es
     * intencionadamente reconocible como no apto para producción.
     */
    IP_HASH_SECRET: isProd
      ? z.string().min(32)
      : z.string().min(16).default('dev-only-insecure-secret-do-not-use-in-production'),

    /** Clave de la API de Resend. Sin ella, `src/lib/email/index.ts` solo registra el email en consola. */
    RESEND_API_KEY: z.string().optional(),
    /** Remitente con dominio verificado en Resend (obligatorio en producción si se quiere enviar). */
    EMAIL_FROM: isProd
      ? z.string().min(1)
      : z.string().min(1).default('DaeTrym (dev) <dev@daetrym.test>'),

    /** Upstash Redis (REST). Sin ambas, `src/lib/security/rate-limit.ts` no limita (deja pasar). */
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    /**
     * Turnstile (verificación de servidor). Por defecto, fuera de producción, usa la clave de
     * PRUEBA pública de Cloudflare que siempre aprueba (mismo valor en `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
     * más abajo) — así el widget real se carga y se verifica en servidor sin cuenta de Cloudflare.
     * Ver https://developers.cloudflare.com/turnstile/troubleshooting/testing/. Obligatoria (con una
     * clave real) en producción.
     */
    TURNSTILE_SECRET_KEY: isProd
      ? z.string().min(1)
      : z.string().min(1).default('1x0000000000000000000000000000000AA'),

    /** Protege /api/cron/retention (cabecera `Authorization: Bearer …`, convención de Vercel Cron). */
    CRON_SECRET: isProd
      ? z.string().min(16)
      : z.string().min(16).default('dev-only-insecure-cron-secret-do-not-use-in-production'),
  },

  client: {
    NEXT_PUBLIC_SITE_URL: isProd ? z.url() : z.url().default('http://localhost:3000'),
    NEXT_PUBLIC_CONTACT_EMAIL: isProd ? z.email() : z.email().default('hello@example.com'),
    NEXT_PUBLIC_SECURITY_EMAIL: z.email().optional(),
    /** Solo dígitos con prefijo de país, sin "+" (formato wa.me). Ej: 51999999999 */
    NEXT_PUBLIC_WHATSAPP_NUMBER: z
      .string()
      .regex(/^\d{8,15}$/)
      .optional(),
    NEXT_PUBLIC_CAL_URL: z.url().optional(),
    /** Site key pública de Turnstile; ver `TURNSTILE_SECRET_KEY` arriba. */
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: isProd
      ? z.string().min(1)
      : z.string().min(1).default('1x00000000000000000000AA'),

    /**
     * Analítica sin cookies (Umami o Plausible; D3). Ambas opcionales: sin las dos,
     * `components/seo/analytics.tsx` no renderiza nada — no hace falta cuenta para desarrollar.
     * `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL` es la URL completa del script (el proxy la añade a
     * `connect-src` de la CSP, ver src/proxy.ts) y `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` el identificador
     * del sitio (Umami: `data-website-id`; en Plausible sería el dominio — ver el comentario del
     * componente para adaptarlo).
     */
    NEXT_PUBLIC_ANALYTICS_SCRIPT_URL: z.url().optional(),
    NEXT_PUBLIC_ANALYTICS_WEBSITE_ID: z.string().min(1).optional(),
  },

  runtimeEnv: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    DATABASE_URL: process.env.DATABASE_URL,
    IP_HASH_SECRET: process.env.IP_HASH_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_SECURITY_EMAIL: process.env.NEXT_PUBLIC_SECURITY_EMAIL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NEXT_PUBLIC_CAL_URL: process.env.NEXT_PUBLIC_CAL_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_ANALYTICS_SCRIPT_URL: process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL,
    NEXT_PUBLIC_ANALYTICS_WEBSITE_ID: process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID,
  },

  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
