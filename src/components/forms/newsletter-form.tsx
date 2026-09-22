'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { subscribeNewsletter } from '@/actions/newsletter';
import type { ActionResult } from '@/actions/types';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import type { Locale } from '@/i18n/routing';
import { newsletterFormSchema, type NewsletterFormValues } from '@/schemas/forms';
import { FormStatusBanner } from './form-status-banner';
import { HoneypotField } from './honeypot-field';
import { PrivacyConsentField } from './privacy-consent-field';
import { TurnstileField } from './turnstile-field';

/** Alta al newsletter con double opt-in. `source` distingue de dónde viene (pie de página, checklist, blog). */
export function NewsletterForm({ source }: { source: NewsletterFormValues['source'] }) {
  const t = useTranslations('forms');
  const tr = useTranslations('resources');
  const locale = useLocale() as Locale;
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: { source, turnstileToken: '' },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const outcome = await subscribeNewsletter(values, locale);
      setResult(outcome);
    });
  });

  if (result?.ok) {
    return (
      <Banner tone="success" title={tr('pending.title')} role="status">
        {tr('pending.body')}
      </Banner>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <HoneypotField register={register} />
      <Field
        id="newsletter-email"
        label={t('fields.email')}
        error={errors.email && t('validation.invalidEmail')}
      >
        <Input id="newsletter-email" type="email" autoComplete="email" {...register('email')} />
      </Field>
      <PrivacyConsentField control={control} error={errors.privacyConsent && 'required'} />
      <TurnstileField
        onToken={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
        error={errors.turnstileToken && t('turnstile.error')}
      />
      {result && !result.ok && <FormStatusBanner result={result} />}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t('submitting') : tr('form.submit')}
      </Button>
    </form>
  );
}
