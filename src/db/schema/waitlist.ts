import { pgTable, text, unique } from 'drizzle-orm/pg-core';
import { idColumn, timestampColumns } from './columns.helpers';

/**
 * Lista de espera de la Home («Próximamente»): `interests` son los ids de `home.soon.items`
 * (`tool`/`checklist`) que marcó la persona. Sin política de retención propia (docs/ARCHITECTURE.md §3):
 * es solo una intención de contacto, no datos sensibles.
 */
export const waitlist = pgTable(
  'waitlist',
  {
    ...idColumn,
    email: text('email').notNull(),
    interests: text('interests').array().notNull(),
    locale: text('locale').notNull(),
    ...timestampColumns,
  },
  (table) => [unique('waitlist_email_key').on(table.email)],
);
