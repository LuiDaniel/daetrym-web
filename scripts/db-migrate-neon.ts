/**
 * Aplica las migraciones de drizzle/ contra Neon usando el mismo driver HTTP que la app en
 * producción (`drizzle-orm/neon-http`). `drizzle-kit migrate` NO sirve para Neon aquí: su runner de
 * migraciones intenta conectar por websocket (`@neondatabase/serverless` avisa de esto y la conexión
 * nunca llega a completarse contra el endpoint HTTP de Neon) — ver docs/ARCHITECTURE.md §14.
 * Uso: pnpm db:migrate (requiere DATABASE_URL; falla claro si falta).
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Carga `.env.local` a mano (sin dotenv, para no añadir una dependencia solo para esto): en
 * despliegue (Vercel) el archivo no existe y las variables ya llegan por el entorno, así que esto
 * no hace nada; en local rellena lo que falte sin pisar lo que ya esté puesto.
 */
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (!match) continue;
    const [, key, value] = match;
    if (key && !(key in process.env)) process.env[key] = value ?? '';
  }
}
loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL no está definida. Este script migra Neon, no el motor embebido.');
  process.exit(1);
}

const db = drizzle(databaseUrl);

// IIFE en vez de top-level await: `tsx` compila los scripts sueltos (sin "type": "module" en
// package.json) a CJS, que no lo admite a nivel de módulo.
void (async () => {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
  console.log('✓ Migraciones aplicadas contra Neon.');
})();
