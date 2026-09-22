import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { renderOgImage } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: Locale }> };

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tagline = await getTranslations({ locale, namespace: 'home.hero' });
  return renderOgImage({
    eyebrow: t('eyebrow'),
    title: t('title'),
    tagline: tagline('eyebrow'),
    hue: 'cyan',
  });
}
