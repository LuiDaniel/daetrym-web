import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

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
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-lg border border-warning-border bg-warning-bg p-4 text-small text-fg',
        className,
      )}
    >
      <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
      <div className="space-y-1">
        <p className="font-semibold text-warning">{title ?? t('draftNoticeTitle')}</p>
        <div className="text-fg-muted">{children}</div>
      </div>
    </div>
  );
}
