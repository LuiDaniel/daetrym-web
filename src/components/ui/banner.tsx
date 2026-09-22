import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const tones = {
  warning: { hue: 'hue-amber', icon: TriangleAlert },
  info: { hue: 'hue-cyan', icon: Info },
  success: { hue: 'hue-green', icon: CircleCheck },
  critical: { hue: 'hue-red', icon: CircleAlert },
} as const satisfies Record<string, { hue: string; icon: LucideIcon }>;

export type BannerTone = keyof typeof tones;

/**
 * Banner informativo con tono semántico (Primer «Flash»). No interrumpe: `role="note"`. Para un error que
 * el usuario debe oír al instante, pasar `role="alert"`. El icono refuerza el color (nunca solo color).
 */
export function Banner({
  tone = 'info',
  title,
  role = 'note',
  className,
  children,
}: {
  tone?: BannerTone;
  title?: string;
  role?: 'note' | 'status' | 'alert';
  className?: string;
  children: ReactNode;
}) {
  const { hue, icon: Icon } = tones[tone];

  return (
    <div
      role={role}
      className={cn(
        hue,
        'flex gap-3 rounded-lg border border-h-line bg-h-tint p-4 text-small text-fg',
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-h-fg" strokeWidth={1.75} />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold text-h-fg">{title}</p>}
        <div className="text-fg-muted">{children}</div>
      </div>
    </div>
  );
}
