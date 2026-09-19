import { useTranslations } from 'next-intl';

/** Primer elemento enfocable de la página (WCAG 2.4.1). Visible solo al recibir foco. */
export function SkipLink() {
  const t = useTranslations('common');
  return (
    <a href="#main" className="skip-link">
      {t('skipToContent')}
    </a>
  );
}
