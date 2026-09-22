import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { ComingSoon } from '@/components/sections/coming-soon';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

/** Provisional: la sección real llega en una fase posterior (ver docs/ARCHITECTURE.md). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('resources'),
    robots: { index: false, follow: true },
    alternates: buildAlternates(locale, '/resources'),
  };
}

export default function Page() {
  const t = useTranslations('nav');
  return <ComingSoon title={t('resources')} hue="blue" glow={['blue', 'amber']} />;
}
