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
} as const;
