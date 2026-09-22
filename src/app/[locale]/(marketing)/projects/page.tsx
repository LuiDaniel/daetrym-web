import type { Metadata } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { ProjectList, type ProjectListItem } from '@/components/sections/project-list';
import { Section } from '@/components/sections/section';
import type { FilterOption } from '@/components/ui/category-filter';
import { DraftNotice } from '@/components/ui/draft-notice';
import { projectCategories } from '@/schemas/content';
import type { Locale } from '@/i18n/routing';
import { getAllProjects } from '@/lib/content/projects';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/projects'),
  };
}

export default function ProjectsIndexPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('projects');
  const projects = getAllProjects(locale);
  const hasPlaceholder = projects.some((project) => project.frontmatter.placeholder);

  const items: ProjectListItem[] = projects.map((project) => ({
    slug: project.slug,
    href: { pathname: '/projects/[slug]', params: { slug: project.slug } },
    title: project.frontmatter.title,
    summary: project.frontmatter.summary,
    category: project.frontmatter.category,
    categoryLabel: t(`categories.${project.frontmatter.category}`),
    tags: project.frontmatter.tags,
    placeholder: project.frontmatter.placeholder,
  }));

  const categories: FilterOption[] = projectCategories.map((category) => ({
    value: category,
    label: t(`categories.${category}`),
  }));

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lead={t('lead')}
        hue="violet"
        glow={['violet', 'cyan']}
      />

      <Section labelledBy="projects-title" className="pt-0 sm:pt-0" hue="violet">
        <h2 id="projects-title" className="sr-only">
          {t('index.listTitle')}
        </h2>
        {hasPlaceholder && (
          <DraftNotice gated={false} className="mb-8 max-w-3xl">
            {t('notice')}
          </DraftNotice>
        )}
        <ProjectList
          projects={items}
          categories={categories}
          allLabel={t('filter.all')}
          filterLabel={t('filter.label')}
          emptyLabel={t('empty')}
        />
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
