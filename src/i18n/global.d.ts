import type { routing } from './routing';
import type messages from '../messages/es.json';

// Tipado estricto de las claves de traducción y del locale (next-intl v4).
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
