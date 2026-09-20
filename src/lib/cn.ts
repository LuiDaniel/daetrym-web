import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge no conoce nuestras utilidades de tipografía (src/styles/typography.css) y las
 * trataría como colores (`text-small` borraría `text-on-accent`). Se registran como font-size.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: ['display', 'h1', 'h2', 'h3', 'title', 'lead', 'body', 'small', 'label', 'eyebrow'],
        },
      ],
    },
  },
});

/** Combina clases condicionales y resuelve conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
