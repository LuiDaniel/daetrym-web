import type { AppPathname } from '@/i18n/routing';

/** Claves de `nav.*` en src/messages. El texto siempre viene de las traducciones. */
export type NavKey =
  | 'services'
  | 'cybersecurity'
  | 'projects'
  | 'process'
  | 'about'
  | 'blog'
  | 'resources'
  | 'contact'
  | 'security'
  | 'privacy'
  | 'terms'
  | 'cookies';

export type NavItem = { key: NavKey; href: Exclude<AppPathname, `${string}[${string}`> };

/** Navegación principal (header y menú móvil). */
export const mainNav: NavItem[] = [
  { key: 'services', href: '/services' },
  { key: 'cybersecurity', href: '/cybersecurity' },
  { key: 'projects', href: '/projects' },
  { key: 'blog', href: '/blog' },
  { key: 'about', href: '/about' },
];

/** Columnas del footer. */
export const footerNav: {
  titleKey: 'exploreTitle' | 'companyTitle' | 'legalTitle';
  items: NavItem[];
}[] = [
  {
    titleKey: 'exploreTitle',
    items: [
      { key: 'services', href: '/services' },
      { key: 'cybersecurity', href: '/cybersecurity' },
      { key: 'projects', href: '/projects' },
      { key: 'resources', href: '/resources' },
      { key: 'blog', href: '/blog' },
    ],
  },
  {
    titleKey: 'companyTitle',
    items: [
      { key: 'about', href: '/about' },
      { key: 'process', href: '/process' },
      { key: 'contact', href: '/contact' },
      { key: 'security', href: '/security' },
    ],
  },
  {
    titleKey: 'legalTitle',
    items: [
      { key: 'privacy', href: '/legal/privacy' },
      { key: 'terms', href: '/legal/terms' },
      { key: 'cookies', href: '/legal/cookies' },
    ],
  },
];
