'use server';

import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { waitlist } from '@/db/schema';
import type { Locale } from '@/i18n/routing';
import { sendEmail } from '@/lib/email/client';
import { WaitlistConfirmationEmail } from '@/lib/email/templates';
import { waitlistFormSchema, type WaitlistFormValues } from '@/schemas/forms';
import { guardSubmission } from './guard';
import type { ActionResult } from './types';

/**
 * Lista de espera de la Home («Próximamente»): sin double opt-in (D7 — no es una lista de correo con
 * envíos periódicos, solo una intención de contacto puntual), pero con el mismo honeypot/Turnstile/
 * límite de envíos que el resto de formularios.
 */
export async function joinWaitlist(
  values: WaitlistFormValues,
  locale: Locale,
): Promise<ActionResult> {
  const guard = await guardSubmission({
    website: values.website,
    turnstileToken: values.turnstileToken,
    action: 'waitlist',
    limiterConfig: { requests: 5, window: '10 m' },
  });
  if (!guard.ok) return guard.result;

  const parsed = waitlistFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, interests } = parsed.data;

  try {
    const existing = await db.query.waitlist.findFirst({ where: eq(waitlist.email, email) });
    if (existing) {
      // Combina los intereses en vez de duplicar la fila (email es único).
      const merged = Array.from(new Set([...existing.interests, ...interests]));
      await db
        .update(waitlist)
        .set({ interests: merged, locale })
        .where(eq(waitlist.id, existing.id));
    } else {
      await db.insert(waitlist).values({ email, interests, locale });
    }
  } catch (error) {
    console.error('[waitlist] fallo al guardar', error);
    return { ok: false, error: 'unknown' };
  }

  const t = await getTranslations({ locale, namespace: 'emails' });
  void sendEmail({
    to: email,
    subject: t('waitlist.confirmationSubject'),
    react: (
      <WaitlistConfirmationEmail
        greeting={t('waitlist.confirmationGreeting')}
        body={t('waitlist.confirmationBody')}
      />
    ),
  });

  return { ok: true };
}
