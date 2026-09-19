import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** Link/redirect/usePathname/useRouter conscientes del idioma. Usar siempre estos, no los de next/*. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
