# DaeTrym — sitio web corporativo

Sitio bilingüe (ES/EN) de **DaeTrym / DAETRYM Systems**: ciberseguridad y desarrollo de software.
Next.js (App Router) + React + TypeScript estricto + Tailwind CSS v4, desplegable en Vercel.

> Estado: **Fase 2 de 6** (contenido estático: Home, Servicios, Ciberseguridad, Nosotros, Proceso, legales,
> política de divulgación, `security.txt` y 404). Ver el checklist en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
> Contacto, propuesta, proyectos, blog y recursos son páginas «en construcción» hasta las fases 3 y 4.

## Requisitos

- Node.js ≥ 22 (`.nvmrc` fija 24)
- pnpm (`corepack enable` o `npm i -g pnpm`; la versión está fijada en `package.json`)

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # ajusta los valores (ver "Variables de entorno")
pnpm dev                     # http://localhost:3000  → redirige a /es o /en
```

## Scripts

| Script                         | Qué hace                                                                  |
| ------------------------------ | ------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start` | Desarrollo, build de producción y servidor de producción                  |
| `pnpm lint`                    | ESLint (incluye a11y y la regla de "cero texto hardcodeado")              |
| `pnpm typecheck`               | Genera los tipos de rutas de Next y ejecuta `tsc`                         |
| `pnpm test`                    | Pruebas unitarias (Vitest)                                                |
| `pnpm test:e2e`                | E2E con Playwright contra la build de **producción** (`pnpm build` antes) |
| `pnpm check:i18n`              | Paridad de claves ES/EN                                                   |
| `pnpm check:contrast`          | Contraste WCAG AA de los tokens de diseño                                 |
| `pnpm check:placeholders`      | Lista el contenido de ejemplo pendiente de reemplazar                     |
| `pnpm brand`                   | Regenera favicon/iconos desde `public/brand/logo-mark-dark.svg`           |
| `pnpm format`                  | Prettier                                                                  |

La primera vez que corras los e2e: `pnpm exec playwright install chromium`.

## Variables de entorno

Documentadas una a una en [`.env.example`](.env.example) y validadas con Zod en `src/env.ts`: en producción,
faltar una obligatoria **rompe la build**. Solo las `NEXT_PUBLIC_*` llegan al navegador. **Nunca subas
`.env*` con secretos.**

## Estructura

```
src/app/[locale]/…     páginas (localizadas)        src/styles/     tokens, tipografía, materiales, motion
src/components/        ui · layout · motion         src/config/     datos de marca (única fuente)
src/i18n/              routing y navegación         src/messages/   textos ES/EN, un fichero por área
src/lib/security/      CSP y cabeceras              src/proxy.ts    idioma + CSP con nonce + mantenimiento
docs/                  ARCHITECTURE · DESIGN        tests/          unit (Vitest) · e2e (Playwright)
```

## Contenido y textos pendientes

Todo lo que es **ejemplo o está pendiente** está marcado y se lista con `pnpm check:placeholders`:

- **Equipo, proyectos, redes, stack** → `src/config/*.ts` (`placeholder: true`, distintivo «Ejemplo» en pantalla).
- **Datos legales** → los textos de `src/messages/<locale>/legal.json` y `security.json` llevan marcadores `[COMPLETAR: …]` (ES) / `[COMPLETE: …]` (EN), resaltados en ámbar.
- **Avisos de borrador** en las páginas legales → se ocultan con `draftNotices: false` en `src/config/site.ts` cuando estén revisadas por un abogado.
- No hay cifras, clientes ni testimonios inventados; no los añadas sin marcarlos como ejemplo.

## Cómo…

- **Cambiar datos de contacto/marca:** `src/config/site.ts`, `social.ts` y las variables `NEXT_PUBLIC_*`.
- **Añadir o editar un texto:** en **ambos** `src/messages/es.json` y `en.json` (`pnpm check:i18n`).
- **Añadir un idioma:** añadirlo a `locales` y a cada ruta de `pathnames` en `src/i18n/routing.ts`, crear
  `src/messages/<locale>.json` y ejecutar `pnpm check:i18n`. Con más de 3 idiomas, cambiar el selector
  segmentado por un popover.
- **Activar modo mantenimiento:** `MAINTENANCE_MODE=true` (503 con `Retry-After` en todo el sitio).
- **Añadir un servicio:** añadir el slug en `src/config/services.ts` y su contenido (`services.items.<slug>`, con la misma forma que los existentes) en **ambos** idiomas; `pnpm test` valida el esquema.
- **Editar un texto largo (legal, servicios):** en `src/messages/<locale>/*.json`; los enlaces usan `[texto](/ruta)` y los datos de la empresa `{legalName}`, `{email}`, `{securityEmail}`.
- **Añadir un post/proyecto:** llega en la Fase 3.

## Seguridad

El sitio es parte de la credibilidad de una empresa de ciberseguridad. Ver el resumen de decisiones (CSP con
nonce por petición, cabeceras, validación de entorno) en `docs/ARCHITECTURE.md`; el modelo de amenazas
completo (`docs/SECURITY.md`) llega en la Fase 6.

## Aviso legal

Las plantillas de Privacidad, Términos y Cookies (Fase 2) son **genéricas y deben ser revisadas por un
abogado** antes de publicarse.
