'use server';

import { getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { headers } from 'next/headers';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/routing';
import { sendEmail } from '@/lib/email/client';
import { ContactInternalEmail } from '@/lib/email/internal-templates';
import { ContactConfirmationEmail } from '@/lib/email/templates';
import { contactFormSchema, type ContactFormValues } from '@/schemas/forms';
import { guardSubmission } from './guard';
import type { ActionResult } from './types';

/**
 * Formulario de contacto: honeypot → Turnstile → límite de envíos → Zod (de nuevo, nunca se confía
 * en el cliente) → Drizzle → dos emails (aviso interno + confirmación al usuario). Ver
 * docs/ARCHITECTURE.md §3. Nunca lanza ni devuelve detalles internos (mensaje de error de Postgres,
 * stack…) — ver node_modules/next/dist/docs/01-app/02-guides/server-actions.md § Security.
 */
export async function submitContact(
  values: ContactFormValues,
  locale: Locale,
): Promise<ActionResult> {
  const guard = await guardSubmission({
    website: values.website,
    turnstileToken: values.turnstileToken,
    action: 'contact',
    // Formulario que dispara dos emails: más estricto que la lista de espera.
    limiterConfig: { requests: 3, window: '10 m' },
  });
  if (!guard.ok) return guard.result;

  const parsed = contactFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, company, subject, message } = parsed.data;

  try {
    const userAgent = (await headers()).get('user-agent')?.slice(0, 300);

    await db.insert(contactMessages).values({
      name,
      email,
      company: company || null,
      subject,
      message,
      locale,
      ipHash: guard.ipHash,
      userAgent,
      privacyConsentAt: new Date(),
    });
  } catch (error) {
    console.error('[contact] fallo al guardar el mensaje', error);
    return { ok: false, error: 'unknown' };
  }

  // Los emails son una mejora de la experiencia, no la operación crítica: la fila ya se guardó, así
  // que un fallo de envío se registra pero no hace fracasar la acción para quien la envió.
  void sendEmail({
    to: siteConfig.contact.email,
    subject: `[Contacto] ${subject}`,
    react: (
      <ContactInternalEmail
        name={name}
        email={email}
        company={company || undefined}
        subject={subject}
        message={message}
        locale={locale}
      />
    ),
  });

  const t = await getTranslations({ locale, namespace: 'emails' });
  void sendEmail({
    to: email,
    subject: t('contact.confirmationSubject'),
    react: (
      <ContactConfirmationEmail
        greeting={t('contact.confirmationGreeting', { name })}
        body={t('contact.confirmationBody')}
        footer={t('contact.confirmationFooter')}
      />
    ),
  });

  return { ok: true };
}
