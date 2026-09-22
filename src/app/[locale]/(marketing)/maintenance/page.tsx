import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { SectionGlow } from '@/components/sections/section-glow';
import type { Locale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'maintenance' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

/** Se sirve con estado 503 desde src/proxy.ts cuando MAINTENANCE_MODE=true. */
export default function MaintenancePage() {
  const t = useTranslations('maintenance');

  return (
    <section
      aria-labelledby="page-title"
      // Le faltaba `.page-top`: sin él, el contenido queda parcialmente bajo el header flotante.
      className="hue-amber container-page page-top relative isolate flex min-h-[60dvh] flex-col items-start justify-center pb-24"
    >
      <SectionGlow hues={['amber', 'blue']} />
      <h1 id="page-title" className="text-h1">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-xl text-lead text-fg-muted">{t('description')}</p>
    </section>
  );
}
