'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { joinWaitlist } from '@/actions/waitlist';
import type { ActionResult } from '@/actions/types';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/field';
import type { Locale } from '@/i18n/routing';
import {
  waitlistFormSchema,
  waitlistInterestValues,
  type WaitlistFormValues,
} from '@/schemas/forms';
import { FormStatusBanner } from './form-status-banner';
import { HoneypotField } from './honeypot-field';
import { TurnstileField } from './turnstile-field';

/**
 * Lista de espera de la Home. Turnstile solo se activa tras la primera interacción con el email
 * (`turnstileActive`): esta sección no es una página dedicada a un formulario, así que no carga el
 * script de Cloudflare en cada visita a la Home (docs/ARCHITECTURE.md §7, riesgo 4).
 */
export function WaitlistForm({ interestLabels }: { interestLabels: Record<string, string> }) {
  const t = useTranslations('forms');
  const th = useTranslations('home');
  const locale = useLocale() as Locale;
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [turnstileActive, setTurnstileActive] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: { interests: [], turnstileToken: '' },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const outcome = await joinWaitlist(values, locale);
      setResult(outcome);
      if (outcome.ok) reset();
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <HoneypotField register={register} />
      <div>
        <p className="mb-2 text-small font-medium text-fg">{th('soon.interestsLabel')}</p>
        <Controller
          name="interests"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {waitlistInterestValues.map((value) => (
                <CheckboxField
                  key={value}
                  id={`waitlist-interest-${value}`}
                  checked={field.value?.includes(value) ?? false}
                  onCheckedChange={(checked) => {
                    const current = field.value ?? [];
                    field.onChange(
                      checked ? [...current, value] : current.filter((v) => v !== value),
                    );
                  }}
                  label={interestLabels[value]}
                />
              ))}
            </div>
          )}
        />
        {errors.interests && (
          <p role="alert" className="mt-1.5 text-label text-danger">
            {t('validation.selectOne')}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label htmlFor="waitlist-email" className="sr-only">
            {t('fields.email')}
          </label>
          <Input
            id="waitlist-email"
            type="email"
            autoComplete="email"
            placeholder={t('fields.email')}
            onFocus={() => setTurnstileActive(true)}
            {...register('email')}
          />
          {errors.email && (
            <p role="alert" className="mt-1.5 text-label text-danger">
              {t('validation.invalidEmail')}
            </p>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? t('submitting') : th('soon.submit')}
        </Button>
      </div>
      <TurnstileField
        active={turnstileActive}
        onToken={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
        error={errors.turnstileToken && t('turnstile.error')}
      />
      <FormStatusBanner result={result} />
    </form>
  );
}
