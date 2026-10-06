# Despliegue en Vercel

Guía paso a paso para llevar DaeTrym a producción. No incluye ningún valor real de secretos —
cada paso dice qué variable rellenar y de dónde sale su valor, nunca el valor en sí.

## 1. Conectar el repositorio

1. En [vercel.com](https://vercel.com), **Add New → Project**.
2. Importa `LuiDaniel/daetrym-web` desde GitHub (autoriza la app de Vercel sobre el repositorio si es
   la primera vez).
3. Framework Preset: Vercel detecta Next.js solo. No hace falta tocar el Build Command
   (`next build`) ni el Output Directory.
4. **No pulses "Deploy" todavía** — primero conecta Neon y Upstash (paso 2) para que la primera build
   ya tenga `DATABASE_URL` disponible. Si ya desplegaste sin ellas, no pasa nada: el sitio funciona
   igual (motor embebido en memoria para la build, ver `docs/ARCHITECTURE.md` §14), solo tendrás que
   volver a desplegar después de conectarlas.

## 2. Integraciones del Marketplace de Vercel

Ambas viven en **Project → Settings → Integrations** (o desde el propio Marketplace de Vercel,
buscando cada una por nombre) y, al conectarlas a este proyecto, escriben sus variables de entorno
automáticamente — no hay que copiar ninguna cadena de conexión a mano.

### Neon (Postgres)

1. Busca "Neon" en el Marketplace de Vercel → **Add Integration** → elige este proyecto.
2. Crea una base nueva (o conecta una existente) cuando te lo pida el asistente de Neon.
3. La integración añade `DATABASE_URL` (y variantes `DATABASE_URL_UNPOOLED`/`PGHOST`/etc., que este
   proyecto no usa — solo lee `DATABASE_URL`, ver `src/env.ts`) a las variables de entorno del
   proyecto, en los tres entornos (Production/Preview/Development).
4. **Falta un paso manual: aplicar las migraciones.** La integración crea la base, pero no las tablas.
   Con `DATABASE_URL` ya disponible localmente (cópiala de Vercel a tu `.env.local` solo para este
   paso, o usa `vercel env pull`), ejecuta una vez:
   ```bash
   pnpm db:migrate
   ```
   Este script (`scripts/db-migrate-neon.ts`) usa el mismo driver HTTP que la app en producción — ver
   `docs/ARCHITECTURE.md` §14 sobre por qué no sirve `drizzle-kit migrate` directamente contra Neon.
   Repite este paso cada vez que se añada una migración nueva (`pnpm db:generate` en local, commit del
   SQL generado, y `pnpm db:migrate` contra Neon tras el deploy que la introduce).

### Upstash (Redis, límite de envíos)

1. Busca "Upstash" en el Marketplace de Vercel → **Add Integration** → elige este proyecto.
2. Crea una base de Redis (plan gratuito de sobra para el límite de envíos de este sitio).
3. Añade `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` automáticamente.
4. Sin esta integración el sitio sigue funcionando (sin límite de envíos, con un aviso en el
   registro del servidor) — no bloquea el despliegue, pero sí conviene tenerla en producción real.

## 3. Variables de entorno a configurar a mano

En **Project → Settings → Environment Variables**. Referencia completa de cada una, con su
justificación, en [`.env.example`](../.env.example) — aquí solo la lista de qué hace falta y por qué,
sin valores:

**Obligatorias en producción** (`src/env.ts` rompe la build en Vercel si falta alguna):

| Variable                                                  | De dónde sale                                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                                    | El dominio final, sin barra final (`https://tu-dominio.com`)                                                                                           |
| `NEXT_PUBLIC_CONTACT_EMAIL`                               | Bandeja real que recibe los avisos de contacto/propuesta                                                                                               |
| `IP_HASH_SECRET`                                          | `openssl rand -base64 32` (o el mismo generador usado en la Fase 4) — **nunca reutilices el de desarrollo local en producción**                        |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Panel de Cloudflare Turnstile, un sitio nuevo apuntando al dominio de producción (las claves de prueba de Cloudflare NO valen aquí — siempre aprueban) |

**Opcionales pero recomendadas:**

| Variable                                           | De dónde sale                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                                   | Panel de Resend. Sin ella, los emails solo se registran en consola — nada llega de verdad                                                                                                                                                             |
| `EMAIL_FROM`                                       | Formato `Nombre <correo@tu-dominio-verificado.com>`. Requiere el dominio verificado en Resend (ver paso 5) — mientras tanto, el remitente de pruebas (`onboarding@resend.dev`) solo entrega a la propia cuenta de Resend, nunca a tus clientes reales |
| `CRON_SECRET`                                      | 16+ caracteres aleatorios. Sin ella, `/api/cron/retention` responde 401 siempre — ver paso 6                                                                                                                                                          |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                      | Solo dígitos con prefijo de país, sin "+". Vacío oculta el botón flotante                                                                                                                                                                             |
| `NEXT_PUBLIC_CAL_URL`                              | URL de Cal.com u otro calendario. Vacío = el CTA lleva a `/contacto`                                                                                                                                                                                  |
| `NEXT_PUBLIC_SECURITY_EMAIL`                       | Si es distinto del de contacto (se usa en `/security` y `security.txt`)                                                                                                                                                                               |
| `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL` / `_WEBSITE_ID` | Cuenta de Umami (cloud o autoalojado) o Plausible — ver `src/components/seo/analytics.tsx` para adaptar a Plausible                                                                                                                                   |

No hace falta tocar `MAINTENANCE_MODE` (por defecto `false`) salvo que quieras activar la página de
mantenimiento en todo el sitio.

## 4. Primer despliegue

Con Neon/Upstash conectados y las variables obligatorias puestas, **Deploy**. Revisa el log de build:
si falta una variable obligatoria, Zod lo dice por su nombre exacto (`src/env.ts`) y la build falla
ahí mismo, no en tiempo de ejecución — no hay forma de que el sitio quede a medias en producción por
una variable olvidada.

Después del primer deploy con `DATABASE_URL` ya activa, no olvides el paso de migraciones del punto 2
si no lo hiciste antes.

## 5. Dominio propio

1. **Project → Settings → Domains** → añade el dominio.
2. Sigue las instrucciones de DNS que da Vercel (registro `A`/`CNAME`, según si es el dominio raíz o
   un subdominio) — es de su parte, no cambia nada del código.
3. Actualiza `NEXT_PUBLIC_SITE_URL` a la URL final y vuelve a desplegar (afecta a las URLs canónicas,
   `sitemap.xml`, JSON-LD y las imágenes Open Graph — todas se calculan a partir de esta variable, ver
   `src/config/site.ts`).
4. **Dominio del email (Resend):** en el panel de Resend, "Domains" → añade el mismo dominio (o un
   subdominio, p. ej. `mail.tu-dominio.com`) → añade los registros SPF/DKIM/DMARC que Resend indica en
   el DNS. Sin este paso, `EMAIL_FROM` con ese dominio será rechazado por Resend; con el remitente de
   pruebas (`onboarding@resend.dev`), como se documentó en la verificación de la Fase 4, solo entrega a
   la propia cuenta de Resend, nunca a clientes reales.
5. Repite el paso 4 de Turnstile si no lo hiciste ya: el sitio de Turnstile debe apuntar al dominio
   final, no a `localhost`.

## 6. Cron de retención

Ya está declarado en [`vercel.json`](../vercel.json) (`/api/cron/retention`, diario a las 05:00 UTC) —
no hace falta configurar nada en el panel de Vercel para el propio cron. Lo único que falta es la
variable `CRON_SECRET` del paso 3: Vercel Cron llama a esa ruta con la cabecera
`Authorization: Bearer <CRON_SECRET>` automáticamente en cuanto la variable existe en el proyecto (es
una convención de Vercel, no algo que haya que pegar a mano en ningún sitio). Sin `CRON_SECRET`
configurada, la ruta sigue existiendo pero rechaza cualquier llamada con 401 — el sitio no se rompe,
simplemente la retención automática no corre.

Verificación tras el despliegue: **Project → Cron Jobs** en el panel de Vercel debe listar la tarea con
su próxima ejecución; los resultados de cada corrida (código de estado, duración) aparecen ahí mismo.

## 7. Verificación posterior al despliegue

- `curl -I https://tu-dominio.com/es` y compara contra `docs/ARCHITECTURE.md` §16 (cabeceras de
  seguridad) — o directamente [securityheaders.com](https://securityheaders.com) contra el dominio
  final.
- Recorrido manual de los cuatro formularios (contacto, propuesta, newsletter, waitlist) contra los
  servicios reales, igual que se hizo en local en la Fase 4.
- `https://tu-dominio.com/sitemap.xml`, `/robots.txt` y `/manifest.webmanifest` cargan y apuntan al
  dominio correcto (no a `localhost`).
- Panel de Vercel → **Speed Insights** empieza a recibir datos reales de visitantes a los pocos
  minutos de tráfico — es la referencia real de rendimiento en producción, más fiable que cualquier
  auditoría Lighthouse local (ver `docs/ARCHITECTURE.md` §16 sobre esa diferencia).
