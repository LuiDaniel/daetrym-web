import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { siteConfig } from '@/config/site';
import { hueClass, type Hue } from '@/config/hues';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { SectionGlow } from './section-glow';

/**
 * Página provisional para secciones que llegan en fases posteriores (proyectos, blog, contacto,
 * propuesta, recursos). Evita que los CTAs principales lleven a un 404 mientras tanto.
 * Se elimina al construir cada sección real; `hue`/`glow` adelantan la identidad de color que tendrá
 * la sección definitiva (blog cian, proyectos violeta…), así la Fase 3 hereda el tono sin decidirlo de nuevo.
 */
export function ComingSoon({
  title,
  hue = 'green',
  glow,
}: {
  title: string;
  hue?: Hue;
  glow?: [Hue, Hue];
}) {
  const t = useTranslations();
  const email = siteConfig.contact.email;

  return (
    <section
      aria-labelledby="page-title"
      className={cn('container-page page-top relative isolate pb-20', hueClass[hue])}
    >
      {glow && <SectionGlow hues={glow} />}
      <div className="max-w-xl">
        <Eyebrow>{t('comingSoon.eyebrow')}</Eyebrow>
        <h1 id="page-title" className="mt-3 text-h1">
          {title}
        </h1>
        <p className="mt-4 text-lead text-fg-muted">{t('comingSoon.description', { email })}</p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button asChild size="lg">
            <a href={`mailto:${email}`}>{email}</a>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">{t('common.backToHome')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
