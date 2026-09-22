import { headers } from 'next/headers';
import { env } from '@/env';

/**
 * Analítica sin cookies (D3): oculta por defecto — sin `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL`/
 * `_WEBSITE_ID` no renderiza nada, así que desarrollar no exige ninguna cuenta. Pensado para Umami
 * (`data-website-id`, ver https://umami.is/docs/tracker-configuration): con una cuenta de Umami cloud
 * o autoalojado, `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL` es la URL de `script.js` y
 * `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` el UUID del sitio.
 *
 * Para usar Plausible en su lugar: cambiar el atributo `data-website-id` por `data-domain` (con el
 * dominio del sitio, no un id) y la URL del script por la de Plausible — el resto (nonce, nada de
 * cookies, un solo componente detrás de una variable de entorno) no cambia.
 *
 * El origen del script se añade a `connect-src` en la CSP desde `src/proxy.ts` (se calcula del propio
 * valor de la variable de entorno, no está fijado de antemano — a diferencia de Turnstile, cuyo
 * origen SÍ es siempre el mismo).
 */
export async function Analytics() {
  if (!env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL || !env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID) return null;

  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <script
      defer
      nonce={nonce}
      src={env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL}
      data-website-id={env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID}
    />
  );
}
