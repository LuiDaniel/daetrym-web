import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getPost } from '@/lib/content/blog';
import { renderOgImage } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tagline = await getTranslations({ locale, namespace: 'home.hero' });
  const hue = post?.frontmatter.category === 'cybersecurity' ? 'green' : 'cyan';

  return renderOgImage({
    eyebrow: post ? t(`categories.${post.frontmatter.category}`) : t('eyebrow'),
    title: post?.frontmatter.title ?? t('title'),
    tagline: tagline('eyebrow'),
    hue,
  });
}
