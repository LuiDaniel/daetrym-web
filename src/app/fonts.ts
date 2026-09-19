import { Inter, JetBrains_Mono } from 'next/font/google';

/** Inter con eje óptico (opsz): las letras cambian de forma según el tamaño (apple-design §15). */
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
