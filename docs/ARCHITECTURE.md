# Arquitectura y plan — DaeTrym web

## Context

DaeTrym (DAETRYM Systems) necesita un sitio corporativo bilingüe (ES/EN) de ciberseguridad y desarrollo de software, listo para Vercel. Al ser una empresa de ciberseguridad, **el sitio es su prueba de credibilidad**: cabeceras A/A+, validación de servidor, anti-spam, privacidad por diseño. Todo el diseño y la interacción se rigen por la skill **apple-design** (ya invocada en esta fase; se vuelve a consultar en las fases 1, 2, 3 y 5).

**Estado del entorno:** carpeta vacía salvo `public/brand/logo.png`; no es repo git; Node 24.15 y git 2.54 instalados; **pnpm no está instalado** (se activa con `corepack enable` o `npm i -g pnpm` en la Fase 1 y se fija con `packageManager`).

**Hallazgos del logo** (601×502 px, PNG opaco):

- Solo es un **isotipo** (engranaje verde + "V"/check blancos), **sin wordmark**. "DaeTrym" se compone como texto con la tipografía del sitio junto al isotipo.
- Fondo `#040712`, verde `#01BF63`, blanco `#FFFFFF` (muestreados del PNG). Son la base de los tokens.
- Tiene fondo sólido, no es vectorial, y los trazos blancos desaparecen sobre fondo claro → necesito una versión **SVG con trazos en `currentColor`** (ver decisión D2).

---

## 1. Propuesta de sistema de diseño (derivada de apple-design)

Principio rector de la skill: _el movimiento parte del valor actual, hereda la velocidad del usuario, proyecta el momentum y se puede agarrar/revertir en cualquier instante._ Restricción, feedback continuo y coherencia espacial por encima de la decoración.

**Una sola fuente de verdad:** `src/styles/tokens.css` (color, tipografía, radios, espacio, materiales) + `src/styles/motion.ts` (springs, umbrales, helpers `project()`, `rubberband()`, `useVelocityTracker`). Tailwind v4 consume esas variables vía `@theme`; ningún componente define valores propios.

### Color (oscuro por defecto, claro soportado)

| Token                                   | Oscuro                        | Claro                             |
| --------------------------------------- | ----------------------------- | --------------------------------- |
| `--bg`                                  | `#040712` (del logo)          | `#F5F6F8`                         |
| `--surface-1/2/3` (elevación)           | `#0B1020 / #121829 / #1A2236` | `#FFFFFF / #FFFFFF / #EEF0F4`     |
| `--fg` / `--fg-muted` / `--fg-subtle`   | blanco al 100 / 72 / 48 %     | `#0B1020` al 100 / 68 / 46 %      |
| `--accent` (marca)                      | `#01BF63`                     | `#01BF63` (solo relleno/gráficos) |
| `--accent-text` (texto/enlaces)         | `#01BF63` (≈8:1 sobre bg)     | `#00713A` (≈6:1 sobre blanco)     |
| `--on-accent` (texto sobre botón verde) | `#04110A`                     | `#04110A`                         |
| `--hairline`                            | `rgba(255,255,255,.08)`       | `rgba(4,7,18,.10)`                |

Nota clave: **el blanco sobre `#01BF63` da ≈2.4:1 y no pasa AA**, por eso los botones primarios llevan texto oscuro. Los contrastes finales se validan con un script en la Fase 1 (también sobre materiales translúcidos). Acento verde usado con **restricción**: CTA primario, foco, estados activos, un detalle por sección.

### Tipografía (optical sizing + tracking/leading por tamaño)

- **Inter Variable** (eje `opsz`) vía `next/font` + **JetBrains Mono** para el tono técnico (código, etiquetas). Ver D6: la skill prefiere la fuente del sistema; propongo Inter por consistencia entre Windows/Android/iOS y porque trae eje óptico.
- Escala fluida con `clamp()`; el tracking **nunca es un valor fijo**:

| Rol           | Tamaño                    | Tracking          | Leading     |
| ------------- | ------------------------- | ----------------- | ----------- |
| Display       | 3–5.5rem                  | −0.03em           | 1.02        |
| H1 / H2       | 2.25–3.5rem / 1.75–2.5rem | −0.022 / −0.018em | 1.08 / 1.15 |
| H3            | 1.25–1.5rem               | −0.012em          | 1.25        |
| Body          | 1–1.125rem                | 0                 | 1.55        |
| Small / label | 0.75–0.875rem             | +0.01 a +0.02em   | 1.4         |

Todo el espaciado en `rem` (respeta el tamaño de texto del usuario). Jerarquía con peso + tamaño + leading como conjunto.

### Materiales y profundidad

- 3 espesores: **thin** (chips, botones secundarios; blur 12), **regular** (header, tarjetas; blur 20 + saturate 180 %), **thick** (sheets, modales; blur 40 + sombra más profunda). Borde superior de 1 px claro = "luz sobre el material".
- Header translúcido con **scroll-edge effect** (máscara/degradado de blur) en lugar de un borde de 1 px. Nunca apilar superficies translúcidas claras.
- Modal = scrim + fondo que se hunde; panel no bloqueante = translucidez sin scrim.
- "Materializar": al entrar/salir, animar blur + escala juntos, no solo opacidad.
- Degradación obligatoria: `prefers-reduced-transparency` (opaco, sin blur), `prefers-contrast: more` (casi sólido + borde definido), sin soporte de `backdrop-filter`.
- Presupuesto de rendimiento: máx. 2 blurs grandes simultáneos en móvil; se mide en Lighthouse.
- Fondos: **estáticos** (resplandor radial verde muy sutil). Sin fondos animados de viewport completo (regla de la skill).

### Motion (springs, no curvas)

| Token             | Valor (motion `bounce`/`duration`)                  | Uso                                                  |
| ----------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `spring.default`  | bounce 0 (damping 1.0), 0.4 s                       | casi todo: reposicionar, aparecer, layout            |
| `spring.snappy`   | bounce 0, 0.3 s                                     | popovers, tooltips, toggles                          |
| `spring.momentum` | bounce 0.2 (damping ≈0.8), 0.4 s                    | **solo** tras un gesto con inercia (flick del sheet) |
| Press             | scale 0.97, 100 ms, **en pointer-down**             | botones/tarjetas                                     |
| Constantes        | `decel 0.998`, rubber-band `0.55`, histéresis 10 px | proyección, bordes, umbral de gesto                  |

Reglas que se cumplen en código: respuesta en pointer-down; arrastre 1:1 respetando el punto de agarre (`setPointerCapture` + historial de velocidad); **nada de CSS transitions/keyframes en lo gestual**; animar siempre desde el valor presentado; traspaso de velocidad al soltar; destino elegido por **proyección de momentum** y signo de la velocidad; rubber-banding en los bordes; entrada y salida por el mismo camino y `transform-origin` en el disparador; solo `transform`/`opacity`.
`prefers-reduced-motion`: se sustituye por fundidos de opacidad de ~200 ms, sin overshoot ni parallax; todo gesto tiene alternativa de teclado.

### Componentes gestuales concretos

- **Menú móvil = sheet** (Radix Dialog + `motion` drag propio, foco atrapado, Esc, arrastrar para cerrar con proyección y rubber-band, interrumpible).
- **Formulario de propuesta multi-paso:** deslizamiento direccional según el paso, camino de vuelta simétrico, barra de progreso con spring, validación por paso, foco gestionado y errores anunciados (`aria-live`).
- Acordeón de FAQ (altura animada e interrumpible), selector de idioma/tema como popover anclado a su origen, estados cargando/éxito/error con feedback continuo, tarjetas con feedback de press.
- Transición entre páginas: entrada con spring (fade + 8 px) por defecto; salida vía View Transitions API como mejora progresiva si resulta estable en Next (ver Riesgos).

---

## 2. Arquitectura

```
daetrym-web/
├─ content/{blog,projects,services}/{es,en}/*.mdx
├─ docs/  ARCHITECTURE.md · DESIGN.md · SECURITY.md · DEPLOY.md
├─ public/  brand/ · (icons, og fallback)
├─ scripts/  generate-brand.ts · check-i18n.ts · check-placeholders.ts · csp-hash.ts
├─ tests/{unit,e2e}
└─ src/
   ├─ app/
   │  ├─ [locale]/(marketing)/  page · services/[slug] · cybersecurity · projects/[slug]
   │  │                         about · process · blog/[slug] · contact · request-quote
   │  │                         resources · legal/{privacy,terms,cookies} · security · maintenance
   │  ├─ [locale]/{layout,not-found,error}.tsx
   │  ├─ api/  newsletter/{confirm,unsubscribe} · resources/download · cron/retention
   │  ├─ .well-known/security.txt/route.ts   (Expires calculado, RFC 9116)
   │  ├─ blog/feed.xml (RSS por idioma) · sitemap.ts · robots.ts · manifest.ts · opengraph-image
   │  └─ global-error.tsx
   ├─ actions/  contact · quote · newsletter · waitlist   (Server Actions + Zod)
   ├─ components/{ui,sections,layout,forms,motion}
   ├─ config/   site · navigation · social · contact · team   (única fuente de datos de marca)
   ├─ db/       schema/ · migrations/ · index.ts
   ├─ i18n/     routing · request · navigation
   ├─ lib/      db · email(+templates React Email) · security · seo · content · analytics
   ├─ messages/{es,en}.json
   ├─ schemas/  esquemas Zod compartidos cliente/servidor
   ├─ styles/   tokens.css · typography.css · materials.css · motion.ts
   ├─ env.ts    validación Zod de variables de entorno
   └─ proxy.ts (middleware en Next <16): locale + CSP + mantenimiento
```

- **Server Components por defecto**; `"use client"` solo en gestos, formularios, tema, menú, acordeón.
- **i18n:** `next-intl`, ES por defecto. Propongo **rutas localizadas** (`/es/servicios` ↔ `/en/services`) definidas en un único `routing.ts`, con `hreflang`/`alternates` derivados. Los MDX llevan `translationKey` para enlazar ES↔EN y poder tener slugs distintos por idioma. Preferencia de idioma en cookie `NEXT_LOCALE` (funcional, se documenta en Cookies).
- **Capa de contenido** `src/lib/content`: interfaz `getPosts/getPost/getProjects/...` sobre `gray-matter` + Zod; el resto del código nunca toca el filesystem, así que cambiar a un CMS luego = reescribir un adaptador.
- **Cero texto hardcodeado:** regla ESLint `react/jsx-no-literals` en `components/` + `check-i18n.ts` (paridad de claves ES/EN, corre en CI y en test unitario).
- **Placeholders:** todo dato inventado vive solo en `/content` y `/src/config`, con `placeholder: true` en el frontmatter (insignia visible "Ejemplo") y `pnpm check:placeholders` que lista lo pendiente de reemplazar.

### Flujo de formularios (contacto, propuesta, newsletter, waitlist)

Cliente (react-hook-form + Zod) → **Server Action** → verificación de Origin → honeypot → Turnstile (server-side) → rate limit por `ip_hash` (Upstash) → Zod de nuevo → Drizzle → Resend (aviso interno + confirmación bilingüe) → respuesta tipada sin detalles internos. Logging sin datos personales.

- **Newsletter/lead magnet, double opt-in:** se guarda solo el **hash SHA-256 del token** (el crudo va en el email, caduca en 48 h). El enlace GET abre una página con botón de confirmar (la acción POST confirma) para que los escáneres de correo no auto-confirmen. Baja en un clic con cabeceras `List-Unsubscribe` + `List-Unsubscribe-Post` (RFC 8058).
- **Checklist descargable:** el PDF **no vive en `/public`**; se sirve desde un route handler con token firmado de vida corta tras confirmar el email.

### Seguridad de cabeceras (punto delicado — ver D1)

CSP estricta, HSTS (2 años, `includeSubDomains`, `preload`), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` mínima, COOP `same-origin`, CORP `same-origin`, `frame-ancestors 'none'` + `X-Frame-Options: DENY`. Orígenes externos permitidos en CSP: Turnstile (`challenges.cloudflare.com`) y el script de analítica; Cal.com y WhatsApp son solo enlaces (sin embed). Server Actions: `allowedOrigins` explícito + comprobación propia de Origin en route handlers.

---

## 3. Modelo de datos (Drizzle + Postgres/Neon)

Todas: `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at` (trigger o `$onUpdate`).
IP nunca en claro: `ip_hash = HMAC-SHA256(ip, IP_HASH_SECRET)` truncado.

| Tabla                    | Columnas principales                                                                                                                                                                                                                                   | Índices                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `contact_messages`       | name, email, company?, subject, message, locale, ip_hash, user_agent (recortado), status enum(new/read/replied/spam), privacy_consent_at                                                                                                               | (status, created_at), (email) |
| `quote_requests`         | name, email, company, project_type enum(web_app/custom_software/security/consulting/other), services text[], budget_range enum, timeline enum, description, locale, ip_hash, status enum, privacy_consent_at                                           | (status, created_at), (email) |
| `newsletter_subscribers` | email **unique** (normalizado a minúsculas), locale, status enum(pending/confirmed/unsubscribed), confirm_token_hash, unsubscribe_token_hash, confirm_expires_at, confirmed_at, unsubscribed_at, source enum(footer/checklist/blog), marketing_consent | unique(email), (status)       |
| `waitlist`               | email **unique**, interests text[], locale                                                                                                                                                                                                             | unique(email)                 |

**Política de retención** (documentada y ejecutada por un cron de Vercel protegido con `CRON_SECRET`): `pending` sin confirmar → 7 días; `spam` → 30 días; mensajes/propuestas → 24 meses desde la última actividad; bajas → se conserva solo lo mínimo para no reenviar.

**Driver (D5, revisado en la Fase 4 — ver §14):** `drizzle-orm/neon-http` con `DATABASE_URL`; sin ella (por defecto en local y en todos los tests), Postgres embebido en memoria (`@electric-sql/pglite`), no `pg`. Solo se usan `batch`, no transacciones interactivas (limitación del driver HTTP).

---

## 4. Dependencias y justificación

_(Se verifica la última versión estable con `pnpm view` al iniciar la Fase 1 y se comprueba compatibilidad next-intl ↔ Next.)_

| Grupo            | Paquetes                                                                                                                                                                                                                | Por qué                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Base             | `next`, `react`, `react-dom`, `typescript` (strict)                                                                                                                                                                     | App Router, SSG/ISR                                                                             |
| Estilos          | `tailwindcss` v4 (+ `@tailwindcss/postcss`), `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`                                                                                                       | Tokens CSS-first (`@theme`) = encaja con "una sola fuente"; iconos consistentes                 |
| Primitivos a11y  | `radix-ui` (Dialog, Accordion, Popover, Tabs, VisuallyHidden)                                                                                                                                                           | Foco, ARIA y teclado resueltos; **sin** shadcn: sus estilos por defecto chocan con apple-design |
| Motion           | `motion`                                                                                                                                                                                                                | Springs con traspaso de velocidad, `drag`, `layout`, interrumpible                              |
| i18n             | `next-intl`                                                                                                                                                                                                             | Rutas localizadas, SSG, `hreflang`                                                              |
| Contenido        | `gray-matter`, `next-mdx-remote` (RSC), `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code` + `shiki`, `reading-time`                                                                         | MDX local de confianza con frontmatter validado por Zod; TOC desde headings                     |
| Validación/forms | `zod`, `react-hook-form`, `@hookform/resolvers`, `@t3-oss/env-nextjs`                                                                                                                                                   | Esquemas compartidos; env validado al arrancar                                                  |
| BD               | `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `@electric-sql/pglite` (sin `DATABASE_URL`)                                                                                                                   | Parametrizado por construcción; migraciones; ver D5/§14                                         |
| Email            | `resend`, `@react-email/render`                                                                                                                                                                                         | Plantillas propias, bilingües; `@react-email/components` está descatalogado — ver §14           |
| Anti-abuso       | `@upstash/ratelimit`, `@upstash/redis`, `@marsidev/react-turnstile`                                                                                                                                                     | Rate limit serverless; Turnstile en cliente                                                     |
| SEO              | `schema-dts` (tipos JSON-LD), `next/og` (incluido), `sharp` (script de favicons)                                                                                                                                        | OG dinámico, iconos desde el logo                                                               |
| Observabilidad   | `@vercel/speed-insights` + Umami o Plausible (script, ver D3)                                                                                                                                                           | Sin cookies                                                                                     |
| Calidad          | `eslint` (flat) + `eslint-config-next` + `eslint-plugin-jsx-a11y`, `prettier` + `prettier-plugin-tailwindcss`, `husky`, `lint-staged`, `vitest` + `@testing-library/react`, `@playwright/test` + `@axe-core/playwright` | Requisitos de calidad                                                                           |
| CI/deps          | GitHub Actions, Dependabot, `pnpm audit --prod --audit-level=high`                                                                                                                                                      | Requisito                                                                                       |

No se añade: Vaul (el sheet propio mantiene motion en una sola fuente; queda como plan B), Embla (solo si el carrusel móvil de proyectos lo justifica en la Fase 5), next-themes (ver CSP).

---

## 5. Decisiones y propuestas (aprobar = acepto los valores recomendados)

- **D1 — CSP con nonces vs. generación estática — RESUELTO (Fase 1).** El spike demostró que **no es posible** tener CSP estricta y páginas estáticas en Next 16.3: con Turbopack _y_ con webpack, `experimental.sri` no añade `integrity` a los scripts y Next sigue emitiendo scripts inline (payload RSC `self.__next_f.push`) sin hash, que la CSP sin `unsafe-inline` bloquea → la hidratación falla (React #412). **Decisión (tuya): nonces + render dinámico.** `src/proxy.ts` genera un nonce por petición, construye la CSP (`script-src 'self' 'nonce-…' 'strict-dynamic'`, sin `unsafe-inline`/`unsafe-eval` en producción) y la pasa a Next, que la aplica a sus scripts; `app/[locale]/layout.tsx` lee el nonce (`headers()`) para el script de tema. Coste asumido: sin SSG/ISR ni caché de CDN en las páginas (siguen siendo renderizado en servidor rápido en Vercel); PPR incompatible. Las demás cabeceras (HSTS, COOP, CORP, etc.) son estáticas en `next.config.ts`. Verificado en Chromium real (`tests/e2e/smoke.spec.ts`): cero violaciones de CSP, nonce distinto por petición, todo `<script>` lleva nonce.
- **D2 — Logo.** Lo ideal es que me pases el **SVG original**. Si no existe, vectorizo el PNG (dos capas de color, con `potrace` puntual) y lo reviso visualmente contigo. Genero: isotipo con `currentColor`, variante clara/oscura, favicon con padding cuadrado, `apple-touch-icon` 180, iconos del manifest 192/512 (maskable) y OG base.
- **D3 — Analítica.** Recomiendo **Umami** (plan cloud gratuito o autoalojado) por coste; Plausible si prefieres. Ambos detrás de una variable de entorno y un único componente.
- **D4 — Rutas localizadas** (`/es/servicios`). Mejor SEO; añade algo de configuración. Alternativa: mismos slugs en ambos idiomas.
- **D5 — Driver dual de BD** (Neon HTTP en prod / `pg` en local y CI) para poder correr tests e2e con un Postgres de servicio en GitHub Actions.
- **D6 — Tipografía Inter + JetBrains Mono** en lugar de la fuente del sistema (razón: consistencia multiplataforma + eje óptico).
- **D7 — Alcance v1:** sin panel de administración (los leads se consultan en Neon/Drizzle Studio y llegan por email); newsletter = **captura + confirmación**, no envío de campañas.
- **D8 — Contenido real que sí escribo:** la checklist de seguridad web es contenido genérico legítimo (no datos falsos), pero **debes revisarla** antes de publicarla. Casos de estudio, equipo y testimonios: solo placeholders marcados.
- **D9 — Legal:** plantillas genéricas (no asumo jurisdicción); recordatorio explícito de revisión por abogado en README y en cada página legal (aviso visible).
- **D10 — Git:** la carpeta no es repo. En la Fase 1 hago `git init` y un commit por fase con `feat:/fix:/chore:` (sin remoto; tú lo añades).
- **Datos que necesitaré tú (irán a `.env`/`config`, con placeholder mientras tanto):** dominio, email de contacto y de seguridad, número de WhatsApp, URL de Cal.com, claves Turnstile/Resend/Upstash/Neon, clave PGP opcional para `security.txt`.

---

## 6. Fases (checklist)

Cada fase termina con `pnpm lint` + `typecheck` + `build`, arreglo de errores, resumen, actualización de este checklist y **un commit** (`feat:` / `fix:` / `chore:`). apple-design se consulta en las fases con UI (1, 2, 3, 4, 5).

- [x] **Fase 0 – Plan** — este documento (aprobado).
- [x] **Fase 1 – Base**: pnpm + `git init`; Next/TS strict/Tailwind v4; ESLint/Prettier/Husky/lint-staged; Vitest/Playwright configurados; CI + Dependabot; `env.ts` + `.env.example` documentado; next-intl + routing + proxy (locale, mantenimiento); **tokens.css / motion.ts / materials**; script de contraste; layout (header translúcido, footer, selector de idioma, tema, menú-sheet con gestos, skip-link); cabeceras de seguridad (resultado del spike D1); assets de marca (D2); `docs/ARCHITECTURE.md` y `docs/DESIGN.md` iniciales.
- [x] **Fase 2 – Contenido estático**: Home (hero, franja de servicios, "Por qué DaeTrym", proceso, proyectos destacados, stack, FAQ, CTA, waitlist), Servicios (índice + 4 detalles con problema→solución→proceso→entregables→FAQ→CTA), Ciberseguridad (OWASP/NIST/PTES + aviso de autorización escrita), Nosotros, Proceso, Legal (3, con aviso), `/security` + `security.txt`, 404/500/mantenimiento.
- [x] **Fase 2.5 – Rediseño visual "Glass + Primer"** (fuera del plan de fases original, pedida por el usuario tras revisar la Fase 2; decisiones en §11):
  - [x] **Paso 1**: tokens nuevos (siete escalas de color, tipografía compacta, radios, vidrio), componentes base (`Button`, `Card`, `Badge`, `Banner`, `Field`, `Tabs`, `Tooltip`…) y Home completa (ES/EN, oscuro/claro, móvil/escritorio); `check:contrast` cubre los materiales nuevos.
  - [x] **Ajuste tras revisión**: balance de color (los botones secundarios y los resplandores de fondo ya no eran siempre verde) y unificación de radios en el header (píldora dentro, radio pequeño fuera); `SectionGlow` (resplandor por sección) sustituye al fondo fijo al viewport.
  - [x] **Paso 2**: mismo sistema en Servicios (índice + 4 detalles, cada uno con el tono de su servicio), Ciberseguridad, Nosotros, Proceso, legales/`/security` (un tono por documento, sin resplandor — priorizan la lectura), 404 y mantenimiento (además corregido: le faltaba el compensado del header flotante). Los componentes de blog y proyectos (`PostCard`, `ProjectCard`, `Tabs`, `Badge`) ya están en este estilo para que la Fase 3 los reutilice directamente; los 5 stubs «en construcción» (`ComingSoon`) adelantan el tono que tendrá cada sección real.
- [x] **Fase 3 – MDX**: capa `lib/content` (Zod de frontmatter, `cache()` por petición); blog con categorías, tags, tiempo de lectura, tabla de contenidos con scroll-spy, relacionados, feed RSS por idioma e imagen OG dinámica — 2 posts/idioma; proyectos con filtro por categoría y detalle — 3 casos/idioma (`featured` alimenta los 3 de la Home, que ya no usa `src/config/projects.ts` para los datos). Decisiones en §13.
- [x] **Fase 4 – Backend**: esquema Drizzle (`contact_messages`, `quote_requests`, `newsletter_subscribers`, `waitlist`) + migración inicial; Server Actions de contacto, propuesta multi-paso (asistente de 4 pasos con `motion`), newsletter (double opt-in) y lista de espera de la Home; emails con plantillas propias (ES/EN, sin `@react-email/components` — ver §14) con aviso interno + confirmación; Turnstile (clave de pruebas de Cloudflare fuera de producción) + honeypot + límite de envíos (Upstash, sin límite si no está configurado); retención de datos vía cron protegido; página de Recursos con la checklist de seguridad web como lead magnet (descarga con token firmado); botón flotante de WhatsApp. Decisiones en §14.
- [x] **Fase 5 – SEO y pulido**: JSON-LD (Organization, WebSite, Service, BlogPosting, BreadcrumbList, FAQPage) en todas las páginas con desglose de miga de pan o FAQ propios; `sitemap.ts`/`robots.ts`/`manifest.ts` multi-idioma con hreflang `es`/`en`/`x-default`; imagen Open Graph dinámica por ruta (13 nuevas) sobre `next/og`; analítica sin cookies detrás de una variable de entorno (Umami por defecto, adaptable a Plausible) y Vercel Speed Insights; corrección de contraste (botón de WhatsApp) y del tema del widget de Turnstile detectados en la pasada de pulido. Decisiones en §15.
- [ ] **Fase 6 – Pruebas y despliegue**: unitarias y e2e (contacto, propuesta, double opt-in, idioma, menú por teclado, axe); auditoría Lighthouse/securityheaders; `docs/DEPLOY.md`; `docs/SECURITY.md`; README final.

---

## 7. Riesgos

1. **D1 (CSP vs SSG)** — el mayor riesgo técnico; se resuelve con spike antes de construir sobre él.
2. **Transiciones de salida entre páginas** en App Router son frágiles con `AnimatePresence`; uso entrada con spring + View Transitions como mejora progresiva, y lo reporto si no queda estable.
3. **`backdrop-filter` en móviles de gama baja** puede costar rendimiento; hay degradación y presupuesto de blur.
4. **Lighthouse ≥ 95 con JS de motion + Turnstile:** Turnstile se carga solo al interactuar con un formulario; `motion` con imports acotados (`LazyMotion`/`m`) donde aplique.
5. **Resend en producción** requiere dominio verificado; hasta entonces solo envía a tu propio correo (queda en la guía de despliegue).
6. **Versiones:** Next/next-intl/Tailwind pueden haber cambiado desde mi conocimiento; las verifico contra npm al empezar.

---

## 8. Verificación (criterios de aceptación)

- Por fase y al final: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` sin errores.
- `pnpm dev` y recorrido manual ES/EN de todas las rutas; cada formulario e2e (Turnstile con claves de prueba de Cloudflare, Resend en modo log en local, Postgres local) verificando fila en BD y emails.
- Lighthouse móvil ≥ 95 (4 categorías) en Home y un post; axe sin violaciones; securityheaders.com A/A+; validador de `security.txt`.
- `check-i18n` (paridad de claves) y `jsx-no-literals` limpios; `check-placeholders` lista lo pendiente.
- Revisión manual de motion con `prefers-reduced-motion`, `prefers-reduced-transparency` y `prefers-contrast: more`, y grabación a cámara lenta de interrupciones (agarrar el sheet a mitad de cierre).
- Un dev nuevo levanta el proyecto solo con el README.

---

## 9. Registro de decisiones (Fase 1)

Cambios respecto al plan original, con su motivo:

| Tema                  | Plan                         | Realidad / decisión                                                                                                                                                                                                    |
| --------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSP                   | hashes + SRI, sitio estático | **Nonces + render dinámico** (ver D1).                                                                                                                                                                                 |
| Versiones             | "última estable"             | Next 16.3.5, React 19.3, Tailwind 4.3, next-intl 4.14, Zod 4.6, motion 13, Vitest 5. **TypeScript fijado en 6.0** (typescript-eslint aún no soporta 7) y **ESLint en 9** (los plugins de React/a11y no soportan 10).   |
| Idioma en servidor    | `setRequestLocale`           | Next 16.3 trae **`next/root-params`** y next-intl marca `setRequestLocale` como obsoleto: `src/i18n/request.ts` lee el idioma del segmento raíz `[locale]`. Un `locale` explícito (metadata, RSS, OG) tiene prioridad. |
| Middleware            | `middleware.ts`              | Next 16 lo llama **`proxy.ts`**.                                                                                                                                                                                       |
| Tema                  | next-themes                  | Script inline propio de 1 línea con nonce (sin dependencia).                                                                                                                                                           |
| Logo                  | PNG opaco                    | **Vectorizado** a SVG en dos capas (engranaje verde + trazos en `currentColor`): `public/brand/logo-mark-{dark,light}.svg`, componente `LogoMark`. El original no incluye wordmark: "DaeTrym" se compone como texto.   |
| Enlaces de navegación | —                            | Apuntan a páginas de la Fase 2; hasta entonces dan 404 y el prefetch de `next/link` lo registra en consola (los e2e lo toleran de forma explícita).                                                                    |
| `.env.local`          | —                            | Para desarrollo local copiar `.env.example`; en producción/CI las variables obligatorias deben existir o la build falla (intencionado).                                                                                |

Bugs reales encontrados y corregidos durante la fase (cubiertos por tests para que no vuelvan):

1. `tailwind-merge` trataba `text-small`/`text-body` como colores y borraba `text-on-accent` → texto blanco sobre verde (2.43:1). Detectado por axe. Arreglado en `src/lib/cn.ts`.
2. El sheet móvil se quedaba fuera de pantalla (x = 9999): Radix Portal monta el contenido tras el primer commit y un `useLayoutEffect` corría con el nodo aún nulo. Arreglado con un callback ref.
3. El foco no volvía al botón del menú tras cerrar (los toques no siempre enfocan el botón). Ahora se devuelve explícitamente.
4. Una pausa antes de soltar el dedo se interpretaba como un lanzamiento (velocidad calculada solo con los últimos movimientos). Ahora es velocidad 0.
5. Contraste: el estado _pressed_ del botón en tema claro oscurecía el verde bajo texto oscuro (4.34:1). Detectado por `pnpm check:contrast`.

Pendiente de verificar en dispositivo real: el blur del sheet (ver `docs/DESIGN.md → Limitaciones`).

---

## 10. Registro de decisiones (Fase 2)

| Tema                           | Plan                             | Realidad / decisión                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mensajes                       | un `es.json` y un `en.json`      | **Un fichero por área** en `src/messages/<locale>/` (`home`, `services`, `cybersecurity`, `about`, `process`, `legal`, `security`, `errors`, `common`), fusionados y tipados en `<locale>/index.ts`. Los textos de esta fase suman ~750 claves; un solo JSON era inmanejable. `pnpm check:i18n` compara también la **longitud de las listas**.                                                                                                                                                         |
| Contenido de servicios / legal | MDX en `content/`                | Viven en `messages` como datos estructurados y se **validan con Zod** (`src/schemas/page-content.ts`) al renderizar y en los tests. MDX se reserva para contenido largo y editorial (blog y proyectos, Fase 3).                                                                                                                                                                                                                                                                                        |
| Rutas de servicio              | —                                | Slugs **iguales en ambos idiomas** (`web-apps`, `custom-software`, `cybersecurity`, `consulting`): el selector de idioma conserva la ruta sin tabla de traducción de slugs.                                                                                                                                                                                                                                                                                                                            |
| Secciones futuras              | 404 hasta su fase                | Contacto, propuesta, proyectos, blog y recursos son páginas **«en construcción»** (`ComingSoon`, `noindex`) para que los CTAs principales no lleven a un 404. Se eliminan al construir cada sección.                                                                                                                                                                                                                                                                                                   |
| Lista de espera                | formulario                       | Hasta la Fase 4 el botón abre un `mailto:` con el asunto precompletado (honesto y funcional).                                                                                                                                                                                                                                                                                                                                                                                                          |
| Datos de ejemplo               | solo config                      | Equipo, proyectos, stack, redes y fecha legal en `src/config/*` (marcados `PLACEHOLDER` / `placeholder: true`, con distintivo «Ejemplo» en pantalla). Los datos pendientes de los textos legales usan `[COMPLETAR: …]` / `[COMPLETE: …]`, resaltados en ámbar. Los avisos de borrador se ocultan con `siteConfig.draftNotices = false`. `pnpm check:placeholders` lo lista todo. **No hay cifras, clientes ni testimonios inventados** (un test lo comprueba).                                         |
| Header                         | navegación completa desde 768 px | Desde **1024 px** (`lg`). Entre 768 y ~1000 px la barra completa no cabe; móvil y tablet usan el sheet lateral.                                                                                                                                                                                                                                                                                                                                                                                        |
| 404                            | `not-found.tsx` + `[...rest]`    | En render dinámico, un `notFound()` lanzado desde una página hace que Next recurra al **renderizado en cliente** (HTML vacío sin JS; estado 404 y `noindex` sí correctos). El proxy detecta las URLs inexistentes con la tabla de rutas de next-intl (`src/lib/routes.ts`) y las **reescribe a una página 404 real** con estado 404: contenido en el HTML, con o sin JavaScript. `not-found.tsx` queda como red de seguridad. Al añadir blog/proyectos, registrar su validador de slug en `routes.ts`. |
| Matcher del proxy              | excluía prefetch                 | Los prefetch de `next/link` **deben** pasar por el proxy: con rutas localizadas necesitan el reescrito de next-intl (si no, 404).                                                                                                                                                                                                                                                                                                                                                                      |
| security.txt                   | —                                | Handler estático con `Expires` calculado en cada build (330 días; RFC 9116 exige < 1 año): hay que **redesplegar al menos una vez al año**.                                                                                                                                                                                                                                                                                                                                                            |
| Ficheros generados             | —                                | `next dev` (16.3) crea `AGENTS.md` y `CLAUDE.md` con reglas para agentes de IA que apuntan a la documentación local de Next; se conservan (Next lo recomienda). Se desactivan con `agentRules: false`.                                                                                                                                                                                                                                                                                                 |

Bugs reales encontrados por las pruebas durante la fase (todos corregidos y cubiertos):

1. **Desbordamiento horizontal en tablet** (todas las páginas): la cabecera completa no cabía a 820 px. Detectado por el test de responsive; ahora el sheet cubre hasta 1024 px.
2. **Desbordamiento en móvil** en `/proceso` (etiqueta de duración `nowrap`) y en el detalle de ciberseguridad (botón con etiqueta larga `nowrap`).
3. **Saltos de encabezado** (h1 → h3) en Servicios y Proceso: se añadió un h2 accesible a cada lista.
4. **Prefetch 404** por el matcher del proxy (ver arriba).
5. **404 sin contenido en el servidor** (ver arriba).
6. `fill-mode: both` del revelado pisaba el feedback de pulsación (`.press:active`) de las tarjetas → `backwards`.

Corrección posterior a la fase (informe: «no funcionan los botones de tema e idioma»). Dos causas independientes:

7. **Idioma y tema escondidos entre 640 y 1023 px.** Al mover la navegación al sheet hasta 1024 px (punto 1) también se ocultaron esos dos controles del header. Ahora se muestran desde 640 px (`sm`) y solo por debajo viven únicamente dentro del sheet. Test de regresión a 1000 px en `smoke.spec.ts`.
8. **`next dev` abierto por `127.0.0.1` o por la IP de la red local no hidrataba** (Next bloquea los recursos de desarrollo de orígenes distintos de `localhost`): la página se veía pero ningún botón respondía. `allowedDevOrigins` en `next.config.ts` (solo afecta a `next dev`; `next start` y producción no cambian).

Pendiente de contenido (lo lista `pnpm check:placeholders`): historia real de la empresa, equipo, proyectos, redes, datos legales (`[COMPLETAR]`), plazos y puerto seguro de la política de divulgación, confirmación del stack y de los tiempos orientativos del proceso, y revisión legal de las tres plantillas.

---

## 11. Registro de decisiones (Rediseño "Glass + Primer")

El usuario pidió un rediseño visual completo (2026-09-21): el resultado de apple-design aplicado a color/tipografía/espaciado usaba casi solo verde y negro, letras demasiado grandes y tarjetas con poco padding. Ver `docs/DESIGN.md` para el detalle completo; aquí solo las decisiones que no revertir sin consultar.

- **apple-design se acota al movimiento.** Deja de decidir color, tipografía, espaciado y estilo general; sigue gobernando springs, gestos y `prefers-reduced-motion`. Los valores visuales salen de `docs/DESIGN.md` + `src/styles/`.
- **Siete escalas de color (50–900)**, no solo verde: cada componente que necesita un tono con intención (servicio, categoría, estado) recibe un `hue?: Hue` y usa las utilidades `bg-h-tint`/`text-h-fg`/`border-h-line` de la clase `.hue-<tono>` que envuelve. El verde de marca sigue siendo el único color de CTAs primarios y foco.
- **`scripts/check-contrast.ts` se reescribió**: antes de este cambio ya cubría materiales; ahora además compone el vidrio sobre cada resplandor de fondo (no sobre los tres apilados — en pantalla no se superponen, son radiales en esquinas distintas) y sobre los siete tonos y sus tintes. 1738 pares verificados (antes 114).
- **`tests/unit/tokens.test.ts` gana un guardarraíl**: recorre `src/components` y `src/app` y falla si aparece un color hex suelto fuera de `logo-mark.tsx` (el isotipo de marca, la única excepción legítima).
- **Nueva fuente**: Instrument Serif (cursiva) como acento editorial de UNA palabra por título (`AccentText`, marcado `*palabra*` en el texto de mensajes). No sustituye a Inter en ningún otro sitio.
- **Alcance del Paso 1**: solo tokens, componentes base (`Button`, `Card`, `Badge`, `Banner`, `Field`, `Tabs`, `Tooltip`…) y la Home. El resto de páginas (Servicios, Ciberseguridad, Nosotros, Proceso, legales, 404, mantenimiento) sigue con los nombres de utilidad de la Fase 2, que la nueva paleta sigue resolviendo correctamente (ver el aviso al final de `docs/DESIGN.md`) — se completa en el Paso 2, solo cuando el usuario lo apruebe.

---

## 12. Registro de decisiones (Rediseño "Glass + Primer" — ajuste y Paso 2)

Tras el Paso 1 el usuario pidió un ajuste (el verde seguía dominando y el botón del header desentonaba del resto de la píldora) y después aprobó extender el sistema al resto del sitio. Decisiones que no revertir sin consultar:

- **`SectionGlow` sustituye al fondo fijo al viewport.** El Paso 1 pintaba tres resplandores (`body::before`, `position: fixed`) que se veían igual en toda la página sin importar la sección. Ahora cada `Section`/`PageHero`/`CtaBand`/`ComingSoon` admite `glow?: [Hue, Hue]`: dos manchas radiales dentro de SU propia caja, que scrollean con el contenido. Los tokens `--glow-1/2/3` se eliminaron; la intensidad vive en `--glow-alpha` (un valor por tema). `scripts/check-contrast.ts` prueba cada uno de los 7 tonos como canvas individual (el peor caso real, ya que los dos círculos de un mismo `SectionGlow` casi no se solapan) — 3114 pares verificados.
- **Balance de color en `Button`.** `secondary`/`ghost` dejaron de ser neutros: usan `text-h-fg`/`border-h-line`, es decir, heredan el tono de la `Section` que los envuelve o el prop `hue` explícito cuando no hay ninguna alrededor (`BookCallButton` en cada hero y en `CtaBand`). `primary` (verde sólido) sigue reservado al CTA principal.
- **Dos radios con propósito** (documentados en `docs/DESIGN.md`): píldora (`rounded-full`) para todo lo que vive dentro del header flotante y para `LanguageSwitcher`/`ThemeToggle` en cualquier contexto; radio pequeño para el resto. El botón `Solicitar propuesta` del header pasa `className="rounded-full"` explícito.
- **Una identidad de color por página**, no solo por sección suelta: cada página del Paso 2 fija un `hue` de página que se hereda a lo largo de toda ella (eyebrows, enlaces, botones sin tono propio), y varía el segundo tono del resplandor entre sus propias secciones para no repetir combinación ni con otras páginas:
  - Servicios (índice): violeta. Cada detalle de servicio usa el tono de SU servicio (`serviceHues`: web-apps cian, software a medida violeta, ciberseguridad verde, consultoría ámbar) en toda la página, con un segundo tono distinto en el hero y en "otros servicios".
  - Ciberseguridad: verde (mismo tono que el servicio homónimo y que `/security`). Los 5 tipos de alcance y las 3 metodologías llevan cada uno su propio tono (p. ej. rojo para "respuesta a incidentes": intención, no decoración).
  - Nosotros: magenta. Proceso (página completa): azul — distinto del magenta que usa la mini-sección "Proceso" de la Home, para que la página tenga su propia identidad.
  - Legales (`LegalDocument`, cubre privacidad/términos/cookies/`/security`): un tono por documento (privacidad azul, términos violeta, cookies ámbar, `/security` verde) limitado a marcadores de lista, enlaces e índice activo — **sin `SectionGlow`**: es texto largo para leer, prioriza la legibilidad. `text-body` de los bloques pasa a `text-prose` (16 px, leading 1.7).
  - 404: ámbar (ya lo era desde el Paso 1) + resplandor ámbar/violeta. Mantenimiento: ámbar + resplandor ámbar/azul; además se le añadió `.page-top`, que le faltaba (el contenido quedaba parcialmente bajo el header flotante — bug real, no solo de estilo).
  - Blog y proyectos (aún sin contenido, Fase 3): los 5 stubs `ComingSoon` (blog, proyectos, contacto, recursos, solicitar propuesta) ya reciben `hue`/`glow` adelantando el tono que tendrá cada sección real (blog cian, proyectos violeta…); `PostCard`/`ProjectCard` (en `components/sections/cards.tsx`) ya están en este estilo — la Fase 3 los reutiliza tal cual, sin rehacerlos.
- **`FeatureCard`/`TeamCard` ganan un prop `surface`** (`panel` por defecto, `glass` en bandas `tone="raised"`) para no depender de `className="bg-surface-2"` (token de la Fase 2, ya no es el patrón a seguir).

---

## 13. Registro de decisiones (Fase 3 — MDX)

- **Slugs en un registro aparte, no derivados del filesystem.** `src/config/content-slugs.ts` (`blogSlugs`/`projectSlugs`, arrays fijos) es la fuente que usa `src/lib/routes.ts` para validar `/blog/[slug]` y `/projects/[slug]` — igual que `serviceSlugs`. Tiene que ser una constante porque `routes.ts` lo usa `src/proxy.ts`, que corre en el runtime **Edge** (sin `fs`); la lectura real de los `.mdx` (`src/lib/content/{blog,projects}.ts`) solo se usa en Server Components/route handlers (Node), nunca en el proxy. `tests/unit/content.test.ts` falla si un slug del registro no tiene `.mdx` en los dos idiomas, o al revés.
- **Tema de Shiki reconstruido a mano, no un tema de fábrica.** Shiki ≥ 3 retiró el tema `css-variables` (colores con `var(--x)` en vez de hex fijos, pensado exactamente para "traer tu propia paleta"). `src/lib/content/shiki-theme.ts` define un tema TextMate mínimo cuyos colores son literalmente las cadenas `var(--shiki-token-*)`; esas variables se definen en `tokens.css` (una por tema) apuntando a los 7 tonos existentes. El resaltado de código sale de la misma paleta que el resto del sitio, no de un tema ajeno.
- **Ancla de cada título accesible, no solo visual.** `rehype-autolink-headings` añade un enlace `#` tras cada h2/h3; a diferencia del patrón más común (`aria-hidden` + inalcanzable por teclado), aquí es un `<a>` real con `aria-label` (clave `common.content.headingAnchor`, compartida entre blog y proyectos) e invisible solo por opacidad — visible con `:hover`, `:focus-within` del título o `:focus-visible` propio, así que sigue siendo alcanzable con Tab.
- **La tabla de contenidos y el resaltado de sintaxis reutilizan `github-slugger` y evitan una doble fuente de ids.** `src/lib/content/headings.ts` extrae los h2/h3 del markdown en bruto con una instancia de `GithubSlugger` nueva por documento, llamando a `.slug()` en el mismo orden que `rehype-slug` (incluidos los niveles que no aparecen en la tabla de contenidos, para que el contador de duplicados no se desincronice). Limitación asumida: si un título llevara `` `código` `` o `**negrita**` el id no coincidiría exactamente — los títulos de `/content` son siempre texto plano por eso.
- **`isKnownPath` gana un caso especial para las rutas de metadatos de Next** (`opengraph-image`, `icon`…). Next las sirve en la carpeta interna tal cual está en disco (`/projects/[slug]/opengraph-image-<hash>`, en inglés) sin pasar por la localización de next-intl, así que para una visita en español (`/es/proyectos/...`) la imagen OG real vive en `/es/projects/.../opengraph-image-...` — un segmento de más y en el idioma "equivocado". Se detectó como bug real (imagen OG del proyecto en español devolvía 404) y se corrigió: para un segmento final que empiece por un nombre de convención de Next, `isKnownPath` valida el resto de la ruta contra la plantilla de CUALQUIER idioma, no solo el del prefijo de la URL.
- **Colores de la imagen OG, literales y en `src/lib`, no en `src/app`/`src/components`.** `next/og` (Satori) no entiende `var(--token)`, así que `src/lib/og.tsx` usa hex fijos correspondientes al tema oscuro (una imagen OG no sabe qué tema prefiere quien la ve). Vive fuera de `src/app`/`src/components` a propósito: el guardarraíl de `tests/unit/tokens.test.ts` que prohíbe hex sueltos solo recorre esas dos carpetas.
- **RSS sin dependencia nueva.** `src/lib/content/rss.ts` construye el XML a mano (con su propio `escapeXml`) y resuelve `/blog`/`/blog/[slug]` localizados leyendo `routing.pathnames` directamente, sin pasar por `@/i18n/navigation` — esa capa arrastra `next/navigation`, que no resuelve en Vitest (rompía `tests/unit/content.test.ts`) y aquí no hace falta nada de lo que aporta.
- **Relacionados por categoría + etiquetas compartidas**, no solo categoría: con pocos posts por categoría, exigir la misma categoría habría dejado la sección vacía casi siempre. Score = +2 misma categoría, +1 por cada etiqueta en común; se excluye el propio post y los que no comparten nada.
- **La Home deja de tener sus propios datos de proyecto.** `src/config/projects.ts` pierde `featuredProjects`/`FeaturedProject` (conserva `ProjectCategory`/`projectHues`); la Home llama a `getFeaturedProjects(locale)` igual que la página `/projects`, así que hay una sola fuente para "qué proyectos existen". `ProjectCard` pasa de recibir un objeto `Localized` a recibir strings ya resueltos (como `PostCard`), y ahora enlaza al caso completo (antes no enlazaba a ningún sitio).
- **Bug real detectado por el propio guardarraíl de enlaces:** el post en español sobre autorización enlazaba a `/cybersecurity` (el segmento en inglés) en vez de `/ciberseguridad`. Corregido, y `tests/unit/content.test.ts` gana un test que recorre los enlaces internos de cada post/caso y los valida con `isKnownPath` en su propio idioma, para que este tipo de error no vuelva a pasar en silencio.

---

## 14. Registro de decisiones (Fase 4 — Backend)

- **Driver de base de datos embebido, siempre en memoria (D5 revisado).** El plan original (D5) proponía `pg` para local/CI/tests, pensado para un Postgres de servicio en GitHub Actions. Este entorno no tiene Docker ni un Postgres local, así que se sustituyó por `@electric-sql/pglite` (Postgres real compilado a WebAssembly, sin servidor ni cuenta): sin `DATABASE_URL`, `src/db/index.ts` migra y consulta una base embebida — mismo dialecto SQL y mismas migraciones que Neon en producción, así que sigue siendo una verificación real, no un mock. Se probó primero una variante persistida en disco (`.data/dev.pglite`) para que los datos sobrevivieran a un reinicio de `pnpm dev`; se descartó por un bug real: `next build` ejecuta "Collecting page data" con **varios workers en paralelo**, y cada uno importa `src/db/index.ts` por separado — todos abriendo el mismo directorio en disco a la vez producían un `ENOTDIR` intermitente en el sistema de archivos WASM de PGlite (no soporta varios procesos sobre el mismo `dataDir`). La versión en memoria no tiene ese problema (cada proceso es independiente) a cambio de no persistir entre reinicios; para datos que sobrevivan hay que usar una rama de desarrollo real de Neon (`DATABASE_URL`). `@electric-sql/pglite` se añadió a `serverExternalPackages` (`next.config.ts`): al ser WASM + acceso a `fs` de Node, que Turbopack lo incluya en el bundle rompe su resolución interna de rutas (usa `import.meta.url`); fuera del bundle, con `require()` nativo, funciona.
- **`DATABASE_URL` no es obligatoria ni siquiera en el sentido de `isProd` del resto de `env.ts`.** `next build`/`next typegen` corren con `NODE_ENV=production` igual que un despliegue real en Vercel, así que exigir esta variable con el mismo patrón `isProd ? required : default` que el resto habría roto `pnpm build`/`pnpm typecheck` en local sin una cuenta de Neon — justo lo que el motor embebido existe para evitar. Es la única variable de esta fase sin ese patrón; su obligatoriedad real en un despliegue de verdad queda documentada para `docs/DEPLOY.md` (Fase 6), no forzada por Zod.
- **`@react-email/components` está descatalogado.** El paquete (y sus ~19 subpaquetes, `@react-email/button`, `@react-email/section`…) aparece en npm como "no longer supported" desde el propio equipo de Resend — se comprobó que no es un caso de typosquatting (el `repository` en npm apunta al monorepo oficial `resend/react-email`), simplemente dejaron de mantener la librería de componentes. Los emails se escriben con HTML llano (`src/lib/email/layout.tsx`, `templates.tsx`, `internal-templates.tsx`) — tablas y estilos en línea, lo único fiable entre clientes de correo — y se renderizan con `@react-email/render` (el paquete núcleo, sí mantenido), que Resend también acepta pasando directamente el JSX (`react:` en `resend.emails.send`).
- **Modo simulado sin cuenta externa, igual en Resend/Upstash/Turnstile.** Los tres funcionan sin credenciales fuera de producción:
  - **Resend:** sin `RESEND_API_KEY`, `src/lib/email/client.ts` registra el asunto y el texto del email en consola en vez de enviarlo — se puede seguir el flujo completo sin cuenta.
  - **Upstash:** sin `UPSTASH_REDIS_REST_URL`/`_TOKEN`, `src/lib/security/rate-limit.ts` deja pasar todos los envíos (con un aviso una sola vez en consola). Obligatorio de verdad en producción para que el límite de envíos sea real.
  - **Turnstile:** fuera de producción, `TURNSTILE_SECRET_KEY`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY` usan por defecto las claves de PRUEBA públicas de Cloudflare que siempre aprueban (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`, documentadas por Cloudflare para pruebas automatizadas). A diferencia de Resend/Upstash, esto no es un atajo simulado: el widget real se carga desde Cloudflare y se verifica de verdad en el servidor, así que el camino completo (incluida la llamada a `challenges.cloudflare.com`) se ejerce en desarrollo y en los e2e sin ninguna cuenta.
- **Formularios con `react-hook-form` + `zodResolver`, llamando a la Server Action directamente (no `<form action>` + `useActionState`).** Los datos no son planos (arrays de checkboxes, un asistente de varios pasos con validación parcial por paso vía `trigger()`), así que se llama a la acción como una función async normal dentro de `startTransition` en vez de depender de `FormData`. Los controles de Radix (`Checkbox`, `RadioGroup`) no son `<input>` nativos — no tienen un evento `onChange` de DOM, solo `onCheckedChange`/`onValueChange` — así que se conectan con `Controller`, no con `register()`; el honeypot sí es un `<input>` de verdad y usa `register()` normal.
- **Enlace de baja del newsletter: firma HMAC determinista, no un token guardado.** El diseño inicial guardaba solo el hash del token de baja (igual que el de confirmación). Es un error real que se detectó durante la implementación: el token de confirmación se usa UNA vez, justo después de generarlo, así que guardar solo su hash funciona; pero el enlace de baja tiene que poder incluirse en CUALQUIER email futuro de ese suscriptor (RFC 8058), y con solo el hash guardado no hay forma de recuperar el valor crudo pasado ese primer momento. Se sustituyó por una firma HMAC determinista sobre el email (`src/lib/security/newsletter-token.ts`, mismo patrón que el token de descarga, con su propio prefijo de dominio del HMAC) — se puede recalcular igual en cualquier momento, así que no hace falta guardar nada ni la tabla necesita la columna `unsubscribe_token_hash` que el plan original preveía.
- **Sin panel de Origin/CSRF propio para las Server Actions.** El plan (§3) preveía "verificación de Origin" como paso explícito del flujo. Next ya compara `Origin` contra `Host` en cada Server Action (protección de framework, ver `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` § Security) — añadir una comprobación propia habría sido redundante. Sí hace falta protección propia en los ROUTE HANDLERS (`/api/*`, que no llevan esa comprobación automática): ahí la autorización es el propio token firmado (descarga, confirmación/baja) o el secreto de cron, no el Origin.
- **Descarga del recurso: documento Markdown descargable, no un PDF.** El plan mencionaba "el PDF" de pasada; generar un PDF de verdad habría añadido una dependencia nueva solo para eso. `content/resources/web-security-checklist.{es,en}.md` es contenido genérico legítimo (D8: checklist de seguridad web basada en OWASP/NIST, con aviso de que hay que revisarla antes de publicarla) servido como descarga (`Content-Disposition: attachment`) desde `/api/resources/download`, nunca desde `/public` — el token que lo protege es una firma HMAC de vida corta (1 hora) sobre el email, emitida solo tras confirmar la suscripción, reutilizando `IP_HASH_SECRET` con un prefijo de dominio distinto al del HMAC de baja (mismo secreto, dos usos que nunca se confunden — evita pedir una variable de entorno más solo para esto).
- **Enums inventados donde el plan no los detallaba.** `budget_range` (`lt_5k`/`5k_15k`/`15k_40k`/`gt_40k`/`not_sure`, en USD como referencia internacional neutra) y `timeline` (`asap`/`1_3_months`/`3_6_months`/`flexible`) del asistente de propuesta no estaban en el plan original; se definieron directamente en `src/schemas/forms.ts` y `src/db/schema/quote.ts`. Revisar si las franjas de presupuesto tienen sentido para el mercado real de DaeTrym.
- **Lista de espera sin consentimiento de privacidad explícito, a propósito.** A diferencia de contacto/propuesta/newsletter, el formulario de la Home no tiene casilla de política de privacidad: coincide con el diseño original de la tabla (`waitlist` no lleva `privacy_consent_at`, a diferencia de las otras tres tablas) — es solo una intención de contacto puntual (email + qué recurso interesa), no una tabla con base legal que registrar.
- **Cron de retención con fechas calculadas en JS, no `now() - interval` en SQL.** Para que el cálculo se comporte igual contra el motor embebido de desarrollo y contra Neon en producción. Política aplicada (docs/ARCHITECTURE.md §3): `pending` sin confirmar tras 48h → 7 días; `spam` → 30 días; mensajes/propuestas (cualquier estado) → 24 meses de inactividad. La baja del newsletter limpia sus propios campos en el momento (`src/actions/newsletter.tsx`), no en el cron.
- **WhatsApp: solo un botón flotante con enlace `wa.me`, sin widget embebido** (coincide con el plan — "solo enlaces, sin embed" en la sección de CSP): así no hace falta tocar la CSP para esta parte. Se oculta por completo sin `NEXT_PUBLIC_WHATSAPP_NUMBER`.

### Verificación con credenciales reales (Neon, Resend, Upstash, Turnstile)

Tras el commit inicial de la Fase 4, se verificó todo el backend contra los servicios reales (no el
motor embebido ni las claves de prueba) con datos de prueba reales, limpiados después. Se encontraron
y corrigieron varios problemas reales que el motor embebido no podía detectar:

- **`drizzle-kit migrate` no sirve contra Neon con el driver HTTP.** Al ejecutarlo, `@neondatabase/serverless` avisa de que solo sabe conectar por websocket a instancias remotas, y el comando se queda colgado sin aplicar nada. `pnpm db:migrate` pasa a ejecutar `scripts/db-migrate-neon.ts`, un script propio que usa `drizzle-orm/neon-http/migrator` — el mismo driver HTTP que ya usa la app en producción — así que aplica las migraciones con el mismo mecanismo que las va a consultar después. Carga `.env.local` a mano (sin `dotenv`) solo si el archivo existe, así que en Vercel (sin ese archivo, variables ya puestas por el entorno) no hace nada distinto.
- **Bug real de UI: `reset()` tras un envío con éxito revalidaba al instante contra el valor ya vacío.** `ContactForm` y `WaitlistForm` llamaban a `reset()` después de un envío correcto para vaciar el formulario, dejándolo visible con el aviso de éxito encima. Con credenciales y Turnstile reales (no la clave de pruebas, que resuelve al instante) se pudo observar el efecto exacto: nada más que el checklist de intereses o la casilla de privacidad quedaran vacíos por el `reset()`, `reValidateMode: 'onChange'` (por defecto en react-hook-form) los revalidaba de inmediato y mostraba "elige una opción"/"obligatorio" justo debajo del aviso "Enviado" — confuso, aunque el envío había ido bien. Arreglado igual que `QuoteWizard`/`NewsletterForm` ya hacían: al tener éxito, el formulario se sustituye entero por la confirmación en vez de vaciarse y seguir visible.
- **`EMAIL_FROM` mal formado.** Debe ser `Nombre <email@dominio>` (o solo `email@dominio`); el archivo tenía el nombre y el email pegados sin `< >` y con una comilla suelta alrededor de todo el valor — Next no interpreta comillas en `.env*` como sintaxis, así que ese carácter viajaba literal hasta Resend, que lo rechazaba con `Invalid \`from\` field`en cada envío. Corregido a`DaeTrym <onboarding@resend.dev>` (el remitente de pruebas de Resend: solo entrega mientras no haya un dominio propio verificado en resend.com/domains).
- **Con un remitente de pruebas de Resend, solo se puede enviar a la propia cuenta.** Es una limitación de Resend, no un fallo del código: `onboarding@resend.dev` únicamente entrega al email verificado de la cuenta (lo indica el propio error de Resend cuando se intenta enviar a otra dirección) y nunca a dominios no existentes como `example.com`. La verificación completa —incluido el double opt-in real (alta → email de confirmación → clic en el enlace real, comprobado con un token de prueba propio ya que no hay forma de leer una bandeja real desde aquí → estado `confirmed` en Neon → email de bienvenida con el enlace de descarga real de la checklist → baja en un clic— se hizo contra el email verificado de la cuenta de Resend del proyecto, no contra direcciones inventadas.
- **`NEXT_PUBLIC_CONTACT_EMAIL` sigue siendo el marcador de la Fase 1 (`hello@example.com`).** No es un bug de esta fase, pero la verificación con Resend real lo hizo evidente: el aviso interno de contacto/propuesta (a `siteConfig.contact.email`, que lee esta variable) falla en cada envío hasta que se ponga un email real aquí — la confirmación al visitante no se ve afectada, es un campo independiente. Pendiente de que el usuario lo actualice (ver aviso al usuario al cierre de esta fase).
- **Los cuatro formularios, el double opt-in completo y la descarga de la checklist se verificaron contra Neon/Resend/Upstash/Turnstile reales**, con datos de prueba borrados después de confirmar (no queda ningún registro de prueba en la base de producción). El límite de envíos de Upstash estuvo activo durante toda la verificación (sin avisos de "no configurado" en el registro del servidor).

---

## 15. Registro de decisiones (Fase 5 — SEO y pulido)

- **JSON-LD limitado a páginas con desglose real, no repetido de memoria en cada plantilla.** `Organization` y `WebSite` van en el layout raíz (una vez, en cada página). `BreadcrumbList` solo se añade donde ya hay una jerarquía visual real que describir (detalle de servicio, de post, de proyecto) — no en índices de un solo nivel. `FAQPage` solo en Home y en el detalle de servicio, que son las dos plantillas con preguntas frecuentes propias; el resto no inventa una lista vacía. El nonce de la CSP (mismo mecanismo que el script de tema) va en cada `<script type="application/ld+json">` vía `src/components/seo/json-ld.tsx`, porque la CSP del sitio no lleva `unsafe-inline` (D1).
- **`sameAs` de `Organization` se filtra, no se declara a ciegas.** `src/config/social.ts` sigue marcado PLACEHOLDER (raíces de dominio sin perfil concreto) hasta que el usuario dé los enlaces reales. Declarar esas URLs en `sameAs` sería una afirmación de identidad falsa (el propio criterio del proyecto de no fabricar datos presentados como reales), así que `realSocialLinks()` en `src/lib/seo/json-ld.ts` excluye cualquier enlace cuya ruta sea solo la raíz del dominio; en cuanto el usuario ponga perfiles reales, aparecen solos sin tocar código.
- **`sitemap.ts`/`robots.ts`/`manifest.ts` viven en `src/app/` raíz, no por locale.** Son convenciones de archivo de Next de un único recurso por origen (`/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`); `src/lib/seo/sitemap-entries.ts` construye las URLs de las dos rutas localizadas de cada página con sus tres alternates (`es`/`en`/`x-default`) desde dentro de esa única función, en vez de intentar que Next genere un sitemap por locale.
- **Bug real: `/es/` vs `/es` en el sitemap.** El primer cálculo de `localizedPath()` generaba `/es/` para la home en español (plantilla `/` con el prefijo del locale delante) mientras que la URL canónica real (`getPathname` de `@/i18n/navigation`) es `/es` sin barra final — un mismo recurso con dos URLs distintas según de dónde se mirase. Corregido con un caso especial para la ruta raíz; `tests/unit/sitemap.test.ts` fija esta forma exacta para que no vuelva a divergir.
- **Imagen OG dinámica en 13 rutas, todas sobre el mismo `renderOgImage()` de la Fase 3** (`src/lib/og.tsx`, ya usado por posts y proyectos): eyebrow + título + tagline + un tono (`hue`) por sección, coherente con el color que ya usa cada página en el sitio (verde ciberseguridad, violeta servicios, magenta nosotros, azul proceso/recursos/legal-privacidad, ámbar legal-cookies). La de servicio es la única con `generateStaticParams` (una imagen por slug, con el tono propio de cada servicio — igual que ya hacía la página).
- **Analítica: un componente, detrás de una variable de entorno, con Umami como opción por defecto (D3).** Sin `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL`/`_WEBSITE_ID`, `<Analytics>` no renderiza nada — desarrollar no exige ninguna cuenta, igual que el patrón ya establecido para Resend/Upstash/Turnstile en la Fase 4. El origen del script se añade a `connect-src` en la CSP calculándolo de la propia variable de entorno (no está fijado de antemano, a diferencia de Turnstile). Adaptar a Plausible es cambiar un atributo (`data-website-id` → `data-domain`) y la URL, documentado en el propio componente.
- **`useTheme()` extraído a `src/lib/use-theme.ts`, reutilizado por Turnstile.** Bug real de pulido: el widget de Turnstile usaba `options.theme: 'auto'`, que sigue el tema del SISTEMA OPERATIVO, no el propio selector de tema del sitio (`data-theme`) — con el sitio en oscuro y el SO en claro, el widget salía blanco, un recuadro muy llamativo sobre el vidrio oscuro. La lógica de `useSyncExternalStore` + `MutationObserver` que ya tenía `ThemeToggle` para leer `data-theme` reactivamente se movió a un hook compartido; `TurnstileField` ahora le pasa el tema real del sitio. Limitación asumida: Turnstile solo lee el tema una vez al montar el widget (no hay forma soportada de cambiarlo en caliente sin remontar), así que un cambio de tema con el widget ya visible no lo repinta — aceptable porque el widget vive en formularios que se visitan de nuevo, no en una página que se queda abierta horas.
- **Bug real de contraste: icono del botón de WhatsApp en tema claro, 1.75:1.** Usaba `text-green-400` (un paso fijo de la escala de color, independiente del tema) en vez de un token semántico — por eso `pnpm check:contrast`, que solo recorre tokens semánticos contra los materiales, no lo detectó; se encontró replicando a mano el cálculo de contraste del propio `scripts/lib/color.ts` contra el material `thick` en claro. Cambiado a `text-accent-text` (el par correcto por tema que ya usa el resto del sitio para texto/iconos sobre acento): 6.09:1 en claro, mismo valor que antes en oscuro.
- **e2e: la aserción de "consola sin ningún error" se cumple interceptando la petición del script de Speed Insights, no aflojando la aserción.** `@vercel/speed-insights` pide `/_vercel/speed-insights/script.js`, una ruta que solo la infraestructura de Vercel sirve (inyectada en el edge de un despliegue real) — fuera de ahí (local, CI, cualquier `next start` que no sea Vercel) siempre da 404 más un error de tipo MIME, en cada página. `tests/e2e/helpers.ts` (`watchForProblems`) intercepta esa única petición con `page.route()` y responde un script vacío, igualando lo que pasa en producción real en vez de permitir ese mensaje de forma genérica (que habría podido enmascarar un 404 real de otro recurso).
- **`scripts/_screenshot.mjs` (pasada visual de esta fase) se eliminó, no se conservó como utilidad.** Estaba escrito para una sesión concreta (puerto fijo, rutas y etiquetas solo en español, capturas en `/tmp`), no como una herramienta reutilizable — no cumplía la barra para vivir en `scripts/`.
