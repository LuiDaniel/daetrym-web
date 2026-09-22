'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { CardGrid, ProjectCard } from '@/components/sections/cards';
import { CategoryFilter, type FilterOption } from '@/components/ui/category-filter';
import type { ProjectCategory } from '@/config/projects';
import type { Link } from '@/i18n/navigation';

export type ProjectListItem = {
  slug: string;
  href: ComponentProps<typeof Link>['href'];
  title: string;
  summary: string;
  category: ProjectCategory;
  categoryLabel: string;
  tags: string[];
  placeholder: boolean;
  /** Ruta local en /public (16:9); sin ella, la tarjeta muestra un degradado + icono. */
  image?: string;
  /** Enlace a una demo pública en vivo; si aparece, la tarjeta muestra un botón "Ver demo". */
  demoUrl?: string;
};

/** Índice de proyectos con filtro por categoría (Fase 3). Mismo patrón que `BlogList`. */
export function ProjectList({
  projects,
  categories,
  allLabel,
  filterLabel,
  emptyLabel,
}: {
  projects: ProjectListItem[];
  categories: FilterOption[];
  allLabel: string;
  filterLabel: string;
  emptyLabel: string;
}) {
  const [category, setCategory] = useState('all');
  const options: FilterOption[] = [{ value: 'all', label: allLabel }, ...categories];
  const filtered =
    category === 'all' ? projects : projects.filter((project) => project.category === category);

  return (
    <>
      <CategoryFilter
        value={category}
        onChange={setCategory}
        options={options}
        label={filterLabel}
        layoutId="project-filter"
      />
      {filtered.length === 0 ? (
        <p className="reveal mt-10 text-body text-fg-muted">{emptyLabel}</p>
      ) : (
        <CardGrid columns={3}>
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              href={project.href}
              category={project.category}
              categoryLabel={project.categoryLabel}
              title={project.title}
              summary={project.summary}
              tags={project.tags}
              placeholder={project.placeholder}
              image={project.image}
              demoUrl={project.demoUrl}
              className="reveal"
            />
          ))}
        </CardGrid>
      )}
    </>
  );
}
