import type { Hue } from './hues';

export type ProjectCategory = 'web' | 'software' | 'security';

/** Cada categoría hereda el color del servicio al que corresponde. */
export const projectHues: Record<ProjectCategory, Hue> = {
  web: 'cyan',
  software: 'violet',
  security: 'green',
};

// Los casos de ejemplo (antes una lista fija aquí) viven ahora en /content/projects como MDX — ver
// src/lib/content/projects.ts. `placeholder: true` en su frontmatter sigue marcándolos como ejemplo.
