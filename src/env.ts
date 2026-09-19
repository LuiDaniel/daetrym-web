/**
 * Validación de variables de entorno al arrancar (build y runtime) con Zod.
 * - `server`: solo disponibles en el servidor. Nunca llevan el prefijo NEXT_PUBLIC_.
 * - `client`: públicas (se incluyen en el bundle). Nada sensible aquí.
 * En producción faltar una variable obligatoria rompe la build en vez de fallar en runtime.
 * Ver .env.example para la descripción de cada una.
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
  },

  runtimeEnv: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_SECURITY_EMAIL: process.env.NEXT_PUBLIC_SECURITY_EMAIL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NEXT_PUBLIC_CAL_URL: process.env.NEXT_PUBLIC_CAL_URL,
  },

  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
