'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import type { TurnstileProps } from '@marsidev/react-turnstile';
import { env } from '@/env';
import { useTheme } from '@/lib/use-theme';

/**
 * `@marsidev/react-turnstile` se importa con `import()` dentro de un `useEffect`, no con
 * `next/dynamic` a nivel de módulo. Se probó `next/dynamic` primero (el patrón documentado por Next
 * para librerías pesadas) y NO bastaba: el manifiesto de referencias de cliente de Next lista, para
 * cualquier página que renderice `TurnstileField`, todos los chunks que su árbol de componentes
 * cliente podría necesitar para la hidratación — incluidos los de `dynamic()` — sin poder saber en
 * build time que `active=false` nunca los monta; el chunk seguía llegando con `<script async>` en el
 * HTML de la Home (detectado en la auditoría Lighthouse de la Fase 6: 82 KiB sin usar). Disparar el
 * `import()` desde un efecto, en vez de declararlo a nivel de módulo, saca la carga del análisis
 * estático de ese manifiesto: solo se pide cuando `active` pasa a `true` en tiempo de ejecución.
 */
function useTurnstileComponent(active: boolean) {
  const [Component, setComponent] = useState<ComponentType<TurnstileProps> | null>(null);

  useEffect(() => {
    if (!active || Component) return;
    let cancelled = false;
    import('@marsidev/react-turnstile').then((mod) => {
      if (!cancelled) setComponent(() => mod.Turnstile);
    });
    return () => {
      cancelled = true;
    };
  }, [active, Component]);

  return Component;
}

/**
 * Widget de Turnstile: el `sitekey` público va en `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (en desarrollo,
 * por defecto, la clave de pruebas de Cloudflare — ver env.ts). `active=false` no monta el widget
 * (ni carga su script ni el JS del paquete, ver arriba): en la lista de espera de la Home, que no es
 * una página dedicada a un formulario, solo se activa tras la primera interacción, para no cargarlo en
 * cada visita a la Home (docs/ARCHITECTURE.md §7, riesgo 4). En páginas dedicadas (contacto, propuesta,
 * recursos) se monta directamente: visitarlas ya es la interacción que lo justifica.
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
  const Turnstile = useTurnstileComponent(active);

  if (!active || !Turnstile) return null;

  return (
    <div>
      <span className="sr-only">{t('turnstile.label')}</span>
      {/* eslint-disable-next-line react-hooks/static-components -- `Turnstile` es una referencia
          estable guardada en estado (`useTurnstileComponent`), no un componente nuevo por render: la
          regla no puede ver a través del hook y confunde la asignación con una definición inline. */}
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
