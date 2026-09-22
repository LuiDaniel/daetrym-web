import type { Metadata } from 'next';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { BlogList, type BlogListItem } from '@/components/sections/blog-list';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { blogCategories } from '@/schemas/content';
import type { FilterOption } from '@/components/ui/category-filter';
import type { Locale } from '@/i18n/routing';
import { getAllPosts } from '@/lib/content/blog';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/blog'),
  };
}

const hueByCategory = { cybersecurity: 'green', engineering: 'cyan' } as const;

export default function BlogIndexPage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('blog');
  const format = useFormatter();
  const posts = getAllPosts(locale);

  const items: BlogListItem[] = posts.map((post) => ({
    slug: post.slug,
    href: { pathname: '/blog/[slug]', params: { slug: post.slug } },
    title: post.frontmatter.title,
    excerpt: post.frontmatter.description,
    category: post.frontmatter.category,
    categoryLabel: t(`categories.${post.frontmatter.category}`),
    meta: `${format.dateTime(new Date(`${post.frontmatter.date}T00:00:00Z`), { dateStyle: 'long', timeZone: 'UTC' })} · ${t('readingTime', { minutes: post.readingMinutes })}`,
    hue: hueByCategory[post.frontmatter.category],
  }));

  const categories: FilterOption[] = blogCategories.map((category) => ({
    value: category,
    label: t(`categories.${category}`),
  }));

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lead={t('lead')}
        hue="cyan"
        glow={['cyan', 'magenta']}
        footnote={
          <a
            href={`/${locale}/blog/feed.xml`}
            className="text-small text-fg-subtle hover:text-h-fg"
          >
            {t('rss')}
          </a>
        }
      />

      <Section labelledBy="posts-title" className="pt-0 sm:pt-0" hue="cyan">
        <h2 id="posts-title" className="sr-only">
          {t('index.listTitle')}
        </h2>
        <BlogList
          posts={items}
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
