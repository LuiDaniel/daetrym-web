'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Link } from '@/i18n/navigation';

/**
 * Error inesperado (500). No muestra detalles internos: solo el `digest` que Next genera, para poder
 * localizar el fallo en los logs del servidor sin exponer nada al visitante.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.error');

  useEffect(() => {
    // Sin datos personales: solo el identificador del error.
    console.error('Error de página', error.digest ?? 'sin-digest');
  }, [error]);

  return (
    <section aria-labelledby="page-title" className="container-page page-top pb-24">
      <div className="max-w-2xl">
        <Eyebrow>{t('code')}</Eyebrow>
        <h1 id="page-title" className="mt-4 text-h1">
          {t('title')}
        </h1>
        <p className="mt-5 text-lead text-fg-muted">{t('body')}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" onClick={reset}>
            {t('retry')}
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">{t('home')}</Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-8 font-mono text-small text-fg-subtle">
            {t('reference', { digest: error.digest })}
          </p>
        )}
      </div>
    </section>
  );
}
