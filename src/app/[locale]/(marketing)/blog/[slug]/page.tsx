import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';
import { CardGrid, PostCard } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section, SectionHeader } from '@/components/sections/section';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { TableOfContents } from '@/components/ui/table-of-contents';
import { blogCategoryHues } from '@/config/blog';
import { blogSlugs, isBlogSlug } from '@/config/content-slugs';
import { routing, type Locale } from '@/i18n/routing';
import { getPost, getRelatedPosts, type BlogPost } from '@/lib/content/blog';
import { Mdx } from '@/lib/content/mdx';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => blogSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isBlogSlug(slug)) return {};
  const post = getPost(locale, slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: buildAlternates(locale, { pathname: '/blog/[slug]', params: { slug } }),
    openGraph: {
      type: 'article',
      publishedTime: post.frontmatter.date,
      tags: post.frontmatter.tags,
    },
  };
}

function formatDate(format: Awaited<ReturnType<typeof getFormatter>>, date: string) {
  return format.dateTime(new Date(`${date}T00:00:00Z`), { dateStyle: 'long', timeZone: 'UTC' });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isBlogSlug(slug)) notFound();
  const post = getPost(locale, slug);
  if (!post) notFound();

  const related = getRelatedPosts(locale, post);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const format = await getFormatter({ locale });
  const publishedLabel = `${formatDate(format, post.frontmatter.date)} · ${t('readingTime', { minutes: post.readingMinutes })}`;
  const hue = blogCategoryHues[post.frontmatter.category];

  return (
    <>
      <PageHero
        title={post.frontmatter.title}
        lead={post.frontmatter.description}
        hue={hue}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: t('detail.rootLabel'), href: '/blog' },
              { label: post.frontmatter.title },
            ]}
          />
        }
        footnote={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="hue">{t(`categories.${post.frontmatter.category}`)}</Badge>
            {post.frontmatter.placeholder && (
              <Badge variant="placeholder">{common('example')}</Badge>
            )}
            <p className="text-small text-fg-subtle">{publishedLabel}</p>
          </div>
        }
      />

      <Section labelledBy="page-title" className="pt-0 sm:pt-0" hue={hue}>
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <TableOfContents headings={post.headings} label={common('onThisPage')} />
          <div className="max-w-3xl min-w-0">
            <Mdx source={post.body} />
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="raised" labelledBy="related-title" hue={hue}>
          <SectionHeader id="related-title" title={t('relatedTitle')} />
          <CardGrid columns={related.length === 1 ? 2 : 3}>
            {related.map((item: BlogPost) => (
              <PostCard
                key={item.slug}
                href={{ pathname: '/blog/[slug]', params: { slug: item.slug } }}
                title={item.frontmatter.title}
                excerpt={item.frontmatter.description}
                category={t(`categories.${item.frontmatter.category}`)}
                categoryKey={item.frontmatter.category}
                meta={`${formatDate(format, item.frontmatter.date)} · ${t('readingTime', { minutes: item.readingMinutes })}`}
                hue={blogCategoryHues[item.frontmatter.category]}
                image={item.frontmatter.image}
                className="reveal"
              />
            ))}
          </CardGrid>
        </Section>
      )}

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
