import { and, eq, lt } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contactMessages, newsletterSubscribers, quoteRequests } from '@/db/schema';
import { env } from '@/env';

const DAY_MS = 24 * 60 * 60 * 1000;
const SPAM_RETENTION_MS = 30 * DAY_MS;
const LEAD_RETENTION_MS = 24 * 30 * DAY_MS; // 24 meses (~30 días/mes, igual que docs/ARCHITECTURE.md §3)

/**
 * Retención de datos (docs/ARCHITECTURE.md §3), protegida con `CRON_SECRET` (convención de Vercel
 * Cron: cabecera `Authorization: Bearer <secreto>`). Calculado en JS, no con `now() - interval` en
 * SQL, para que se comporte igual con el motor embebido de desarrollo y con Neon en producción.
 * La baja del newsletter limpia sus propios campos en el momento (src/actions/newsletter.tsx); este
 * cron no necesita tocar esa tabla para ese caso.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const spamCutoff = new Date(now - SPAM_RETENTION_MS);
  const leadCutoff = new Date(now - LEAD_RETENTION_MS);

  const [expiredPending, spamContacts, staleContacts, spamQuotes, staleQuotes] = await Promise.all([
    db
      .delete(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.status, 'pending'),
          lt(newsletterSubscribers.confirmExpiresAt, new Date(now)),
        ),
      )
      .returning({ id: newsletterSubscribers.id }),
    db
      .delete(contactMessages)
      .where(and(eq(contactMessages.status, 'spam'), lt(contactMessages.updatedAt, spamCutoff)))
      .returning({ id: contactMessages.id }),
    db
      .delete(contactMessages)
      .where(lt(contactMessages.updatedAt, leadCutoff))
      .returning({ id: contactMessages.id }),
    db
      .delete(quoteRequests)
      .where(and(eq(quoteRequests.status, 'spam'), lt(quoteRequests.updatedAt, spamCutoff)))
      .returning({ id: quoteRequests.id }),
    db
      .delete(quoteRequests)
      .where(lt(quoteRequests.updatedAt, leadCutoff))
      .returning({ id: quoteRequests.id }),
  ]);

  const summary = {
    expiredPendingSubscribers: expiredPending.length,
    spamContacts: spamContacts.length,
    staleContacts: staleContacts.length,
    spamQuotes: spamQuotes.length,
    staleQuotes: staleQuotes.length,
  };

  console.info('[cron:retention] limpieza completada', summary);
  return NextResponse.json({ ok: true, ...summary });
}
