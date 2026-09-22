import type { Hue } from '@/config/hues';

/**
 * Resplandor de sección: dos manchas radiales grandes y difusas (arriba-izquierda, abajo-derecha) en
 * dos tonos de la paleta, generadas con CSS puro (sin imágenes). Reemplaza al fondo global fijo de la
 * Fase 1 del rediseño: cada sección scrollea con SU PROPIA combinación en vez de repetir siempre la
 * misma (ver docs/DESIGN.md). Puramente decorativo (aria-hidden), detrás del contenido (`-z-10`), y
 * clipada a la caja de la sección (el fondo de un elemento nunca se sale de su caja, aunque el
 * gradiente esté especificado más grande que el propio elemento).
 *
 * Opacidad (`--glow-alpha`, tokens.css, distinta por tema) verificada por `pnpm check:contrast`: el
 * peor caso es un solo tono a la vez (los dos círculos están en esquinas opuestas y con `70%` de radio
 * apenas llegan a solaparse).
 */
export function SectionGlow({ hues }: { hues: [Hue, Hue] }) {
  const [a, b] = hues;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: `radial-gradient(ellipse 70% 65% at 6% 0%, color-mix(in srgb, var(--c-${a}) var(--glow-alpha), transparent), transparent 70%), radial-gradient(ellipse 65% 60% at 94% 100%, color-mix(in srgb, var(--c-${b}) var(--glow-alpha), transparent), transparent 70%)`,
      }}
    />
  );
}
