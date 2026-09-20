/**
 * Etapas del proceso de trabajo, en orden. Los textos viven en messages → `process.steps.<id>`
 * (Home y página de proceso comparten la misma fuente).
 */
export const processStepIds = [
  'discovery',
  'design',
  'development',
  'security',
  'delivery',
  'support',
] as const;

export type ProcessStepId = (typeof processStepIds)[number];
