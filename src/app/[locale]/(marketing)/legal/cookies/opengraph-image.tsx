import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { renderOgImage } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: Locale }> };

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: 'nav' });
  const t = await getTranslations({ locale, namespace: 'legal.cookies' });
  const tagline = await getTranslations({ locale, namespace: 'home.hero' });
  return renderOgImage({
    eyebrow: nav('cookies'),
    title: t('title'),
    tagline: tagline('eyebrow'),
    hue: 'amber',
  });
}
