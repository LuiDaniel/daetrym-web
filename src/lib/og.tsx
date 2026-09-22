import { ImageResponse } from 'next/og';
import { GEAR_PATH, MARK_VIEWBOX, STROKE_PATH } from '@/components/layout/logo-mark';

/**
 * Imagen OG dinámica (Fase 3: blog y proyectos). Satori (el motor de `next/og`) no entiende hojas de
 * estilo ni `var(--token)` — solo estilos inline con valores literales — así que estos son los ÚNICOS
 * colores del sitio que no salen de `tokens.css`. Se corresponden 1:1 con el tema oscuro (una imagen
 * OG no sabe qué tema prefiere quien la vaya a ver, así que usa siempre el mismo, como es habitual).
 * Vive en src/lib (no src/app ni src/components): el guardarraíl de `tests/unit/tokens.test.ts` que
 * prohíbe colores hex sueltos solo recorre esas dos carpetas, precisamente por casos como este.
 */
const palette = {
  bg: '#050807',
  fg: '#f3f8f5',
  fgMuted: 'rgba(243, 248, 245, 0.68)',
  hairline: 'rgba(255, 255, 255, 0.14)',
  green: '#3ddc97',
  cyan: '#67e8f9',
  blue: '#93c5fd',
  violet: '#c4b5fd',
  magenta: '#f0abfc',
  amber: '#fcd34d',
  red: '#fca5a5',
} as const;

export type OgHue = Exclude<keyof typeof palette, 'bg' | 'fg' | 'fgMuted' | 'hairline'>;

const SIZE = { width: 1200, height: 630 };

export function ogImageSize() {
  return SIZE;
}

/** Genera la imagen 1200×630. `eyebrow` es la categoría/sección; `title`, el título del post o caso. */
export function renderOgImage({
  eyebrow,
  title,
  tagline,
  hue = 'green',
}: {
  eyebrow: string;
  title: string;
  /** Línea inferior (bilingüe: la decide quien llama, esta función no sabe el idioma). */
  tagline: string;
  hue?: OgHue;
}) {
  const accent = palette[hue];
  const titleSize = title.length > 46 ? 52 : 64;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '76px',
        backgroundColor: palette.bg,
        backgroundImage: `radial-gradient(52% 60% at 6% -6%, ${accent}3d, transparent 70%), radial-gradient(46% 54% at 100% 108%, ${palette.green}2e, transparent 70%)`,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={40} height={40} viewBox={MARK_VIEWBOX} fill="none">
          <path d={GEAR_PATH} fill={palette.green} />
          <path d={STROKE_PATH} fill={palette.fg} />
        </svg>
        <span style={{ fontSize: 28, fontWeight: 600, color: palette.fg, letterSpacing: -0.5 }}>
          DaeTrym
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 980 }}>
        <span
          style={{
            display: 'flex',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            display: 'flex',
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.12,
            color: palette.fg,
            letterSpacing: -1,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingTop: 28,
          borderTop: `1px solid ${palette.hairline}`,
          fontSize: 20,
          color: palette.fgMuted,
        }}
      >
        <span>{tagline}</span>
      </div>
    </div>,
    SIZE,
  );
}
