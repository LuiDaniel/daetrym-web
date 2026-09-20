import { env } from '@/env';

/**
 * Datos de marca y contacto: ÚNICA fuente de verdad. Los textos traducibles viven en
 * src/messages; aquí solo van datos que no cambian con el idioma.
 */
export const siteConfig = {
  name: 'DaeTrym',
  legalName: 'DAETRYM Systems',
  url: env.NEXT_PUBLIC_SITE_URL,
  contact: {
    email: env.NEXT_PUBLIC_CONTACT_EMAIL,
    securityEmail: env.NEXT_PUBLIC_SECURITY_EMAIL ?? env.NEXT_PUBLIC_CONTACT_EMAIL,
    whatsapp: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    calUrl: env.NEXT_PUBLIC_CAL_URL,
  },
  /** Color de la barra del navegador (coincide con --bg en oscuro). */
  themeColor: '#040712',

  /**
   * PLACEHOLDER — poner en `false` cuando las plantillas legales, la política de divulgación y el
   * resto de textos pendientes hayan sido revisados. Oculta los avisos de borrador de esas páginas.
   * (Los distintivos «Ejemplo» de equipo y proyectos dependen de cada elemento, no de esta bandera.)
   */
  draftNotices: true,

  /** PLACEHOLDER — fecha de la última revisión de los documentos legales (ISO). */
  legalUpdated: '2026-09-19',

  /**
   * Validez del campo Expires de security.txt (RFC 9116 exige menos de un año). Se recalcula en cada
   * build, por lo que hay que redesplegar al menos una vez al año.
   */
  securityTxtValidityDays: 330,
} as const;
