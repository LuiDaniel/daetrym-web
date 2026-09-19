/** Utilidades de color para verificar contraste (WCAG 2.x) directamente sobre tokens.css. */

export type Rgba = { r: number; g: number; b: number; a: number };

/** Acepta #rgb, #rrggbb y rgb(r g b / a) (sintaxis usada en tokens.css). */
export function parseColor(input: string): Rgba {
  const value = input.trim().toLowerCase();

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    if (full.length !== 6) throw new Error(`Color hex inválido: ${input}`);
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }

  const match = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/,
  );
  if (match) {
    const [, r, g, b, a] = match;
    const alpha = a === undefined ? 1 : a.endsWith('%') ? parseFloat(a) / 100 : parseFloat(a);
    return { r: Number(r), g: Number(g), b: Number(b), a: alpha };
  }

  throw new Error(`Formato de color no soportado: ${input}`);
}

/** Compone `top` (con alpha) sobre `bottom` opaco. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

function channel(value: number) {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance({ r, g, b }: Rgba) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Ratio de contraste WCAG entre dos colores opacos. */
export function contrastRatio(a: Rgba, b: Rgba) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Extrae `--nombre: valor;` de un bloque CSS cuyo selector coincide con `selector`. */
export function readTokens(css: string, selector: RegExp): Record<string, string> {
  // Los comentarios se quitan primero: si no, contaminan el selector capturado.
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const tokens: Record<string, string> = {};
  for (const [, sel, body] of blocks) {
    if (!sel || !body || !selector.test(sel.trim())) continue;
    for (const [, name, val] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      if (name && val) tokens[name] = val.trim();
    }
  }
  return tokens;
}
