'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { submitQuote } from '@/actions/quote';
import type { ActionResult } from '@/actions/types';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox';
import { Field, Input, Textarea } from '@/components/ui/field';
import { RadioCard, RadioField, RadioGroup } from '@/components/ui/radio-group';
import type { Locale } from '@/i18n/routing';
import { reducedFade, spring } from '@/styles/motion';
import {
  budgetRangeValues,
  projectTypeValues,
  quoteFormSchema,
  serviceValues,
  timelineValues,
  type QuoteFormValues,
} from '@/schemas/forms';
import { FormStatusBanner } from './form-status-banner';
import { HoneypotField } from './honeypot-field';
import { PrivacyConsentField } from './privacy-consent-field';
import { TurnstileField } from './turnstile-field';

const STEP_FIELDS: FieldPath<QuoteFormValues>[][] = [
  ['projectType', 'services'],
  ['budgetRange', 'timeline'],
  ['description'],
  ['name', 'email', 'company', 'privacyConsent'],
];
const STEP_COUNT = STEP_FIELDS.length;

export function QuoteWizard() {
  const t = useTranslations('quote');
  const tf = useTranslations('forms');
  const locale = useLocale() as Locale;
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    trigger,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: { services: [], turnstileToken: '' },
  });

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const outcome = await submitQuote(values, locale);
      setResult(outcome);
    });
  });

  const stepTransition = reduceMotion ? reducedFade : spring.default;
  const variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir * 24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : -dir * 24, opacity: 0 }),
  };

  if (result?.ok) {
    return <FormStatusBanner result={result} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <HoneypotField register={register} />

      <div aria-hidden className="mb-2 h-1 overflow-hidden rounded-full bg-glass">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
          transition={spring.default}
        />
      </div>
      <p className="mb-6 text-label text-fg-subtle">
        {t('stepLabel', { current: step + 1, total: STEP_COUNT })}
      </p>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            {step === 0 && (
              <fieldset className="flex flex-col gap-5">
                <legend className="mb-1 text-title">{t('steps.type.title')}</legend>
                <div>
                  <p className="mb-2 text-small font-medium text-fg">
                    {t('steps.type.projectType')}
                  </p>
                  <Controller
                    name="projectType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-2 sm:grid-cols-2"
                      >
                        {projectTypeValues.map((value) => (
                          <RadioCard
                            key={value}
                            id={`projectType-${value}`}
                            value={value}
                            label={t(`options.projectType.${value}`)}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.projectType && (
                    <p role="alert" className="mt-1.5 text-label text-danger">
                      {tf('validation.selectOne')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-small font-medium text-fg">{t('steps.type.services')}</p>
                  <Controller
                    name="services"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {serviceValues.map((value) => (
                          <CheckboxField
                            key={value}
                            id={`services-${value}`}
                            checked={field.value?.includes(value) ?? false}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              field.onChange(
                                checked ? [...current, value] : current.filter((v) => v !== value),
                              );
                            }}
                            label={t(`options.projectType.${value}`)}
                          />
                        ))}
                      </div>
                    )}
                  />
                  {errors.services && (
                    <p role="alert" className="mt-1.5 text-label text-danger">
                      {tf('validation.selectOne')}
                    </p>
                  )}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="flex flex-col gap-5">
                <legend className="mb-1 text-title">{t('steps.scope.title')}</legend>
                <div>
                  <p className="mb-2 text-small font-medium text-fg">
                    {t('steps.scope.budgetRange')}
                  </p>
                  <Controller
                    name="budgetRange"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col gap-2"
                      >
                        {budgetRangeValues.map((value) => (
                          <RadioField
                            key={value}
                            id={`budgetRange-${value}`}
                            value={value}
                            label={t(`options.budgetRange.${value}`)}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  <p className="mt-2 text-label text-fg-subtle">{t('budgetHint')}</p>
                  {errors.budgetRange && (
                    <p role="alert" className="mt-1.5 text-label text-danger">
                      {tf('validation.selectOne')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-small font-medium text-fg">{t('steps.scope.timeline')}</p>
                  <Controller
                    name="timeline"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col gap-2"
                      >
                        {timelineValues.map((value) => (
                          <RadioField
                            key={value}
                            id={`timeline-${value}`}
                            value={value}
                            label={t(`options.timeline.${value}`)}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.timeline && (
                    <p role="alert" className="mt-1.5 text-label text-danger">
                      {tf('validation.selectOne')}
                    </p>
                  )}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-3 text-title">{t('steps.description.title')}</legend>
                <Field
                  id="description"
                  label={tf('fields.description')}
                  hint={t('steps.description.hint')}
                  error={errors.description && tf('validation.tooShort', { min: 20 })}
                >
                  <Textarea id="description" rows={8} {...register('description')} />
                </Field>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="flex flex-col gap-4">
                <legend className="mb-1 text-title">{t('steps.contact.title')}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="name"
                    label={tf('fields.name')}
                    error={errors.name && tf('validation.required')}
                  >
                    <Input id="name" autoComplete="name" {...register('name')} />
                  </Field>
                  <Field
                    id="email"
                    label={tf('fields.email')}
                    error={errors.email && tf('validation.invalidEmail')}
                  >
                    <Input id="email" type="email" autoComplete="email" {...register('email')} />
                  </Field>
                </div>
                <Field id="company" label={tf('fields.companyOptional')}>
                  <Input id="company" autoComplete="organization" {...register('company')} />
                </Field>
                <PrivacyConsentField
                  control={control}
                  error={errors.privacyConsent && 'required'}
                />
                <TurnstileField
                  onToken={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
                  error={errors.turnstileToken && tf('turnstile.error')}
                />
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <FormStatusBanner result={result} />

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={goBack} disabled={pending}>
            {t('back')}
          </Button>
        ) : (
          <span />
        )}
        {step < STEP_COUNT - 1 ? (
          <Button type="button" onClick={goNext}>
            {t('next')}
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? tf('submitting') : tf('submit')}
          </Button>
        )}
      </div>
    </form>
  );
}
