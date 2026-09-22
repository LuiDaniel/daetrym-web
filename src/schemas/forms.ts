import { z } from 'zod';

/**
 * Esquemas de los formularios de la Fase 4 (contacto, propuesta, newsletter, lista de espera).
 * Compartidos entre cliente (`@hookform/resolvers/zod` en `src/components/forms`) y servidor
 * (`src/actions/*`, que vuelve a validar — nunca confía en lo que ya validó el cliente, ver
 * node_modules/next/dist/docs/01-app/02-guides/server-actions.md § Security).
 *
 * `z.config({ jitless: true })`: por defecto, los esquemas `z.object()` de Zod 4 compilan una vía
 * rápida con `new Function` la primera vez que se validan. En el cliente eso choca con la CSP
 * estricta del sitio (sin `unsafe-eval`, docs/ARCHITECTURE.md D1): Zod atrapa el fallo y sigue
 * funcionando con el parser normal, pero el propio intento ya dispara una violación de CSP real
 * (detectada por `tests/e2e/smoke.spec.ts`, que exige cero violaciones). `jitless` desactiva esa vía
 * rápida desde el arranque, así nunca se intenta — ver el comentario de Zod en
 * node_modules/zod/v4/core/util.js ("Skip the probe under jitless..."). Efecto global (un único
 * proceso de Zod, cliente y servidor): no hay validaciones lo bastante frecuentes en este sitio para
 * que la vía rápida importe en rendimiento.
 */
z.config({ jitless: true });

const name = z.string().trim().min(1).max(120);
const email = z.string().trim().toLowerCase().email().max(254);
const company = z.string().trim().max(120).optional().or(z.literal(''));
/** Casilla de la política de privacidad: debe estar marcada, no solo estar presente. */
const privacyConsent = z.literal(true);
/** Rellenar este campo (invisible para una persona) delata a un bot — ver lib/security/honeypot.ts. */
const honeypot = z.string().optional();
/** Vacío mientras el widget no se ha resuelto: bloquea el envío hasta entonces. */
const turnstileToken = z.string().min(1);

export const contactFormSchema = z.object({
  name,
  email,
  company,
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(10).max(5000),
  privacyConsent,
  website: honeypot,
  turnstileToken,
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const projectTypeValues = [
  'web_app',
  'custom_software',
  'security',
  'consulting',
  'other',
] as const;
export const serviceValues = ['web_app', 'custom_software', 'security', 'consulting'] as const;
export const budgetRangeValues = ['lt_5k', '5k_15k', '15k_40k', 'gt_40k', 'not_sure'] as const;
export const timelineValues = ['asap', '1_3_months', '3_6_months', 'flexible'] as const;

export const quoteFormSchema = z.object({
  projectType: z.enum(projectTypeValues),
  services: z.array(z.enum(serviceValues)).min(1),
  budgetRange: z.enum(budgetRangeValues),
  timeline: z.enum(timelineValues),
  description: z.string().trim().min(20).max(5000),
  name,
  email,
  company,
  privacyConsent,
  website: honeypot,
  turnstileToken,
});
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

/** Un paso del asistente por subconjunto de campos, para validar antes de avanzar (sin re-enviar). */
export const quoteStepSchemas = [
  quoteFormSchema.pick({ projectType: true, services: true }),
  quoteFormSchema.pick({ budgetRange: true, timeline: true }),
  quoteFormSchema.pick({ description: true }),
  quoteFormSchema.pick({ name: true, email: true, company: true, privacyConsent: true }),
] as const;

export const newsletterSourceValues = ['footer', 'checklist', 'blog'] as const;

export const newsletterFormSchema = z.object({
  email,
  source: z.enum(newsletterSourceValues),
  privacyConsent,
  website: honeypot,
  turnstileToken,
});
export type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;

export const waitlistInterestValues = ['tool', 'checklist'] as const;

export const waitlistFormSchema = z.object({
  email,
  interests: z.array(z.enum(waitlistInterestValues)).min(1),
  website: honeypot,
  turnstileToken,
});
export type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;
