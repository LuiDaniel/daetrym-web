/**
 * Tecnologías mostradas en la Home. Son nombres propios (no se traducen); los títulos de grupo viven
 * en messages → `home.stack.groups`.
 *
 * PLACEHOLDER — confirmar con el equipo que esta lista refleja las herramientas con las que
 * realmente se trabaja, y ajustarla.
 */
import type { Hue } from './hues';

export type StackGroup = 'apps' | 'infra' | 'security';

export const stackHues: Record<StackGroup, Hue> = {
  apps: 'cyan',
  infra: 'blue',
  security: 'green',
};

export const stack: Record<StackGroup, string[]> = {
  apps: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS'],
  infra: ['PostgreSQL', 'Redis', 'Docker', 'Vercel', 'GitHub Actions'],
  security: ['OWASP ZAP', 'Burp Suite', 'Nmap', 'Semgrep', 'Trivy'],
};

export const stackGroups = Object.keys(stack) as StackGroup[];
