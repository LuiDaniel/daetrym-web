import type { Localized } from './localized';

export type TeamMember = {
  id: string;
  name: string;
  role: Localized;
  bio: Localized;
  /** true = perfil de ejemplo: la tarjeta muestra el distintivo «Ejemplo». */
  placeholder: boolean;
};

const genericBio: Localized = {
  es: 'Breve presentación: trayectoria, especialidad y qué aporta al equipo.',
  en: 'Short introduction: background, specialty and what they bring to the team.',
};

/**
 * PLACEHOLDER — perfiles de ejemplo. Sustituirlos por las personas reales del equipo
 * (y poner `placeholder: false`). Las tarjetas usan iniciales; para usar fotos, añadir un campo
 * `photo` y adaptar components/sections/team-card.tsx.
 */
export const team: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Nombre Apellido',
    placeholder: true,
    role: { es: 'Dirección y arquitectura', en: 'Leadership and architecture' },
    bio: genericBio,
  },
  {
    id: 'member-2',
    name: 'Nombre Apellido',
    placeholder: true,
    role: { es: 'Desarrollo de software', en: 'Software development' },
    bio: genericBio,
  },
  {
    id: 'member-3',
    name: 'Nombre Apellido',
    placeholder: true,
    role: { es: 'Seguridad ofensiva', en: 'Offensive security' },
    bio: genericBio,
  },
  {
    id: 'member-4',
    name: 'Nombre Apellido',
    placeholder: true,
    role: { es: 'Seguridad defensiva', en: 'Defensive security' },
    bio: genericBio,
  },
];
