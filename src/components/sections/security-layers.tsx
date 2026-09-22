import { LogoMark } from '@/components/layout/logo-mark';

type Labels = { design: string; code: string; infrastructure: string; operations: string };

/**
 * Ilustración del hero: la seguridad como capas concéntricas (diseño → código → infraestructura →
 * operación) alrededor del isotipo, cada capa con su color. Va sobre un panel de vidrio. Es decorativa
 * (aria-hidden): el mismo mensaje está en el texto de la página. Estática a propósito.
 */
export function SecurityLayers({ labels }: { labels: Labels }) {
  // De fuera hacia dentro: cada capa protege a la siguiente.
  const layers = [
    {
      x: 8,
      size: 384,
      radius: 40,
      color: 'var(--c-violet)',
      text: 'var(--c-violet-fg)',
      fill: 0.05,
      label: labels.operations,
    },
    {
      x: 56,
      size: 288,
      radius: 32,
      color: 'var(--c-cyan)',
      text: 'var(--c-cyan-fg)',
      fill: 0.07,
      label: labels.infrastructure,
    },
    {
      x: 100,
      size: 200,
      radius: 24,
      color: 'var(--c-blue)',
      text: 'var(--c-blue-fg)',
      fill: 0.09,
      label: labels.code,
    },
    {
      x: 140,
      size: 120,
      radius: 18,
      color: 'var(--c-green)',
      text: 'var(--c-green-fg)',
      fill: 0.16,
      label: labels.design,
    },
  ];

  return (
    <div aria-hidden className="rounded-xl material-regular p-3 sm:p-4">
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 400 400" className="size-full" fill="none">
          {layers.map((layer, index) => (
            <g key={layer.label}>
              <rect
                x={layer.x}
                y={layer.x}
                width={layer.size}
                height={layer.size}
                rx={layer.radius}
                fill={layer.color}
                fillOpacity={layer.fill}
                stroke={layer.color}
                strokeOpacity={index === layers.length - 1 ? 0.7 : 0.45}
              />
              <text
                x={layer.x + 16}
                y={layer.x + 24}
                fill={layer.text}
                fontFamily="var(--font-mono)"
                fontSize="12"
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
    </div>
  );
}
