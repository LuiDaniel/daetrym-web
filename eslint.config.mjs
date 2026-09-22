import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'playwright-report/**', 'next-env.d.ts']),
  {
    // Cero texto hardcodeado en JSX: las cadenas viven en src/messages/{es,en}.json
    files: ['src/app/**/*.tsx', 'src/components/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: false, allowedStrings: ['·', '/', '—', '|', '•', '→', '©'] },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    // Documentos de email completos (Fase 4): <html>/<head>/<body> son de verdad necesarios — no
    // son una página de Next, @react-email/render los convierte en el HTML que recibe el cliente
    // de correo (ver src/lib/email/layout.tsx).
    files: ['src/lib/email/**/*.tsx'],
    rules: {
      '@next/next/no-head-element': 'off',
    },
  },
]);
