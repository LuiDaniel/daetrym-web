import { defineConfig } from 'drizzle-kit';

/**
 * Config de drizzle-kit (solo para `pnpm db:generate`/`db:migrate`/`db:studio`, nunca importado por
 * la app). `dbCredentials.url` solo hace falta para `db:studio` (inspecciona una base real); generar
 * migraciones no necesita conexión. Ver docs/ARCHITECTURE.md §3 y §14 para el porqué del driver dual.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://placeholder/placeholder',
  },
});
