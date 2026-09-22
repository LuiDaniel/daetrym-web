'use server';

import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { env } from '@/env';
import type { Locale } from '@/i18n/routing';
import { sendEmail } from '@/lib/email/client';
import { NewsletterConfirmEmail, NewsletterWelcomeEmail } from '@/lib/email/templates';
import { createDownloadToken } from '@/lib/security/download-token';
import { createUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/security/newsletter-token';
import { generateToken, hashToken } from '@/lib/security/tokens';
import { newsletterFormSchema, type NewsletterFormValues } from '@/schemas/forms';
import { guardSubmission } from './guard';
import type { ActionResult } from './types';

const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;

function siteUrl(locale: Locale, pathname: string, query: Record<string, string>) {
  const url = new URL(`/${locale}${pathname}`, env.NEXT_PUBLIC_SITE_URL);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return url.toString();
}

async function sendWelcomeEmail(subscriber: { email: string; locale: Locale; source: string }) {
  const t = await getTranslations({ locale: subscriber.locale, namespace: 'emails' });
  const unsubscribeUrl = siteUrl(subscriber.locale, '/newsletter/unsubscribe', {
    token: createUnsubscribeToken(subscriber.email),
  });
  const downloadUrl =
    subscriber.source === 'checklist'
      ? siteUrl(subscriber.locale, '/api/resources/download', {
          token: createDownloadToken(subscriber.email),
        })
      : undefined;

  await sendEmail({
    to: subscriber.email,
    subject: t('newsletter.welcomeSubject'),
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    react: (
      <NewsletterWelcomeEmail
        greeting={t('newsletter.welcomeGreeting')}
        body={downloadUrl ? t('newsletter.welcomeBodyChecklist') : t('newsletter.welcomeBody')}
        downloadUrl={downloadUrl}
        downloadButtonLabel={t('newsletter.welcomeDownloadButton')}
        downloadExpiry={t('newsletter.welcomeDownloadExpiry')}
        unsubscribeFooter={t('newsletter.unsubscribeFooter')}
        unsubscribeLabel={t('newsletter.unsubscribeLink')}
        unsubscribeUrl={unsubscribeUrl}
      />
    ),
  });
}

/** Alta con double opt-in: guarda `pending` y envía el email de confirmación (nunca confirma aquí). */
export async function subscribeNewsletter(
  values: NewsletterFormValues,
  locale: Locale,
): Promise<ActionResult> {
  const guard = await guardSubmission({
    website: values.website,
    turnstileToken: values.turnstileToken,
    action: 'newsletter',
    limiterConfig: { requests: 5, window: '10 m' },
  });
  if (!guard.ok) return guard.result;

  const parsed = newsletterFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: 'validation', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, source } = parsed.data;

  try {
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email),
    });

    if (existing?.status === 'confirmed') {
      // Ya confirmado: no hay nada que reconfirmar. Si ahora pide el recurso descargable, se le
      // reenvía el email de bienvenida con un enlace de descarga nuevo; si no, éxito silencioso.
      if (source === 'checklist') {
        await sendWelcomeEmail({ email, locale, source });
      }
      return { ok: true };
    }

    const rawConfirmToken = generateToken();
    const confirmExpiresAt = new Date(Date.now() + CONFIRM_TTL_MS);

    if (existing) {
      await db
        .update(newsletterSubscribers)
        .set({
          locale,
          source,
          confirmTokenHash: hashToken(rawConfirmToken),
          confirmExpiresAt,
          marketingConsent: true,
        })
        .where(eq(newsletterSubscribers.id, existing.id));
    } else {
      await db.insert(newsletterSubscribers).values({
        email,
        locale,
        source,
        status: 'pending',
        confirmTokenHash: hashToken(rawConfirmToken),
        confirmExpiresAt,
        marketingConsent: true,
      });
    }

    const t = await getTranslations({ locale, namespace: 'emails' });
    void sendEmail({
      to: email,
      subject: t('newsletter.confirmSubject'),
      react: (
        <NewsletterConfirmEmail
          greeting={t('newsletter.confirmGreeting')}
          body={t('newsletter.confirmBody')}
          buttonLabel={t('newsletter.confirmButton')}
          confirmUrl={siteUrl(locale, '/newsletter/confirm', { token: rawConfirmToken })}
          expiry={t('newsletter.confirmExpiry')}
        />
      ),
    });

    return { ok: true };
  } catch (error) {
    console.error('[newsletter] fallo al suscribir', error);
    return { ok: false, error: 'unknown' };
  }
}

/**
 * Confirmación (paso POST del double opt-in, docs/ARCHITECTURE.md §3 — el GET solo abre la página
 * con el botón, nunca confirma solo, para que un escáner de correo no confirme por accidente).
 */
export async function confirmNewsletter(token: string, locale: Locale) {
  const tokenHash = hashToken(token);
  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.confirmTokenHash, tokenHash),
  });

  if (
    !subscriber ||
    !subscriber.confirmExpiresAt ||
    subscriber.confirmExpiresAt.getTime() < Date.now()
  ) {
    redirect(`/${locale}/newsletter/confirm?status=invalid`);
  }
  if (subscriber.status === 'confirmed') {
    redirect(`/${locale}/newsletter/confirm?status=already`);
  }

  await db
    .update(newsletterSubscribers)
    .set({ status: 'confirmed', confirmedAt: new Date(), confirmTokenHash: null })
    .where(eq(newsletterSubscribers.id, subscriber.id));

  await sendWelcomeEmail({
    email: subscriber.email,
    locale: subscriber.locale as Locale,
    source: subscriber.source,
  });

  redirect(`/${locale}/newsletter/confirm?status=success`);
}

/**
 * Baja en un clic (RFC 8058: enlace directo, sin necesidad de iniciar sesión). Al darse de baja se
 * limpian los campos no esenciales de la fila (política de retención "mínimo para no reenviar",
 * docs/ARCHITECTURE.md §3) en vez de esperar al cron: es el propio evento el que la dispara.
 */
export async function unsubscribeNewsletter(token: string, locale: Locale) {
  const { valid, email } = verifyUnsubscribeToken(token);
  if (!valid || !email) {
    redirect(`/${locale}/newsletter/unsubscribe?status=invalid`);
  }

  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, email),
  });
  if (!subscriber) {
    redirect(`/${locale}/newsletter/unsubscribe?status=invalid`);
  }
  if (subscriber.status === 'unsubscribed') {
    redirect(`/${locale}/newsletter/unsubscribe?status=already`);
  }

  await db
    .update(newsletterSubscribers)
    .set({
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
      confirmTokenHash: null,
      marketingConsent: false,
    })
    .where(eq(newsletterSubscribers.id, subscriber.id));

  redirect(`/${locale}/newsletter/unsubscribe?status=success`);
}
