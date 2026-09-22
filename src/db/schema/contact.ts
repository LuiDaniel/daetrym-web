import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns } from './columns.helpers';

/** Igual en `contact_messages` y `quote_requests`: sin panel de administración (D7), se revisan a mano. */
export const leadStatusEnum = pgEnum('lead_status', ['new', 'read', 'replied', 'spam']);

/** Mensajes del formulario de contacto (src/actions/contact.ts). */
export const contactMessages = pgTable(
  'contact_messages',
  {
    ...idColumn,
    name: text('name').notNull(),
    email: text('email').notNull(),
    company: text('company'),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    /** Idioma en el que se envió (`Locale`): en qué idioma responder. */
    locale: text('locale').notNull(),
    /** HMAC-SHA256(ip, IP_HASH_SECRET) truncado — nunca la IP en claro (docs/ARCHITECTURE.md §3). */
    ipHash: text('ip_hash').notNull(),
    userAgent: text('user_agent'),
    status: leadStatusEnum('status').notNull().default('new'),
    privacyConsentAt: timestamp('privacy_consent_at', { withTimezone: true }).notNull(),
    ...timestampColumns,
  },
  (table) => [
    index('contact_messages_status_created_idx').on(table.status, table.createdAt),
    index('contact_messages_email_idx').on(table.email),
  ],
);
