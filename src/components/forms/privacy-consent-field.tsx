'use client';

import { useTranslations } from 'next-intl';
import { Controller, type Control, type FieldValues } from 'react-hook-form';
import { CheckboxField } from '@/components/ui/checkbox';
import { Link } from '@/i18n/navigation';

/**
 * Casilla de consentimiento (obligatoria) con enlace a la política de privacidad. `Checkbox` es de
 * Radix (un botón con `onCheckedChange`, no un `<input>` nativo con `onChange`), así que se conecta
 * con `Controller` en vez de `register()` — igual que cualquier `RadioGroup`/`Checkbox` del asistente
 * de propuesta.
 */
export function PrivacyConsentField<
  TFieldValues extends FieldValues & { privacyConsent?: boolean },
>({ control, error }: { control: Control<TFieldValues>; error?: string }) {
  const t = useTranslations('forms');

  return (
    <div>
      <Controller
        name={'privacyConsent' as never}
        control={control}
        render={({ field }) => (
          <CheckboxField
            id="privacyConsent"
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
            label={t.rich('privacyConsent', {
              link: (chunks) => (
                <Link href="/legal/privacy" className="underline hover:text-h-fg" target="_blank">
                  {chunks}
                </Link>
              ),
            })}
          />
        )}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-label text-danger">
          {t('validation.required')}
        </p>
      )}
    </div>
  );
}
