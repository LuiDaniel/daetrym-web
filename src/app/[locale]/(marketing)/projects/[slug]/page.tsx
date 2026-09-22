import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { projectHues } from '@/config/projects';
import { isProjectSlug, projectSlugs } from '@/config/content-slugs';
import { routing, type Locale } from '@/i18n/routing';
import { getProject } from '@/lib/content/projects';
import { Mdx } from '@/lib/content/mdx';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projectSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isProjectSlug(slug)) return {};
  const project = getProject(locale, slug);
  if (!project) return {};
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
    alternates: buildAlternates(locale, { pathname: '/projects/[slug]', params: { slug } }),
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isProjectSlug(slug)) notFound();
  const project = getProject(locale, slug);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: 'projects' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const hue = projectHues[project.frontmatter.category];

  return (
    <>
      <PageHero
        title={project.frontmatter.title}
        lead={project.frontmatter.summary}
        hue={hue}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: t('detail.rootLabel'), href: '/projects' },
              { label: project.frontmatter.title },
            ]}
          />
        }
        footnote={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="hue">{t(`categories.${project.frontmatter.category}`)}</Badge>
            {project.frontmatter.placeholder && (
              <Badge variant="placeholder">{common('example')}</Badge>
            )}
            {project.frontmatter.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        }
      />

      <Section labelledBy="page-title" className="pt-0 sm:pt-0" hue={hue}>
        <div className="max-w-3xl">
          <Mdx source={project.body} />
        </div>
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
