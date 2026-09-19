export type SocialLink = {
  /** Clave estable; el texto accesible se resuelve como `social.<key>` si se traduce, o se usa `label`. */
  key: string;
  label: string;
  href: string;
};

/**
 * PLACEHOLDER — reemplazar por las redes reales de DaeTrym.
 * Una lista vacía oculta el bloque de redes en el footer.
 */
export const socialLinks: SocialLink[] = [
  { key: 'github', label: 'GitHub', href: 'https://github.com/' }, // PLACEHOLDER
  { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/' }, // PLACEHOLDER
];
