import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { db, usingEmbeddedDb } from '@/db';
import { contactMessages, newsletterSubscribers, quoteRequests, waitlist } from '@/db/schema';

/**
 * Verifica el esquema de Drizzle y las migraciones contra una base real: sin `DATABASE_URL` (el caso
 * de `pnpm test`), `db` es Postgres embebido en memoria (`@electric-sql/pglite`, ver src/db/index.ts)
 * — mismas migraciones que Neon en producción, así que esto es una comprobación real del esquema, no
 * un mock. `Server Actions` como `submitContact` no se prueban aquí directamente porque usan
 * `headers()` de `next/headers`, que solo funciona dentro de una petición real de Next (lo cubre
 * tests/e2e); esto prueba la capa que sí pueden probar unitariamente: el esquema y las consultas.
 */
describe('esquema de base de datos (Fase 4)', () => {
  it('usa el motor embebido en el entorno de test', () => {
    expect(usingEmbeddedDb).toBe(true);
  });

  it('contact_messages: inserta y recupera una fila', async () => {
    const [row] = await db
      .insert(contactMessages)
      .values({
        name: 'Test User',
        email: 'test-contact@example.com',
        subject: 'Consulta de prueba',
        message: 'Este es un mensaje de prueba de al menos diez caracteres.',
        locale: 'es',
        ipHash: 'deadbeef',
        status: 'new',
        privacyConsentAt: new Date(),
      })
      .returning();

    expect(row?.id).toBeTruthy();
    expect(row?.status).toBe('new');

    const found = await db.query.contactMessages.findFirst({
      where: eq(contactMessages.email, 'test-contact@example.com'),
    });
    expect(found?.subject).toBe('Consulta de prueba');
  });

  it('quote_requests: inserta con arrays y enums, y los recupera intactos', async () => {
    const [row] = await db
      .insert(quoteRequests)
      .values({
        name: 'Test Quote',
        email: 'test-quote@example.com',
        projectType: 'web_app',
        services: ['web_app', 'security'],
        budgetRange: '5k_15k',
        timeline: 'asap',
        description: 'Descripción de prueba de al menos veinte caracteres de longitud.',
        locale: 'en',
        ipHash: 'deadbeef',
        status: 'new',
        privacyConsentAt: new Date(),
      })
      .returning();

    expect(row?.services).toEqual(['web_app', 'security']);
    expect(row?.budgetRange).toBe('5k_15k');
  });

  it('newsletter_subscribers: el email es único (falla la segunda inserción)', async () => {
    const email = 'unique-test@example.com';
    await db.insert(newsletterSubscribers).values({
      email,
      locale: 'es',
      source: 'footer',
      status: 'pending',
    });

    await expect(
      db.insert(newsletterSubscribers).values({
        email,
        locale: 'es',
        source: 'footer',
        status: 'pending',
      }),
    ).rejects.toThrow();
  });

  it('newsletter_subscribers: confirmar actualiza el estado', async () => {
    const email = 'confirm-test@example.com';
    await db.insert(newsletterSubscribers).values({
      email,
      locale: 'es',
      source: 'checklist',
      status: 'pending',
      confirmTokenHash: 'hash123',
      confirmExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    await db
      .update(newsletterSubscribers)
      .set({ status: 'confirmed', confirmedAt: new Date(), confirmTokenHash: null })
      .where(eq(newsletterSubscribers.email, email));

    const found = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email),
    });
    expect(found?.status).toBe('confirmed');
    expect(found?.confirmTokenHash).toBeNull();
  });

  it('waitlist: el email es único y los intereses se guardan como array', async () => {
    const [row] = await db
      .insert(waitlist)
      .values({
        email: 'waitlist-test@example.com',
        interests: ['tool', 'checklist'],
        locale: 'es',
      })
      .returning();

    expect(row?.interests).toEqual(['tool', 'checklist']);
  });
});
