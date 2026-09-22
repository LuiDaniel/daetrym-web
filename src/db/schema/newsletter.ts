import { boolean, index, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns } from './columns.helpers';

export const newsletterStatusEnum = pgEnum('newsletter_status', [
  'pending',
  'confirmed',
  'unsubscribed',
]);

export const newsletterSourceEnum = pgEnum('newsletter_source', ['footer', 'checklist', 'blog']);

/**
 * Suscriptores del newsletter (double opt-in, D7: solo captura + confirmación, sin envío de
 * campañas).
 *
 * `confirm_token_hash` guarda el SHA-256 del token de confirmación (el crudo solo va en ESE email,
 * una sola vez — ver `src/lib/security/tokens.ts`). El enlace de BAJA es distinto a propósito: tiene
 * que poder incluirse en cualquier email futuro, no solo en el de alta, así que en vez de un token
 * aleatorio guardado (que ya no se podría reconstruir para un email posterior) usa una firma HMAC
 * determinista sobre el email (`src/lib/security/newsletter-token.ts`, mismo patrón que el token de
 * descarga) — no necesita columna propia porque se puede volver a calcular en cualquier momento.
 *
 * Al darse de baja, `src/actions/newsletter.tsx` limpia los campos no esenciales de la fila (política
 * de retención "mínimo para no reenviar", docs/ARCHITECTURE.md §3) en el momento; el cron de
 * retención no necesita tocar esta tabla para ese caso.
 */
export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    ...idColumn,
    /** Normalizado a minúsculas antes de insertar (src/actions/newsletter.tsx). */
    email: text('email').notNull(),
    locale: text('locale').notNull(),
    status: newsletterStatusEnum('status').notNull().default('pending'),
    confirmTokenHash: text('confirm_token_hash'),
    confirmExpiresAt: timestamp('confirm_expires_at', { withTimezone: true }),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
    source: newsletterSourceEnum('source').notNull(),
    marketingConsent: boolean('marketing_consent').notNull().default(false),
    ...timestampColumns,
  },
  (table) => [
    unique('newsletter_subscribers_email_key').on(table.email),
    index('newsletter_subscribers_status_idx').on(table.status),
  ],
);
