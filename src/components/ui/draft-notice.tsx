import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { siteConfig } from '@/config/site';
import { Banner } from './banner';

type DraftNoticeProps = {
  title?: string;
  children: ReactNode;
  /**
   * `true` (por defecto): solo se muestra mientras `siteConfig.draftNotices` sea true, es decir, hasta
   * que el contenido pendiente haya sido revisado. `false`: aviso ligado a un dato de ejemplo concreto.
   */
  gated?: boolean;
  className?: string;
};

/** Aviso ámbar de contenido de ejemplo o pendiente de revisión. No es una alerta: no interrumpe. */
export function DraftNotice({ title, children, gated = true, className }: DraftNoticeProps) {
  const t = useTranslations('common');
  if (gated && !siteConfig.draftNotices) return null;

  return (
    <Banner tone="warning" title={title ?? t('draftNoticeTitle')} className={className}>
      {children}
    </Banner>
  );
}
