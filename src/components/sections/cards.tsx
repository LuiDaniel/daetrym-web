import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import type { FeaturedProject } from '@/config/projects';
import { pick } from '@/config/localized';
import { serviceIcons, type ServiceSlug } from '@/config/services';
import type { TeamMember } from '@/config/team';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Tarjeta informativa con icono (principios, valores…). No es un enlace. */
export function FeatureCard({
  icon,
  title,
  text,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <Card className={cn('reveal flex flex-col gap-4', className)}>
      <IconBadge icon={icon} />
      <h3 className="text-title">{title}</h3>
      <p className="text-body text-fg-muted">{text}</p>
    </Card>
  );
}

/**
 * Tarjeta de servicio. Patrón de «enlace extendido»: el enlace es solo el título (los lectores de
 * pantalla anuncian un nombre corto) y su ::after cubre toda la tarjeta para que sea clicable entera.
 * Respuesta en pointer-down (.press) y anillo de foco alrededor de toda la tarjeta.
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
        'reveal press group relative flex flex-col gap-4 rounded-lg border border-hairline bg-surface-1 p-6 transition-[transform,background-color,border-color] duration-100 ease-out hover:border-hairline-strong hover:bg-surface-2 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-(--focus-ring) sm:p-7',
        className,
      )}
    >
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
        className="mt-auto inline-flex items-center gap-1.5 pt-2 text-small font-medium text-accent-text"
      >
        {t('learnMore')}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
    <Card className={cn('reveal flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">{categoryLabel}</Badge>
        {project.placeholder && <Badge variant="placeholder">{t('example')}</Badge>}
      </div>
      <h3 className="text-title">{pick(project.title, locale)}</h3>
      <p className="text-body text-fg-muted">{pick(project.summary, locale)}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-2">
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
    <Card className={cn('reveal flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden
          className="grid size-14 place-items-center rounded-full border border-hairline-strong bg-accent-tint font-mono text-lead text-accent-text"
        >
          {initials(member.name)}
        </span>
        {member.placeholder && <Badge variant="placeholder">{t('example')}</Badge>}
      </div>
      <div>
        <h3 className="text-title">{member.name}</h3>
        <p className="mt-1 text-small text-accent-text">{pick(member.role, locale)}</p>
      </div>
      <p className="text-body text-fg-muted">{pick(member.bio, locale)}</p>
    </Card>
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
        'mt-12 grid gap-4 sm:gap-5',
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
