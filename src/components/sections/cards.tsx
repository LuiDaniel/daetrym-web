import { ArrowRight, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import type { ComponentProps, ReactNode } from 'react';
import { Badge, ThumbBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { blogCategoryIcons } from '@/config/blog';
import { hueClass, type Hue } from '@/config/hues';
import { pick } from '@/config/localized';
import { projectHues, projectIcons, type ProjectCategory } from '@/config/projects';
import { serviceHues, serviceIcons, type ServiceSlug } from '@/config/services';
import type { TeamMember } from '@/config/team';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import type { BlogCategory } from '@/schemas/content';

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

/**
 * Miniatura 16:9 de una tarjeta de proyecto/post: la imagen del frontmatter si existe, o si no un
 * degradado radial con los dos tonos de la categoría (`--h`/`--h-fg`, del `.hue-*` del contenedor) más un
 * icono de línea fina, para que nunca se vea vacía. Sangra hasta el borde de la tarjeta (compensa
 * `--pad-card` con margen negativo) y aloja, superpuestas, las etiquetas de categoría/ejemplo (arriba a
 * la izquierda) y el botón de demo (abajo a la derecha) — ambas en `ThumbBadge`/`material-thumb-badge`,
 * siempre oscuras, para leerse sobre cualquier imagen o degradado.
 */
function CardThumbnail({
  image,
  alt,
  icon: Icon,
  badges,
  demoUrl,
}: {
  image?: string;
  alt: string;
  icon: LucideIcon;
  badges: ReactNode;
  demoUrl?: string;
}) {
  const t = useTranslations('common');

  return (
    <div className="relative -mx-(--pad-card) -mt-(--pad-card) aspect-video overflow-hidden rounded-t-lg">
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-surface-3"
          style={{
            backgroundImage:
              'radial-gradient(120% 120% at 10% 0%, color-mix(in srgb, var(--h) 45%, transparent), transparent 65%), radial-gradient(120% 120% at 100% 100%, color-mix(in srgb, var(--h-fg) 35%, transparent), transparent 65%)',
          }}
        >
          <div className="grid size-full place-items-center">
            <Icon className="size-9 text-h-fg/70" strokeWidth={1.25} />
          </div>
        </div>
      )}
      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">{badges}</div>
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="press absolute right-2.5 bottom-2.5 z-10 inline-flex items-center gap-1.5 rounded-full border material-thumb-badge px-2.5 py-1 text-label font-medium text-thumb-fg"
        >
          {t('viewDemo')}
          <ExternalLink aria-hidden className="size-3" />
          <span className="sr-only">{`(${t('opensInNewTab')})`}</span>
        </a>
      )}
    </div>
  );
}

/** Tarjeta informativa con icono (principios, valores…). No es un enlace. Superficie sin blur. */
export function FeatureCard({
  icon,
  title,
  text,
  hue,
  surface,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  hue?: Hue;
  /** `glass` en bandas `tone="raised"`; `panel` (por defecto) en el resto. */
  surface?: 'panel' | 'glass';
  className?: string;
}) {
  return (
    <Card
      surface={surface}
      className={cn('reveal flex flex-col gap-3', hue && hueClass[hue], className)}
    >
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

/**
 * Tarjeta de proyecto: enlaza al caso completo (mismo patrón de «enlace extendido» que `ServiceCard`/
 * `PostCard`). El contenido ya llega resuelto al idioma actual (viene de /content vía
 * src/lib/content/projects.ts, no de un `Localized` que haya que `pick()`).
 */
export function ProjectCard({
  href,
  category,
  categoryLabel,
  title,
  summary,
  tags,
  image,
  demoUrl,
  placeholder,
  className,
}: {
  href: ComponentProps<typeof Link>['href'];
  category: ProjectCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  tags: string[];
  /** Ruta local en /public (16:9); sin ella, degradado + icono de la categoría. */
  image?: string;
  /** Enlace a una demo pública en vivo; si aparece, la miniatura muestra un botón "Ver demo". */
  demoUrl?: string;
  placeholder?: boolean;
  className?: string;
}) {
  const t = useTranslations('common');

  return (
    <article
      className={cn(
        hueClass[projectHues[category]],
        'press group relative flex flex-col gap-3 rounded-lg material-regular p-(--pad-card) transition-[transform,background-color,border-color] duration-100 ease-out hover:border-h-line hover:bg-glass-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-(--focus-ring)',
        className,
      )}
    >
      <CardThumbnail
        image={image}
        alt=""
        icon={projectIcons[category]}
        demoUrl={demoUrl}
        badges={
          <>
            <ThumbBadge variant="hue">{categoryLabel}</ThumbBadge>
            {placeholder && <ThumbBadge variant="placeholder">{t('example')}</ThumbBadge>}
          </>
        }
      />
      <h3 className="text-title">
        <Link
          href={href}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
        >
          {title}
        </Link>
      </h3>
      <p className="text-body text-fg-muted">{summary}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {tags.map((tag) => (
          <li key={tag}>
            <Badge>{tag}</Badge>
          </li>
        ))}
      </ul>
    </article>
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
export function TeamCard({
  member,
  surface,
  className,
}: {
  member: TeamMember;
  surface?: 'panel' | 'glass';
  className?: string;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations('common');

  return (
    <Card surface={surface} className={cn('reveal flex flex-col gap-3', className)}>
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
  categoryKey,
  meta,
  hue = 'cyan',
  image,
  className,
}: {
  href: ComponentProps<typeof Link>['href'];
  title: string;
  excerpt: string;
  /** Texto ya traducido de la etiqueta. */
  category: string;
  /**
   * Valor interno de la categoría (p. ej. `post.frontmatter.category`), para resolver el icono de la
   * miniatura sin imagen (`blogCategoryIcons`). No es un componente: cruza sin problema el límite
   * servidor/cliente de `BlogList` (a diferencia de pasar el icono ya resuelto como prop).
   */
  categoryKey: BlogCategory;
  /** Fecha y tiempo de lectura, ya formateados. */
  meta: ReactNode;
  hue?: Hue;
  /** Ruta local en /public (16:9); sin ella, degradado + icono de la categoría. */
  image?: string;
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
      <CardThumbnail
        image={image}
        alt=""
        icon={blogCategoryIcons[categoryKey]}
        badges={<ThumbBadge variant="hue">{category}</ThumbBadge>}
      />
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
