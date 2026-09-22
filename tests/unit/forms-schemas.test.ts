import { describe, expect, it } from 'vitest';
import {
  contactFormSchema,
  newsletterFormSchema,
  quoteFormSchema,
  quoteStepSchemas,
  waitlistFormSchema,
} from '@/schemas/forms';

const base = { website: '', turnstileToken: 'token' };

describe('contactFormSchema', () => {
  const valid = {
    ...base,
    name: 'Ada Lovelace',
    email: 'Ada@Example.com',
    company: '',
    subject: 'Consulta',
    message: 'Hola, quiero preguntar sobre sus servicios de seguridad web.',
    privacyConsent: true as const,
  };

  it('acepta datos válidos y normaliza el email a minúsculas', () => {
    const result = contactFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('ada@example.com');
  });

  it('rechaza un mensaje demasiado corto', () => {
    const result = contactFormSchema.safeParse({ ...valid, message: 'hola' });
    expect(result.success).toBe(false);
  });

  it('rechaza un email inválido', () => {
    const result = contactFormSchema.safeParse({ ...valid, email: 'no-es-un-email' });
    expect(result.success).toBe(false);
  });

  it('exige la casilla de privacidad marcada (no basta con que exista)', () => {
    const result = contactFormSchema.safeParse({ ...valid, privacyConsent: false });
    expect(result.success).toBe(false);
  });
});

describe('quoteFormSchema', () => {
  const valid = {
    ...base,
    projectType: 'web_app' as const,
    services: ['web_app' as const],
    budgetRange: '5k_15k' as const,
    timeline: 'asap' as const,
    description: 'Necesitamos una aplicación web nueva para gestionar reservas de clientes.',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    company: '',
    privacyConsent: true as const,
  };

  it('acepta datos válidos', () => {
    expect(quoteFormSchema.safeParse(valid).success).toBe(true);
  });

  it('exige al menos un servicio', () => {
    const result = quoteFormSchema.safeParse({ ...valid, services: [] });
    expect(result.success).toBe(false);
  });

  it('rechaza una descripción demasiado corta', () => {
    const result = quoteFormSchema.safeParse({ ...valid, description: 'corto' });
    expect(result.success).toBe(false);
  });

  it('cada esquema de paso valida solo su subconjunto de campos', () => {
    const [typeStep, scopeStep, descriptionStep, contactStep] = quoteStepSchemas;
    expect(typeStep.safeParse(valid).success).toBe(true);
    expect(scopeStep.safeParse(valid).success).toBe(true);
    expect(descriptionStep.safeParse(valid).success).toBe(true);
    expect(contactStep.safeParse(valid).success).toBe(true);
    expect(typeStep.safeParse({ ...valid, projectType: undefined }).success).toBe(false);
  });
});

describe('newsletterFormSchema', () => {
  it('acepta una fuente válida', () => {
    const result = newsletterFormSchema.safeParse({
      ...base,
      email: 'test@example.com',
      source: 'checklist',
      privacyConsent: true,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una fuente desconocida', () => {
    const result = newsletterFormSchema.safeParse({
      ...base,
      email: 'test@example.com',
      source: 'unknown',
      privacyConsent: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('waitlistFormSchema', () => {
  it('acepta uno o más intereses', () => {
    const result = waitlistFormSchema.safeParse({
      ...base,
      email: 'test@example.com',
      interests: ['tool', 'checklist'],
    });
    expect(result.success).toBe(true);
  });

  it('exige al menos un interés', () => {
    const result = waitlistFormSchema.safeParse({
      ...base,
      email: 'test@example.com',
      interests: [],
    });
    expect(result.success).toBe(false);
  });
});
