import { getMessages, getTranslations } from 'next-intl/server';
import { isServiceSlug, serviceHues, serviceSlugs } from '@/config/services';
import { routing, type Locale } from '@/i18n/routing';
import { renderOgImage } from '@/lib/og';
import { serviceContentSchema } from '@/schemas/page-content';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => serviceSlugs.map((slug) => ({ locale, slug })));
}

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  if (!isServiceSlug(slug)) {
    return renderOgImage({ eyebrow: t('eyebrow'), title: t('title'), tagline: t('eyebrow') });
  }

  const messages = await getMessages({ locale });
  const content = serviceContentSchema.parse(messages.services.items[slug]);
  return renderOgImage({
    eyebrow: t('eyebrow'),
    title: content.name,
    tagline: content.tagline,
    hue: serviceHues[slug],
  });
}
