import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ComponentProps, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { hueClass, type Hue } from '@/config/hues';
import { pick } from '@/config/localized';
import { projectHues, type FeaturedProject } from '@/config/projects';
import { serviceHues, serviceIcons, type ServiceSlug } from '@/config/services';
import type { TeamMember } from '@/config/team';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * Línea de luz del tono en el borde superior de una tarjeta de vidrio (decorativa). Se apoya en el
 * `hue-*` del contenedor y no ocupa espacio.
 */
function HueEdge() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-h to-transparent opacity-70"
    />
  );
}

/** Tarjeta informativa con icono (principios, valores…). No es un enlace. Superficie sin blur. */
export function FeatureCard({
  icon,
  title,
  text,
  hue,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  hue?: Hue;
  className?: string;
}) {
  return (
    <Card className={cn('reveal flex flex-col gap-3', hue && hueClass[hue], className)}>
      <IconBadge icon={icon} />
      <h3 className="text-title">{title}</h3>
      <p className="text-body text-fg-muted">{text}</p>
    </Card>
  );
}

/**
 * Tarjeta de servicio (vidrio, con el color de su servicio). Patrón de «enlace extendido»: el enlace es
 * solo el título (los lectores de pantalla anuncian un nombre corto) y su ::after cubre toda la tarjeta
 * para que sea clicable entera. Respuesta en pointer-down (.press) y anillo de foco alrededor de toda la tarjeta.
 */
export function ServiceCard({
  slug,
  name,
  summary,
  className,
}: {
  slug: ServiceSlug;
  name: string;
  summary: string;
  className?: string;
}) {
  const t = useTranslations('common');
  const Icon = serviceIcons[slug];

  return (
    <article
      className={cn(
        hueClass[serviceHues[slug]],
        'reveal press group relative flex flex-col gap-3 rounded-lg material-regular p-(--pad-card) transition-[transform,background-color,border-color] duration-100 ease-out hover:border-h-line hover:bg-glass-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-(--focus-ring)',
        className,
      )}
    >
      <HueEdge />
      <IconBadge icon={Icon} />
      <h3 className="text-title">
        <Link
          href={{ pathname: '/services/[slug]', params: { slug } }}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
        >
          {name}
        </Link>
      </h3>
      <p className="text-body text-fg-muted">{summary}</p>
      <span
        aria-hidden
        className="mt-auto inline-flex items-center gap-1.5 pt-1 text-small font-medium text-h-fg"
      >
        {t('learnMore')}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}

export function ProjectCard({
  project,
  categoryLabel,
  className,
}: {
  project: FeaturedProject;
  categoryLabel: string;
  className?: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');

  return (
    <Card
      surface="glass"
      className={cn(
        'reveal relative flex flex-col gap-3',
        hueClass[projectHues[project.category]],
        className,
      )}
    >
      <HueEdge />
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="hue">{categoryLabel}</Badge>
        {project.placeholder && <Badge variant="placeholder">{t('example')}</Badge>}
      </div>
      <h3 className="text-title">{pick(project.title, locale)}</h3>
      <p className="text-body text-fg-muted">{pick(project.summary, locale)}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {project.tags.map((tag) => (
          <li key={tag}>
            <Badge>{tag}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Perfil de equipo con monograma (sin fotos por ahora). */
export function TeamCard({ member, className }: { member: TeamMember; className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');

  return (
    <Card className={cn('reveal flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden
          className="grid size-12 place-items-center rounded-full border border-h-line bg-h-tint font-mono text-lead text-h-fg"
        >
          {initials(member.name)}
        </span>
        {member.placeholder && <Badge variant="placeholder">{t('example')}</Badge>}
      </div>
      <div>
        <h3 className="text-title">{member.name}</h3>
        <p className="mt-0.5 text-small text-h-fg">{pick(member.role, locale)}</p>
      </div>
      <p className="text-body text-fg-muted">{pick(member.bio, locale)}</p>
    </Card>
  );
}

/**
 * Tarjeta de métrica: una cifra y su etiqueta. La cifra se pasa ya formateada. Las cifras de ejemplo
 * deben llevar `placeholder` (distintivo ámbar): nunca se muestran datos inventados como reales.
 */
export function MetricCard({
  label,
  value,
  hint,
  hue,
  placeholder,
  placeholderLabel,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  hue?: Hue;
  placeholder?: boolean;
  /** Texto del distintivo de ejemplo (p. ej. «Ejemplo»); obligatorio si `placeholder`. */
  placeholderLabel?: string;
  className?: string;
}) {
  return (
    <Card className={cn('flex flex-col gap-1', hue && hueClass[hue], className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-small text-fg-muted">{label}</p>
        {placeholder && placeholderLabel && <Badge variant="placeholder">{placeholderLabel}</Badge>}
      </div>
      <p className="font-mono text-h2 tracking-tight text-h-fg">{value}</p>
      {hint && <p className="text-label text-fg-subtle">{hint}</p>}
    </Card>
  );
}

/**
 * Tarjeta de artículo del blog: categoría (con su tono), título enlazado (enlace extendido), extracto y
 * metadatos. Presentacional: el contenido llega del capa de contenido (Fase 3).
 */
export function PostCard({
  href,
  title,
  excerpt,
  category,
  meta,
  hue = 'cyan',
  className,
}: {
  href: ComponentProps<typeof Link>['href'];
  title: string;
  excerpt: string;
  category: string;
  /** Fecha y tiempo de lectura, ya formateados. */
  meta: ReactNode;
  hue?: Hue;
  className?: string;
}) {
  return (
    <article
      className={cn(
        hueClass[hue],
        'press group relative flex flex-col gap-3 rounded-lg material-regular p-(--pad-card) transition-[transform,background-color,border-color] duration-100 ease-out hover:border-h-line hover:bg-glass-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-(--focus-ring)',
        className,
      )}
    >
      <HueEdge />
      <Badge variant="hue" className="self-start">
        {category}
      </Badge>
      <h3 className="text-title">
        <Link
          href={href}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
        >
          {title}
        </Link>
      </h3>
      <p className="text-body text-fg-muted">{excerpt}</p>
      <p className="mt-auto pt-1 text-label text-fg-subtle">{meta}</p>
    </article>
  );
}

/** Rejilla responsive de tarjetas: 1 columna en móvil, 2 en tablet, n en escritorio. */
export function CardGrid({
  columns = 3,
  children,
  className,
}: {
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-10 grid gap-3 sm:gap-4',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
