'use server';

import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { quoteRequests } from '@/db/schema';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/routing';
import { sendEmail } from '@/lib/email/client';
import { QuoteInternalEmail } from '@/lib/email/internal-templates';
import { QuoteConfirmationEmail } from '@/lib/email/templates';
import { quoteFormSchema, type QuoteFormValues } from '@/schemas/forms';
import { guardSubmission } from './guard';
import type { ActionResult } from './types';

/** Formulario de propuesta (multi-paso en cliente; aquí llega ya completo). Mismo flujo que contact.tsx. */
export async function submitQuote(values: QuoteFormValues, locale: Locale): Promise<ActionResult> {
  const guard = await guardSubmission({
    website: values.website,
    turnstileToken: values.turnstileToken,
    action: 'quote',
    limiterConfig: { requests: 3, window: '10 m' },
  });
  if (!guard.ok) return guard.result;

  const parsed = quoteFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, company, projectType, services, budgetRange, timeline, description } =
    parsed.data;

  try {
    const userAgent = (await headers()).get('user-agent')?.slice(0, 300);

    await db.insert(quoteRequests).values({
      name,
      email,
      company: company || null,
      projectType,
      services,
      budgetRange,
      timeline,
      description,
      locale,
      ipHash: guard.ipHash,
      userAgent,
      privacyConsentAt: new Date(),
    });
  } catch (error) {
    console.error('[quote] fallo al guardar la solicitud', error);
    return { ok: false, error: 'unknown' };
  }

  void sendEmail({
    to: siteConfig.contact.email,
    subject: `[Propuesta] ${name}`,
    react: (
      <QuoteInternalEmail
        name={name}
        email={email}
        company={company || undefined}
        projectType={projectType}
        services={services}
        budgetRange={budgetRange}
        timeline={timeline}
        description={description}
        locale={locale}
      />
    ),
  });

  const t = await getTranslations({ locale, namespace: 'emails' });
  void sendEmail({
    to: email,
    subject: t('quote.confirmationSubject'),
    react: (
      <QuoteConfirmationEmail
        greeting={t('quote.confirmationGreeting', { name })}
        body={t('quote.confirmationBody')}
        footer={t('quote.confirmationFooter')}
      />
    ),
  });

  return { ok: true };
}
