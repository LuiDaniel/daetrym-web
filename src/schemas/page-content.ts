import { z } from 'zod';

/**
 * Esquemas del contenido estructurado que vive en src/messages. Se validan al renderizar (si falta
 * algo, falla de forma clara en build/desarrollo) y en las pruebas unitarias, para ambos idiomas.
 */
const text = z.string().trim().min(1);
const list = z.array(text).min(1);

export const faqItemSchema = z.object({ q: text, a: text });
export const faqSchema = z.array(faqItemSchema).min(3);

const paragraphBlock = z.object({ type: z.literal('p'), text });
const listBlock = z.object({ type: z.literal('ul'), items: list });
const tableBlock = z
  .object({
    type: z.literal('table'),
    caption: text,
    headers: z.array(text).min(2),
    rows: z.array(z.array(text)).min(1),
  })
  .refine((table) => table.rows.every((row) => row.length === table.headers.length), {
    message: 'Todas las filas de una tabla deben tener tantas celdas como cabeceras',
  });

export const blockSchema = z.discriminatedUnion('type', [paragraphBlock, listBlock, tableBlock]);

export const documentSectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'El id de sección debe ser un slug en minúsculas'),
  title: text,
  blocks: z.array(blockSchema).min(1),
});

const uniqueIds = (sections: { id: string }[]) =>
  new Set(sections.map((section) => section.id)).size === sections.length;

const sectionsSchema = z.array(documentSectionSchema).min(1).refine(uniqueIds, {
  message: 'Los ids de sección deben ser únicos',
});

const metaSchema = z.object({ title: text, description: text });

/** Privacidad, términos y cookies. */
export const legalDocumentSchema = z.object({
  meta: metaSchema,
  title: text,
  intro: text,
  sections: sectionsSchema,
});

/** Política de divulgación responsable (/security). */
export const securityPolicySchema = z.object({
  meta: metaSchema,
  eyebrow: text,
  title: text,
  intro: text,
  draft: z.object({ title: text, body: text }),
  sections: sectionsSchema,
});

export const serviceContentSchema = z.object({
  name: text,
  summary: text,
  tagline: text,
  meta: metaSchema,
  problem: z.object({ title: text, body: text, points: list }),
  solution: z.object({ title: text, body: text, points: list }),
  process: z.array(z.object({ title: text, text })).min(3),
  deliverables: list,
  faq: faqSchema,
  cta: z.object({ title: text, text }),
});

export const processStepSchema = z.object({
  title: text,
  summary: text,
  description: text,
  duration: text,
  outputs: list,
});

export type LegalDocument = z.infer<typeof legalDocumentSchema>;
export type SecurityPolicy = z.infer<typeof securityPolicySchema>;
export type DocumentSection = z.infer<typeof documentSectionSchema>;
export type ServiceContent = z.infer<typeof serviceContentSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
