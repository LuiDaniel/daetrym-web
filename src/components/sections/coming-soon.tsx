import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';

/**
 * Página provisional para secciones que llegan en fases posteriores (proyectos, blog, contacto,
 * propuesta, recursos). Evita que los CTAs principales lleven a un 404 mientras tanto.
 * Se elimina al construir cada sección real.
 */
export function ComingSoon({ title }: { title: string }) {
  const t = useTranslations();
  const email = siteConfig.contact.email;

  return (
    <section aria-labelledby="page-title" className="container-page page-top pb-24">
      <div className="max-w-2xl">
        <Eyebrow>{t('comingSoon.eyebrow')}</Eyebrow>
        <h1 id="page-title" className="mt-4 text-h1">
          {title}
        </h1>
        <p className="mt-5 text-lead text-fg-muted">{t('comingSoon.description', { email })}</p>
        <div className="mt-9 flex flex-wrap gap-3">
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
