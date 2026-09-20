'use client';

import { useEffect } from 'react';
import enErrors from '@/messages/en/errors.json';
import esErrors from '@/messages/es/errors.json';
import '@/styles/globals.css';

/**
 * Último recurso: se muestra cuando falla el layout raíz, así que no hay proveedor de idioma, header ni
 * fuentes. Por eso es bilingüe (español e inglés a la vez) y usa solo los tokens de diseño.
 * Igual que error.tsx: no expone detalles internos, solo el `digest` de Next (sin datos personales) para
 * poder relacionar un reporte con los logs del servidor.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error global', error.digest ?? 'sin-digest');
  }, [error]);

  const copies = [
    { lang: 'es', text: esErrors.errors.global },
    { lang: 'en', text: enErrors.errors.global },
  ] as const;

  return (
    <html lang="es" data-theme="dark">
      <body>
        <main className="container-page grid min-h-dvh place-items-center py-16">
          <div className="max-w-xl space-y-10">
            {copies.map(({ lang, text }) => (
              <section key={lang} lang={lang}>
                <h1 className="text-h2">{text.title}</h1>
                <p className="mt-3 text-lead text-fg-muted">{text.body}</p>
                {error.digest && (
                  <p className="mt-3 font-mono text-small text-fg-subtle">
                    {text.reference.replace('{digest}', error.digest)}
                  </p>
                )}
              </section>
            ))}
            <button
              type="button"
              onClick={reset}
              className="press inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 font-medium text-on-accent"
            >
              {esErrors.errors.global.retry} / {enErrors.errors.global.retry}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
