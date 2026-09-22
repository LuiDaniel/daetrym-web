/**
 * Tonos de color disponibles (ver src/styles/tokens.css → `.hue-*`). Un contenedor con `hue-<tono>` hace que
 * `bg-h-tint`, `text-h-fg`, `border-h-line`… de sus hijos usen ese tono. Se listan las clases completas
 * para que Tailwind y la búsqueda de texto las encuentren.
 */
export const hueClass = {
  green: 'hue-green',
  cyan: 'hue-cyan',
  blue: 'hue-blue',
  violet: 'hue-violet',
  magenta: 'hue-magenta',
  amber: 'hue-amber',
  red: 'hue-red',
} as const;

export type Hue = keyof typeof hueClass;
