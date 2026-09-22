import readingTime from 'reading-time';

/** Minutos de lectura redondeados hacia arriba, mínimo 1 (evita un «0 min» para textos muy cortos). */
export function estimateReadingMinutes(markdown: string): number {
  return Math.max(1, Math.ceil(readingTime(markdown).minutes));
}
