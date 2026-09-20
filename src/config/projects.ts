import type { Localized } from './localized';

export type ProjectCategory = 'web' | 'software' | 'security';

export type FeaturedProject = {
  id: string;
  category: ProjectCategory;
  title: Localized;
  summary: Localized;
  tags: string[];
  /** true = contenido de ejemplo: la tarjeta muestra el distintivo «Ejemplo». */
  placeholder: boolean;
};

/**
 * PLACEHOLDER — proyectos de ejemplo. Sustituirlos por casos reales (con permiso del cliente).
 * En la Fase 3 esta lista se sustituye por la capa de contenido MDX (content/projects).
 * No incluyen métricas ni nombres de clientes a propósito: no se inventan datos.
 */
export const featuredProjects: FeaturedProject[] = [
  {
    id: 'booking-platform',
    category: 'web',
    placeholder: true,
    title: {
      es: 'Plataforma de reservas y gestión',
      en: 'Booking and management platform',
    },
    summary: {
      es: 'Aplicación web para gestionar reservas, agendas y pagos, con roles de acceso y trazabilidad de cambios.',
      en: 'Web application to manage bookings, schedules and payments, with access roles and change tracking.',
    },
    tags: ['Next.js', 'PostgreSQL', 'OWASP ASVS'],
  },
  {
    id: 'api-audit',
    category: 'security',
    placeholder: true,
    title: {
      es: 'Auditoría de seguridad de una API',
      en: 'Security audit of an API',
    },
    summary: {
      es: 'Pruebas de penetración y revisión de código de una API de negocio, con informe priorizado y reprueba.',
      en: 'Penetration testing and code review of a business API, with a prioritized report and retest.',
    },
    tags: ['OWASP WSTG', 'CVSS', 'PTES'],
  },
  {
    id: 'inventory-system',
    category: 'software',
    placeholder: true,
    title: {
      es: 'Sistema interno de inventario y trazabilidad',
      en: 'Internal inventory and traceability system',
    },
    summary: {
      es: 'Software a medida que sustituye hojas de cálculo dispersas por un sistema único, integrado con las herramientas existentes.',
      en: 'Custom software that replaces scattered spreadsheets with a single system, integrated with existing tools.',
    },
    tags: ['API', 'PostgreSQL', 'RBAC'],
  },
];
