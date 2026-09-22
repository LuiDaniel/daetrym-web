import { timestamp, uuid } from 'drizzle-orm/pg-core';

/** `id uuid pk default gen_random_uuid()` — igual en las cuatro tablas (docs/ARCHITECTURE.md §3). */
export const idColumn = {
  id: uuid('id').primaryKey().defaultRandom(),
};

/** `created_at`/`updated_at`, igual en las cuatro tablas. */
export const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
