'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { env } from '@/env';
import { useTheme } from '@/lib/use-theme';

/**
 * Widget de Turnstile: el `sitekey` público va en `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (en desarrollo,
 * por defecto, la clave de pruebas de Cloudflare — ver env.ts). `active=false` no monta el widget
 * (ni carga su script): en la lista de espera de la Home, que no es una página dedicada a un
 * formulario, solo se activa tras la primera interacción, para no cargarlo en cada visita a la Home
 * (docs/ARCHITECTURE.md §7, riesgo 4). En páginas dedicadas (contacto, propuesta, recursos) se monta
 * directamente: visitarlas ya es la interacción que lo justifica.
 *
 * `options.theme` sigue el tema DEL SITIO (`useTheme`, el mismo `data-theme` que usa `ThemeToggle`),
 * no `'auto'` (que respeta el tema del SISTEMA OPERATIVO): el sitio tiene su propio selector,
 * independiente del SO, así que 'auto' podía mostrar el widget claro con el sitio en oscuro o
 * viceversa — un recuadro blanco muy llamativo sobre el vidrio oscuro. Se lee una sola vez al montar
 * el widget (no hay una forma soportada de cambiarle el tema en caliente sin volver a montarlo).
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
  const theme = useTheme();

  if (!active) return null;

  return (
    <div>
      <span className="sr-only">{t('turnstile.label')}</span>
      <Turnstile
        siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        options={{ theme, size: 'flexible' }}
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
