import { getTranslations } from 'next-intl/server';
import { projectHues } from '@/config/projects';
import type { Locale } from '@/i18n/routing';
import { getProject } from '@/lib/content/projects';
import { renderOgImage } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const project = getProject(locale, slug);
  const t = await getTranslations({ locale, namespace: 'projects' });
  const tagline = await getTranslations({ locale, namespace: 'home.hero' });

  return renderOgImage({
    eyebrow: project ? t(`categories.${project.frontmatter.category}`) : t('eyebrow'),
    title: project?.frontmatter.title ?? t('title'),
    tagline: tagline('eyebrow'),
    hue: project ? projectHues[project.frontmatter.category] : 'violet',
  });
}
