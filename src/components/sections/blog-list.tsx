'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { CardGrid, PostCard } from '@/components/sections/cards';
import { CategoryFilter, type FilterOption } from '@/components/ui/category-filter';
import type { Hue } from '@/config/hues';
import type { Link } from '@/i18n/navigation';

export type BlogListItem = {
  slug: string;
  href: ComponentProps<typeof Link>['href'];
  title: string;
  excerpt: string;
  /** Valor interno de la categoría (para filtrar), no el texto ya traducido. */
  category: string;
  categoryLabel: string;
  meta: string;
  hue: Hue;
};

/**
 * Índice del blog con filtro por categoría (Fase 3). El filtrado es en cliente: la lista de posts es
 * pequeña y ya llega resuelta al idioma actual desde el Server Component que la envuelve, así que no
 * hace falta una petición nueva por cada cambio de filtro.
 */
export function BlogList({
  posts,
  categories,
  allLabel,
  filterLabel,
  emptyLabel,
}: {
  posts: BlogListItem[];
  categories: FilterOption[];
  allLabel: string;
  filterLabel: string;
  emptyLabel: string;
}) {
  const [category, setCategory] = useState('all');
  const options: FilterOption[] = [{ value: 'all', label: allLabel }, ...categories];
  const filtered = category === 'all' ? posts : posts.filter((post) => post.category === category);

  return (
    <>
      <CategoryFilter
        value={category}
        onChange={setCategory}
        options={options}
        label={filterLabel}
        layoutId="blog-filter"
      />
      {filtered.length === 0 ? (
        <p className="reveal mt-10 text-body text-fg-muted">{emptyLabel}</p>
      ) : (
        <CardGrid columns={3}>
          {filtered.map((post) => (
            <PostCard
              key={post.slug}
              href={post.href}
              title={post.title}
              excerpt={post.excerpt}
              category={post.categoryLabel}
              meta={post.meta}
              hue={post.hue}
              className="reveal"
            />
          ))}
        </CardGrid>
      )}
    </>
  );
}
