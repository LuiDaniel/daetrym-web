import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { verifyDownloadToken } from '@/lib/security/download-token';

/**
 * Descarga de la checklist (lead magnet): el token viene del email de bienvenida, ya firmado y con
 * vida corta (1 h) — ver lib/security/download-token.ts. El PDF/documento NO vive en /public
 * (docs/ARCHITECTURE.md §3): esta ruta es el único camino para llegar a él, y solo tras confirmar el
 * email (se revalida contra la fila real, no solo la firma del token).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'missing_token' }, { status: 400 });

  const { valid, email } = verifyDownloadToken(token);
  if (!valid || !email) {
    return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 403 });
  }

  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, email),
  });
  if (!subscriber || subscriber.status !== 'confirmed') {
    return NextResponse.json({ error: 'not_confirmed' }, { status: 403 });
  }

  const locale = subscriber.locale === 'en' ? 'en' : 'es';
  const filePath = path.join(
    process.cwd(),
    'content',
    'resources',
    `web-security-checklist.${locale}.md`,
  );

  try {
    const file = await readFile(filePath, 'utf8');
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="web-security-checklist.${locale}.md"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[resources/download] no se pudo leer el archivo', error);
    return NextResponse.json({ error: 'file_not_found' }, { status: 404 });
  }
}
