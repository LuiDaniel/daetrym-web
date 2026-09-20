import { LogoMark } from '@/components/layout/logo-mark';

type Labels = { design: string; code: string; infrastructure: string; operations: string };

/**
 * Ilustración del hero: la seguridad como capas concéntricas (diseño → código → infraestructura →
 * operación) alrededor del isotipo. Es decorativa (aria-hidden): el mismo mensaje está en el texto
 * de la página. Estática a propósito (apple-design: nada de fondos ni decoraciones animadas).
 */
export function SecurityLayers({ labels }: { labels: Labels }) {
  // De fuera hacia dentro: cada capa protege a la siguiente.
  const layers = [
    { x: 8, size: 384, radius: 46, opacity: 0.035, label: labels.operations },
    { x: 56, size: 288, radius: 36, opacity: 0.06, label: labels.infrastructure },
    { x: 100, size: 200, radius: 28, opacity: 0.1, label: labels.code },
    { x: 140, size: 120, radius: 22, opacity: 0.16, label: labels.design },
  ];

  return (
    <div aria-hidden className="relative aspect-square w-full">
      <svg viewBox="0 0 400 400" className="size-full" fill="none">
        {layers.map((layer, index) => (
          <g key={layer.label}>
            <rect
              x={layer.x}
              y={layer.x}
              width={layer.size}
              height={layer.size}
              rx={layer.radius}
              fill="var(--accent)"
              fillOpacity={layer.opacity}
              stroke={index === layers.length - 1 ? 'var(--accent)' : 'var(--hairline-strong)'}
              strokeOpacity={index === layers.length - 1 ? 0.5 : 1}
            />
            <text
              x={layer.x + 18}
              y={layer.x + 26}
              fill="var(--fg-muted)"
              fontFamily="var(--font-mono)"
              fontSize="13"
              letterSpacing="1.2"
              style={{ textTransform: 'uppercase' }}
            >
              {layer.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center pt-[7%]">
        <LogoMark className="h-auto w-[16%] text-fg" />
      </div>
    </div>
  );
}
