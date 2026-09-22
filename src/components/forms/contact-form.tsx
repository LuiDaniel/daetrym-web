'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { submitContact } from '@/actions/contact';
import type { ActionResult } from '@/actions/types';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import type { Locale } from '@/i18n/routing';
import { contactFormSchema, type ContactFormValues } from '@/schemas/forms';
import { FormStatusBanner } from './form-status-banner';
import { HoneypotField } from './honeypot-field';
import { PrivacyConsentField } from './privacy-consent-field';
import { TurnstileField } from './turnstile-field';

export function ContactForm() {
  const t = useTranslations('forms');
  const locale = useLocale() as Locale;
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { turnstileToken: '' },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const outcome = await submitContact(values, locale);
      setResult(outcome);
      if (outcome.ok) reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <HoneypotField register={register} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label={t('fields.name')} error={errors.name && t('validation.required')}>
          <Input id="name" autoComplete="name" {...register('name')} />
        </Field>
        <Field
          id="email"
          label={t('fields.email')}
          error={errors.email && t('validation.invalidEmail')}
        >
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </Field>
      </div>
      <Field id="company" label={t('fields.companyOptional')}>
        <Input id="company" autoComplete="organization" {...register('company')} />
      </Field>
      <Field
        id="subject"
        label={t('fields.subject')}
        error={errors.subject && t('validation.required')}
      >
        <Input id="subject" {...register('subject')} />
      </Field>
      <Field
        id="message"
        label={t('fields.message')}
        error={errors.message && t('validation.tooShort', { min: 10 })}
      >
        <Textarea id="message" rows={6} {...register('message')} />
      </Field>
      <PrivacyConsentField control={control} error={errors.privacyConsent && 'required'} />
      <TurnstileField
        onToken={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
        error={errors.turnstileToken && t('turnstile.error')}
      />
      <FormStatusBanner result={result} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
