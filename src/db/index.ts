/**
 * Cliente de base de datos: dos motores según haya o no `DATABASE_URL` (ver env.ts y
 * docs/ARCHITECTURE.md §14 — desviación documentada del plan original, que proponía `pg` para
 * local/CI/tests):
 *
 * - Con `DATABASE_URL` (Neon, producción y cualquier entorno que quiera una base real): driver HTTP
 *   de Neon (`drizzle-orm/neon-http`), sin estado de conexión que mantener entre invocaciones
 *   serverless.
 * - Sin `DATABASE_URL` (por defecto en desarrollo y en todos los tests): Postgres EMBEBIDO
 *   (`@electric-sql/pglite`, WebAssembly, sin Docker ni servidor) — mismo dialecto SQL, mismas
 *   migraciones, cero cuentas externas. SIEMPRE en memoria, nunca en disco: `next build` ejecuta
 *   "Collecting page data" con varios workers en paralelo, y cada uno importa este módulo por
 *   separado — un `.pglite` en disco compartido entre procesos provoca condiciones de carrera reales
 *   en el sistema de archivos WASM de PGlite (se comprobó: error `ENOTDIR` intermitente). Cada
 *   proceso (dev, build, cada test) arranca con una base vacía y se migra sola; es la única manera
 *   segura de no coordinar procesos. Si hace falta que los datos sobrevivan a un reinicio en local,
 *   usar una rama de desarrollo real de Neon (`DATABASE_URL`) en vez de esto.
 *
 * `db` se tipa siempre como `NeonHttpDatabase` (el motor real de producción): ambos drivers exponen
 * el mismo constructor de consultas de drizzle para lo que usa esta app (select/insert/update/
 * delete/returning/query.*, nunca `$withAuth` ni nada específico de Neon), así que el motor embebido
 * se castea a ese tipo — evita que TypeScript infiera un tipo unión inservible (los overloads de
 * `.returning()`/`.query` dejan de resolverse bien en una unión de dos HKT de resultado distintos).
 *
 * Las migraciones del motor embebido se aplican automáticamente al importar este módulo (rápidas e
 * idempotentes, base en memoria). Para Neon se aplican con `pnpm db:migrate` como paso de despliegue
 * — nunca en caliente en una función serverless.
 */
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzleNeon, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import path from 'node:path';
import { env } from '@/env';
import * as schema from './schema';

const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle');

async function createDb(): Promise<NeonHttpDatabase<typeof schema>> {
  if (env.DATABASE_URL) {
    return drizzleNeon(env.DATABASE_URL, { schema });
  }

  const pgliteDb = drizzlePglite(new PGlite(), { schema });
  await migratePglite(pgliteDb, { migrationsFolder: MIGRATIONS_FOLDER });
  return pgliteDb as unknown as NeonHttpDatabase<typeof schema>;
}

export const usingEmbeddedDb = !env.DATABASE_URL;

// Top-level await: Next ejecuta los módulos de servidor como ESM, así que cualquier código que
// importe `db` espera a que termine (incluida la migración del motor embebido) antes de consultarlo.
export const db = await createDb();
