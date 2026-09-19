# Sistema de diseño — cómo se aplicó apple-design

Toda la interfaz y la interacción se rigen por la skill **apple-design** (WWDC: _Designing Fluid
Interfaces_, _The Details of UI Typography_, materiales y principios de diseño), traducida a la web.
Este documento explica **dónde vive cada decisión** para mantener la coherencia cuando el sitio crezca.

> Regla de oro: **no se definen valores visuales ni de movimiento en los componentes.** Todo sale de
> `src/styles/`. Si falta un valor, se añade allí primero.

## Una sola fuente de verdad

| Qué                                                   | Dónde                       |
| ----------------------------------------------------- | --------------------------- |
| Color, radios, blur, espaciado del header, constantes | `src/styles/tokens.css`     |
| Escala tipográfica (tamaño, tracking, leading)        | `src/styles/typography.css` |
| Materiales translúcidos + degradaciones               | `src/styles/materials.css`  |
| Springs, umbrales de gesto, proyección, rubber-band   | `src/styles/motion.ts`      |
| Base global, foco, skip-link, `.press`, `.page-top`   | `src/styles/globals.css`    |

`tests/unit/tokens.test.ts` comprueba que lo duplicado entre CSS y TS (`--press-scale`) no diverja.
`pnpm check:contrast` valida WCAG AA sobre los tokens (82 pares, incluidos los materiales).

## Color

Oscuro por defecto (`data-theme="dark"` en `<html>`), claro soportado. La marca sale del logo:
fondo `#040712`, verde `#01BF63`, blanco.

- **El blanco sobre el verde da 2.43:1 y no pasa AA.** Por eso los botones verdes llevan texto oscuro
  (`--on-accent`). No usar `text-white` sobre `bg-accent`.
- `--accent-text` es el verde para _texto/enlaces_: `#01BF63` en oscuro, `#00713A` en claro (≈6:1).
- `--accent-hover`/`--accent-pressed` **no oscurecen** el verde en ninguno de los temas (el texto oscuro
  perdería contraste). Mismos valores en ambos temas.
- El verde se usa con restricción: CTA primario, foco, estados activos y un detalle por sección.
- Regla verificada por el script: el material **thin** nunca se coloca sobre un relleno de acento.

## Tipografía

Inter Variable con eje óptico (`opsz`, `font-optical-sizing: auto`) + JetBrains Mono para etiquetas
técnicas. Se eligió Inter sobre la fuente del sistema (que la skill prefiere por defecto) por
consistencia entre Windows/Android/iOS; es fácil de revertir en `src/app/fonts.ts`.

El tracking **nunca es un valor fijo**: los títulos grandes van con tracking negativo y leading
ajustado; el cuerpo, ~0; el texto pequeño, ligeramente positivo. Usar las utilidades
`text-display | h1 | h2 | h3 | lead | body | small | label` (no `text-lg`, etc.). Todo en `rem`/`clamp`,
así que respeta el tamaño de texto del usuario.

`src/lib/cn.ts` registra estas utilidades en `tailwind-merge`. Sin eso, `text-small` se interpreta como
un _color_ y **borra** `text-on-accent` (bug real que axe detectó).

## Materiales

`material-thin` (controles) · `material-regular` (header, tarjetas) · `material-thick` (sheets, modales).
Más grande = más espeso (más blur y sombra). Borde superior claro = luz sobre el material.

- El header **flota sobre el contenido** (`-mb-(--header-height)`): las páginas empiezan con `.page-top`
  para compensar su altura. En lugar de una línea divisoria hay un **scroll-edge** (`ScrollEdge`): un
  degradado con blur cuya opacidad sigue el scroll 1:1.
- Degradación obligatoria y ya implementada: `prefers-reduced-transparency` (opaco, sin blur),
  `prefers-contrast: more` (casi sólido + borde) y navegadores sin `backdrop-filter`.
- Fondos **estáticos** (resplandor radial suave). Nada de fondos animados a pantalla completa.
- Presupuesto: máx. 2 blurs grandes simultáneos en móvil (se medirá en Lighthouse, Fase 5).

## Motion

Comportamiento sobre animación: todo lo que se toca usa **springs** (interrumpibles, parten del valor
actual, heredan velocidad). Damping 1.0 por defecto; rebote (`spring.momentum`) **solo** cuando el gesto
trajo inercia (un lanzamiento).

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

- **`SideSheet`** (`components/ui/side-sheet.tsx`, menú móvil): entra y sale por la derecha (donde está el
  botón); sigue al dedo 1:1 respetando el punto de agarre; pointer capture tras 10 px de histéresis;
  decide cerrar/abrir por **proyección de momentum**; traspasa la velocidad al spring; rubber-band hacia
  dentro; **interrumpible** (agarrarlo a mitad de cierre lo devuelve al dedo desde su posición actual).
  Una pausa antes de soltar cuenta como velocidad 0. Teclado: Esc y botón de cierre; devuelve el foco
  explícitamente al botón que lo abrió (los toques no siempre enfocan el botón).
- **`LanguageSwitcher`**: control segmentado con píldora animada por `layoutId` (spring).
- **`ThemeToggle`**: cruce de iconos con spring; el cambio de tema hace una transición de color de 300 ms
  para evitar un salto brusco de brillo.

### Reduced motion

`prefers-reduced-motion`: el sheet pasa a un fundido de 200 ms (sin desplazamiento ni arrastre); `.press`
solo baja la opacidad; `MotionConfig reducedMotion="user"` desactiva las transformaciones de motion y
conserva opacidad/color. Todo gesto tiene alternativa de teclado.

## Al añadir UI nueva

1. Componer con las utilidades de `typography.css` y los tokens de color; nada de hex sueltos.
2. Botones: `Button` (`variant="primary" | "secondary" | "ghost"`).
3. Cualquier cosa arrastrable: springs + `useVelocityTracker` + `project`/`resolveSnap`; nunca `transition`.
4. Primera sección de una página: clase `page-top`.
5. Texto solo en `src/messages/{es,en}.json` (ESLint `react/jsx-no-literals` lo exige).
6. Ejecutar `pnpm check:contrast` si se tocan tokens.

## Limitaciones conocidas

- El blur de `backdrop-filter` **no se puede verificar visualmente en la emulación móvil de Playwright**
  (headless lo omite; sí se renderiza en el contexto de escritorio con el mismo CSS). Validar el sheet en
  un dispositivo real (Safari iOS usa el prefijo `-webkit-`, ya incluido).
- Las transiciones de _salida_ entre páginas quedan para la Fase 5 (View Transitions como mejora
  progresiva); hoy no hay transición de página.
