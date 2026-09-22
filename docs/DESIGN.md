# Sistema de diseño — "Glass + Primer"

> **Cambio de dirección (2026-09-21):** el diseño original (Fases 1–2) seguía la skill **apple-design**
> para todo: color, tipografía, espaciado y movimiento. El usuario pidió una dirección visual nueva
> porque el resultado usaba casi solo verde y negro, las letras eran demasiado grandes y las tarjetas
> tenían poco aire interno. **apple-design ahora solo gobierna el movimiento** (springs, gestos,
> transiciones interrumpibles, `prefers-reduced-motion`); color, tipografía, espaciado y estilo general
> salen de este documento y de `src/styles/`.
>
> La nueva dirección combina dos referencias:
>
> - **Primer** (sistema de GitHub): densidad cuidada, bordes finos de 1 px, jerarquía clara, etiquetas
>   de estado, radios pequeños, iconos de línea fina.
> - **Glassmorphism con criterio**: superficies translúcidas con `backdrop-filter` sobre resplandores de
>   color generados con CSS — nunca en todo el sitio, solo donde aporta profundidad (chrome flotante,
>   tarjetas destacadas).
>
> **Estado del rediseño:** Paso 1 (tokens + componentes base + Home completa, ES/EN, oscuro/claro,
> móvil/escritorio) — hecho. Paso 2 (resto del sitio: Servicios, Ciberseguridad, Nosotros, Proceso,
> Blog, Proyectos, legales, 404, mantenimiento) — pendiente, solo cuando el usuario lo apruebe. Hasta
> entonces esas páginas siguen con los tokens de la Fase 2 (ver el aviso al final de este documento).

> Regla de oro: **no se definen valores visuales ni de movimiento en los componentes.** Todo sale de
> `src/styles/`. Si falta un valor, se añade allí primero.

## Una sola fuente de verdad

| Qué                                                              | Dónde                       |
| ---------------------------------------------------------------- | --------------------------- |
| Escalas de color, tokens semánticos, radios, blur, tonos por hue | `src/styles/tokens.css`     |
| Escala tipográfica (tamaño, tracking, leading)                   | `src/styles/typography.css` |
| Materiales translúcidos + degradaciones                          | `src/styles/materials.css`  |
| Springs, umbrales de gesto, proyección, rubber-band              | `src/styles/motion.ts`      |
| Base global, resplandores de fondo, foco, `.press`, `.page-top`  | `src/styles/globals.css`    |

`tests/unit/tokens.test.ts` comprueba: que lo duplicado entre CSS y TS (`--press-scale`) no diverja,
que las siete escalas de color (50–900) y sus tonos (`.hue-*`) existan, y que **ningún componente use un
color hex suelto** (recorre `src/components` y `src/app`; la única excepción es el isotipo SVG).
`pnpm check:contrast` valida WCAG AA sobre los tokens (superficies sólidas, vidrio compuesto sobre cada
resplandor, los siete tonos y sus tintes en ambos temas, y la píldora siempre oscura de las miniaturas
de tarjeta contra el peor caso — ver «Miniaturas de tarjeta» más abajo).

## Color

Siete escalas completas (50–900), no solo el verde de marca. Cada una es una constante en
`@theme static` (`--color-<tono>-<paso>`), y cada tema (oscuro/claro) define un token semántico
`--c-<tono>` (color), `--c-<tono>-fg` (texto/icono, ≥ 4.5:1) y `--c-<tono>-tint`/`-line` (fondo y borde
translúcidos de una etiqueta o tarjeta).

| Tono      | Paso «color»          | Paso «fg» (oscuro / claro) | Uso con intención                                           |
| --------- | --------------------- | -------------------------- | ----------------------------------------------------------- |
| `green`   | 500 `#01bf63` (marca) | 400 / 700                  | CTA primario, foco, ciberseguridad, éxito                   |
| `cyan`    | 500                   | 400 / 800                  | Desarrollo web, información                                 |
| `blue`    | 500                   | 400 / 700                  | Infraestructura, severidad baja                             |
| `violet`  | 500                   | 400 / 700                  | Software a medida                                           |
| `magenta` | 500                   | 400 / 800                  | Destacados editoriales                                      |
| `amber`   | 500                   | 400 / 800                  | Consultoría, contenido de ejemplo/pendiente (`placeholder`) |
| `red`     | 500                   | 400 / 700                  | Crítico                                                     |

**Uso:** un contenedor lleva una clase `.hue-<tono>` (ver `src/config/hues.ts` → `hueClass`); sus hijos
usan las utilidades `bg-h-tint`, `text-h-fg`, `border-h-line`. El verde de marca (`--accent`/`--accent-text`)
es el tono por defecto en `:root` y sigue siendo el único color de los CTA primarios y el foco — el resto
de tonos son para identidad y estado, no para acciones.

- **El blanco sobre el verde no pasa AA** (mismo motivo que en la Fase 1): los botones primarios llevan
  texto oscuro (`--on-accent`). `hover`/`pressed` no oscurecen el verde en ningún tema.
- El color nunca es el único portador de significado: una etiqueta de estado (`Badge`) siempre lleva
  texto, y los iconos de estado (`Banner`) refuerzan el tono.
- Regla verificada por el script: cada `--c-<tono>-fg` cumple 4.5:1 sobre el fondo liso, sobre cada
  resplandor y sobre cada material translúcido; el propio `--c-<tono>` (uso gráfico, no texto) cumple 3:1.

### Balance de color (corrección tras revisión)

Primera pasada del rediseño: el verde dominaba casi todo (todos los botones, el mismo resplandor
verde+violeta detrás de cada pantalla) y el resto de la paleta casi no aparecía fuera de las tarjetas de
servicio. Reglas aplicadas para repartir el color con intención:

1. **Botones.** `primary` (verde sólido) es SOLO el CTA principal de la pantalla — uno, como mucho dos
   (p. ej. el CTA fijo del header + el de un hero visible a la vez siguen contando como dos, no como
   "todo verde"). `secondary`/`ghost` son de vidrio neutro con **borde o texto del tono del contexto**,
   nunca verde por defecto salvo que ese sea el tono real: `Button` (`buttonVariants`) usa
   `text-h-fg`/`border-h-line`, que toman el tono de la `.hue-*` ambiente (la `Section` que lo envuelve)
   o del prop `hue` explícito cuando no hay una `Section` con tono alrededor (p. ej. `BookCallButton` en
   el hero y en `CtaBand`, que no están dentro de una `Section` con `hue`).
2. **Resplandores de fondo, por sección — no una combinación fija.** Cada `Section`/`PageHero`/`CtaBand`
   admite `glow?: [Hue, Hue]` (`SectionGlow`, `src/components/sections/section-glow.tsx`): dos manchas
   radiales grandes en esquinas opuestas, con los DOS tonos pedidos. **Ninguna combinación se repite en
   la Home** — hero verde+cian, servicios violeta+ámbar, "por qué" cian+azul, proceso magenta+verde,
   proyectos violeta+cian, tecnologías azul+ámbar, FAQ cian+magenta, próximamente azul+magenta, CTA final
   verde+magenta. Es un cambio de arquitectura respecto a la primera pasada: antes era un `body::before`
   fijo al viewport (`position: fixed`), así que TODA la página veía siempre el mismo verde+cian+violeta
   sin importar la sección; ahora cada resplandor vive DENTRO de su sección y scrollea con el contenido.
3. **Iconos, bordes activos, enlaces y micro-acentos.** Cada `Section` puede fijar su propio `hue` (tiñe
   el sobretítulo, el h2 vía `AccentText`/`Eyebrow`, y cualquier elemento que use `text-h-fg`/`border-h-line`
   sin fijar su propio tono — se hereda por CSS, no hace falta repetirlo en cada hijo). Las tarjetas
   (`ServiceCard`, `FeatureCard`, `ProjectCard`…) siguen fijando SU PROPIO tono según su categoría real
   (servicio, principio, tipo de proyecto), que gana sobre el tono ambiente de la sección.
   **Excepción deliberada:** el foco (`--focus-ring`) se queda siempre en verde en todo el sitio — es una
   señal de sistema (accesibilidad), no un acento de contenido, y debe ser predecible en cualquier pantalla.

- Oscuro por defecto: `--bg: #050807` (tinte verdoso, no negro puro). Claro real: `--bg: #f6f8fa` (gris
  suave, no blanco plano); `--surface-1/2` son blanco puro para las tarjetas sólidas.
- Intensidad de los resplandores: `--glow-alpha` (tokens.css, distinta por tema: más alta en oscuro,
  donde hay más margen de contraste, más baja en claro). Verificada por `pnpm check:contrast`, que
  compone cada uno de los siete tonos individualmente sobre el fondo (peor caso real: los dos círculos
  de un `SectionGlow` están en esquinas opuestas y con radio 70% apenas llegan a solaparse).
- Sin animación de deriva (a diferencia de la primera pasada): al vivir dentro de cada sección y no
  fijos al viewport, la variedad ya viene del recorrido por la página al hacer scroll, no de movimiento.
- **Páginas aún no rediseñadas (Paso 2):** sus secciones no pasan `glow` todavía, así que no muestran
  resplandor de fondo hasta que se les asigne uno (antes tenían el fondo fijo global, ahora ninguno);
  no es una regresión visible porque su contenido sigue siendo mayormente superficies sólidas de la Fase 2.

## Tipografía

Inter Variable con eje óptico + JetBrains Mono para etiquetas técnicas (sin cambios respecto a la Fase 1).
Se añade una **serif cursiva** (Instrument Serif, `next/font`) como acento editorial: la utilidad
`font-accent` (`src/styles/typography.css`) y el componente `AccentText`
(`src/components/ui/accent-text.tsx`) componen en cursiva la palabra que el texto marca entre asteriscos
— por ejemplo `t('hero.title')` = `"Software seguro, desde el *diseño*."` → la palabra «diseño» sale en
serif cursiva, el resto en Inter. **Una palabra por título como máximo**, nunca un párrafo entero; si el
texto no lleva marcas, se muestra tal cual, y unas marcas sin pareja nunca dejan asteriscos visibles.

**Escala reducida** (antes: cuerpo 16 px, H1 hasta 56 px; ahora, más compacta, con más aire alrededor):

| Utilidad       | Tamaño             | Uso                                   |
| -------------- | ------------------ | ------------------------------------- |
| `text-display` | 36–56 px           | Título de portada (Home), único caso  |
| `text-h1`      | 30–44 px           | Título de página                      |
| `text-h2`      | 26–32 px           | Título de sección                     |
| `text-h3`      | 17–20 px           |                                       |
| `text-title`   | 16 px              | Título de tarjeta / elemento de lista |
| `text-lead`    | 16–18 px           | Entradilla                            |
| `text-body`    | 15 px              | Texto corrido (interfaz)              |
| `text-prose`   | 16 px, leading 1.7 | Lectura larga: legales, blog (Paso 2) |
| `text-small`   | 13 px              | Texto secundario, controles           |
| `text-label`   | 12 px              | Etiquetas, metadatos                  |
| `text-eyebrow` | 11.5 px, mono      | Sobretítulo técnico                   |

El tracking sigue sin ser un valor fijo: negativo en los títulos, ~0 en el cuerpo, ligeramente positivo
en `label`/`eyebrow`. Todo en `rem`/`clamp`, así que respeta el tamaño de texto del usuario.
`src/lib/cn.ts` registra estas utilidades (incluida `prose`) en `tailwind-merge`; si falta, `text-small`
se interpreta como color y borra `text-on-accent` (bug real que axe detectó en la Fase 2).

## Materiales (vidrio con criterio)

`src/styles/materials.css` distingue **cinco** superficies (antes tres):

| Utilidad           | Blur     | Dónde                                                                               |
| ------------------ | -------- | ----------------------------------------------------------------------------------- |
| `material-thin`    | No       | Controles dentro de otra superficie con blur (segmentado, toggle, botón secundario) |
| `material-regular` | Sí       | Header (píldora flotante), tarjetas destacadas, paneles                             |
| `material-thick`   | Sí (más) | Sheets y modales: más opaco y con más blur                                          |
| `material-panel`   | No       | Tarjetas de contenido «normales» (barato: se puede usar en cantidad)                |
| `material-solid`   | —        | Lectura larga (legales, blog): superficie sólida, prioriza legibilidad              |

Por qué `material-thin` no lleva blur: casi siempre vive DENTRO de otra superficie que ya lo tiene (el
header, un sheet); un `backdrop-filter` anidado no ve nada nuevo detrás y solo cuesta rendimiento.

- Fondo translúcido (blanco 5–9 % en oscuro / blanco 50–88 % en claro), borde de 1 px translúcido con el
  borde superior más claro («luz sobre el material»), radio pequeño (`--radius-lg`: 12 px en tarjetas,
  `--radius-xl`: 16 px en sheets; el header-píldora usa `rounded-full`).
- **Presupuesto de blur:** como máximo el header + unos pocos `material-regular` a la vez en pantalla (en
  móvil, las tarjetas van en una columna). Ante la duda, usar `material-panel` (sin blur).
- Degradación obligatoria y ya implementada: `prefers-reduced-transparency` (opaco, sin blur),
  `prefers-contrast: more` (opaco + borde definido) y navegadores sin `backdrop-filter`.
- **Limitación conocida (sin cambios desde la Fase 1):** el blur no se renderiza en la emulación móvil
  headless de Playwright; sí en el contexto de escritorio con el mismo CSS. Validar en un dispositivo real.

## Miniaturas de tarjeta (proyecto/post, Fase 3.1)

`ProjectCard` y `PostCard` (`src/components/sections/cards.tsx`) llevan una miniatura 16:9 arriba,
compartida por `CardThumbnail`. Dos campos opcionales de frontmatter la controlan:

| Campo     | En qué contenido  | Formato                                                             |
| --------- | ----------------- | ------------------------------------------------------------------- |
| `image`   | proyectos y posts | ruta LOCAL en `/public` (`/^\/[^\s]+\.(png\|jpe?g\|webp\|avif)$/i`) |
| `demoUrl` | solo proyectos    | URL completa (`z.string().url()`)                                   |

Validados en `src/schemas/content.ts`. `image` es siempre una ruta local, nunca remota — así no hace
falta tocar el `img-src` de la CSP (ya permite `'self'`/`data:`/`blob:`, ver `src/lib/security/headers.ts`).

**Añadir una imagen a un proyecto o post nuevo:**

1. Coloca el archivo en `public/content/<projects|blog>/<slug>/thumb.<ext>` (crea la carpeta si no
   existe; usa el slug EN como carpeta si el contenido tiene `translationKey` con slugs distintos por
   idioma, para no duplicar el archivo).
2. En el frontmatter del `.mdx`, añade `image: /content/<projects|blog>/<slug>/thumb.jpg` (la ruta es
   relativa a `public/`, empieza por `/`).
3. Repite el campo en el `.mdx` del otro idioma si quieres la misma imagen ahí (no se copia sola).

**Añadir un botón "Ver demo" a un proyecto:** añade `demoUrl: https://...` al frontmatter. Aparece como
un botón de vidrio en la esquina inferior derecha de la miniatura, con `target="_blank"` y el aviso
`opensInNewTab` para lectores de pantalla.

**Sin `image`:** la miniatura muestra un degradado radial con los dos tonos de la categoría (`--h`/
`--h-fg` del `.hue-*` de la tarjeta) más el icono de línea fina de esa categoría (`projectIcons` en
`src/config/projects.ts`, `blogCategoryIcons` en `src/config/blog.ts`) — nunca se ve vacía.

**Etiquetas superpuestas.** La categoría y el distintivo "Ejemplo" viven sobre la miniatura (arriba a la
izquierda), no encima del título. Usan `ThumbBadge` (`src/components/ui/badge.tsx`), no `Badge`: una
píldora con `material-thumb-badge` (fondo oscuro semitransparente + blur, SIEMPRE oscura pase lo que
pase con el tema del sitio, porque tiene que leerse sobre cualquier foto o degradado) y `text-thumb-fg`
(el mismo tono de la categoría, en su paso 300 — la variante clara que hoy solo se usaba en tema
oscuro). Los colores de cada categoría son EXACTAMENTE los mismos que ya usaban esas etiquetas antes de
la miniatura; solo cambió la superficie sobre la que se leen. `pnpm check:contrast` verifica
`--thumb-fg` de los siete tonos contra `--thumb-scrim-bg` compuesto sobre el peor caso real (una
miniatura casi blanca) — si tocas cualquiera de esos tokens, vuelve a ejecutarlo.

## Padding y radios (Primer: densidad cuidada)

- Padding interno de tarjeta: `--pad-card` = `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)` (20–24 px).
- **Dos radios, dos propósitos** (corregido tras revisión: el botón del header se veía cuadrado junto a
  la píldora que lo contiene):
  - **Píldora (`rounded-full`, Tailwind, 9999px):** todo lo que vive DENTRO del header flotante —
    el propio contenedor, el botón de CTA del header, el disparador del menú móvil — y los dos controles
    que son «segmentado/toggle» por naturaleza y aparecen tanto en el header como en el sheet:
    `LanguageSwitcher` y `ThemeToggle`. Estos dos son pastilla en cualquier contexto porque su FORMA es
    parte de su identidad, no del lugar donde están.
  - **Radio pequeño** (`--radius-sm` 6 px · `--radius-md` 8 px · `--radius-lg` 12 px tarjetas ·
    `--radius-xl` 16 px paneles/sheets): el resto de los componentes del sitio — el `Button` genérico
    (`variant="primary"|"secondary"|"ghost"`) fuera del header, tarjetas, badges, inputs. Un `Button`
    dentro del header pasa `className="rounded-full"` explícito (ver `site-header.tsx`); en cualquier
    otro sitio conserva su radio pequeño por defecto.
- Botones: 32/36/40 px de alto (`sm`/`md`/`lg`).
- Iconos de línea fina, 16–20 px, `strokeWidth` 1.5–1.75 (nunca el grosor por defecto de Lucide).
- Ancho de contenido `--content-width`: 70 rem (antes 72 rem); ritmo entre secciones más ajustado
  (`.section-y`: 48–80 px, antes 56–96 px) — compacto en tamaño, generoso en aire alrededor.

## Motion (gobernado por apple-design)

**Sin cambios de fondo respecto a la Fase 1**: apple-design sigue decidiendo TODO lo gestual. Comportamiento
sobre animación — springs interrumpibles que parten del valor actual y heredan velocidad. Damping 1.0 por
defecto; rebote (`spring.momentum`) **solo** cuando el gesto trajo inercia (un lanzamiento).

| Token             | Valor                        | Uso                              |
| ----------------- | ---------------------------- | -------------------------------- |
| `spring.default`  | bounce 0, 0.4 s              | reposicionar, aparecer           |
| `spring.snappy`   | bounce 0, 0.3 s              | toggles, indicadores             |
| `spring.momentum` | bounce 0.2, 0.4 s            | solo tras un gesto con velocidad |
| `.press`          | scale .97, 100 ms, `:active` | feedback en pointer-down         |
| `gesture`         | histéresis 10 px, decel .998 | proyección, rubber-band .55      |

Helpers puros y probados (`tests/unit/motion.test.ts`): `project`, `rubberband`, `resolveSnap`,
`velocityFromSamples`. Nada gestual usa transiciones CSS ni keyframes.

### Componentes gestuales

- **`SideSheet`** (menú móvil, ahora vidrio `material-thick`): entra y sale por la derecha; sigue al dedo
  1:1 respetando el punto de agarre; pointer capture tras 10 px de histéresis; decide cerrar/abrir por
  **proyección de momentum**; traspasa la velocidad al spring; rubber-band hacia dentro; **interrumpible**.
  Teclado: Esc y botón de cierre; devuelve el foco explícitamente al botón que lo abrió.
- **`LanguageSwitcher`**: control segmentado con píldora animada por `layoutId` (spring), ahora en
  `material-thin` con radio pequeño (antes rejilla con píldora circular).
- **`ThemeToggle`**: cruce de iconos con spring; transición de color de 300 ms al cambiar de tema.

### Reduced motion

`prefers-reduced-motion`: el sheet pasa a un fundido de 200 ms (sin desplazamiento ni arrastre); `.press`
solo baja la opacidad; el resplandor de fondo deja de derivar; `MotionConfig reducedMotion="user"`
desactiva las transformaciones de motion y conserva opacidad/color. Todo gesto tiene alternativa de teclado.

## Al añadir UI nueva

1. Componer con las utilidades de `typography.css` y los tokens de color; nada de hex sueltos
   (`tests/unit/tokens.test.ts` lo falla si aparece uno fuera de `logo-mark.tsx`).
2. Elegir un tono con intención (`hue?: Hue` en `Section`, `Card`, `FeatureCard`, `IconBadge`…), no
   decorativo: un servicio, una categoría, un estado. El verde de marca es el tono por defecto.
3. Botones: `Button` (`variant="primary" | "secondary" | "ghost"`). Etiquetas de estado: `Badge`
   (`variant="success" | "info" | "low" | "medium" | "critical" | "placeholder"`). Avisos: `Banner`.
4. Elegir la superficie correcta: `material-panel` por defecto, `material-regular` solo si la tarjeta debe
   destacar (presupuesto de blur), `material-solid` para lectura larga.
5. Cualquier cosa arrastrable: springs + `useVelocityTracker` + `project`/`resolveSnap`; nunca `transition`.
6. Primera sección de una página: clase `page-top`.
7. Texto solo en `src/messages/{es,en}.json` (ESLint `react/jsx-no-literals` lo exige). Para el acento
   editorial del título, usar `AccentText`/`*palabra*` — como máximo una palabra.
8. Ejecutar `pnpm check:contrast` si se tocan tokens.

## Notas que siguen vigentes de la Fase 2

- **Revelado al hacer scroll (`.reveal`).** CSS puro (`animation-timeline: view()`), sin JavaScript, solo
  donde el navegador lo soporta y sin `prefers-reduced-motion`. Nunca en el hero (es el LCP) ni en bloques
  altos. `fill-mode: backwards` (no `both`): el último fotograma no queda fijado pisando `.press:active`.
- **FAQ (`Faq`).** La altura se anima con un spring interrumpible; la respuesta cerrada es `inert`; con
  reduced motion la altura cambia al instante y solo se funde la opacidad.
- **Header y breakpoints.** La navegación completa aparece desde 1024 px (`lg`); por debajo, el sheet
  lateral. Idioma, tema y CTA se quedan en el header (ahora la píldora de vidrio) desde 640 px (`sm`); por
  debajo viven solo dentro del sheet. Corrección de fase: estuvieron ocultos hasta 1024 px por error — ver
  `docs/ARCHITECTURE.md` §10, puntos 7–8.
- **Documentos largos (`LegalDocument`, Paso 2).** Sin animaciones: índice fijo en escritorio, tablas que
  en móvil pasan a tarjetas, datos pendientes resaltados con `<mark>`. Usarán `material-solid`/`text-prose`.

## Paso 2 pendiente (aviso)

Las páginas que el rediseño aún no ha tocado (Servicios, Ciberseguridad, Nosotros, Proceso, legales, 404,
mantenimiento) siguen usando literalmente los mismos NOMBRES de utilidad (`text-h1`, `bg-surface-2`,
`text-accent-text`, `border-hairline-strong`, `rounded-full`…), así que **siguen renderizando correctamente**
con la nueva paleta — solo que sin los tonos por página, el padding más generoso ni el vidrio. Se
actualizan en el Paso 2, con sus propios tests y su propio commit.
