'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { env } from '@/env';

/**
 * Widget de Turnstile: el `sitekey` público va en `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (en desarrollo,
 * por defecto, la clave de pruebas de Cloudflare — ver env.ts). `active=false` no monta el widget
 * (ni carga su script): en la lista de espera de la Home, que no es una página dedicada a un
 * formulario, solo se activa tras la primera interacción, para no cargarlo en cada visita a la Home
 * (docs/ARCHITECTURE.md §7, riesgo 4). En páginas dedicadas (contacto, propuesta, recursos) se monta
 * directamente: visitarlas ya es la interacción que lo justifica.
 */
export function TurnstileField({
  active = true,
  onToken,
  error,
}: {
  active?: boolean;
  onToken: (token: string) => void;
  error?: string;
}) {
  const t = useTranslations('forms');

  if (!active) return null;

  return (
    <div>
      <span className="sr-only">{t('turnstile.label')}</span>
      <Turnstile
        siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        options={{ theme: 'auto', size: 'flexible' }}
        onSuccess={onToken}
        onExpire={() => onToken('')}
        onError={() => onToken('')}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-label text-danger">
          {t('turnstile.error')}
        </p>
      )}
    </div>
  );
}
