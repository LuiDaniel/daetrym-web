import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';

/** Acento editorial: serif cursiva para UNA palabra destacada por título principal (`font-accent`). */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument-serif',
  display: 'swap',
});

/** Inter con eje óptico (opsz): las letras cambian de forma según el tamaño. */
export const inter = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-inter',
  display: 'swap',
});

/** Tono técnico: código y etiquetas. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
