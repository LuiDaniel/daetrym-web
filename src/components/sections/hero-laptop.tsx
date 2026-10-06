'use client';

import { useEffect, useRef } from 'react';
import './hero-laptop.css';

type Labels = {
  /** Descripción accesible de la animación. */
  ariaLabel: string;
  /** Textos de la barra de estado del editor. */
  editing: string;
  compiling: string;
  deployed: string;
};

/** Cada línea es una lista de [clase de color, texto]. */
type Line = [string, string][];

// Código que se "escribe": un endpoint que valida la entrada y limita peticiones (seguro desde el diseño).
const LINES: Line[] = [
  [
    ['k', 'import'],
    ['p', ' { z } '],
    ['k', 'from'],
    ['s', " 'zod'"],
    ['p', ';'],
  ],
  [],
  [
    ['k', 'const'],
    ['t', ' Contact'],
    ['p', ' = z.'],
    ['f', 'object'],
    ['p', '({'],
  ],
  [
    ['a', '  email'],
    ['p', ': z.'],
    ['f', 'string'],
    ['p', '().'],
    ['f', 'email'],
    ['p', '(),'],
  ],
  [
    ['a', '  message'],
    ['p', ': z.'],
    ['f', 'string'],
    ['p', '().'],
    ['f', 'max'],
    ['p', '('],
    ['n', '2000'],
    ['p', '),'],
  ],
  [['p', '});']],
  [],
  [
    ['k', 'export async function'],
    ['f', ' POST'],
    ['p', '(req: '],
    ['t', 'Request'],
    ['p', ') {'],
  ],
  [
    ['p', '  '],
    ['k', 'await'],
    ['f', ' rateLimit'],
    ['p', '(req);'],
  ],
  [
    ['p', '  '],
    ['k', 'const'],
    ['x', ' data'],
    ['p', ' = '],
    ['t', 'Contact'],
    ['p', '.'],
    ['f', 'parse'],
    ['p', '('],
    ['k', 'await'],
    ['p', ' req.'],
    ['f', 'json'],
    ['p', '());'],
  ],
  [
    ['p', '  '],
    ['k', 'await'],
    ['p', ' db.'],
    ['f', 'insert'],
    ['p', '(messages).'],
    ['f', 'values'],
    ['p', '(data);'],
  ],
  [
    ['p', '  '],
    ['k', 'return'],
    ['t', ' Response'],
    ['p', '.'],
    ['f', 'json'],
    ['p', '({ ok: '],
    ['n', 'true'],
    ['p', ' });'],
  ],
  [['p', '}']],
];

// Distribución del teclado: 'x' o [id, etiqueta, ancho].
type Key = string | [string, string, number];
const KEYBOARD: Key[][] = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', ['back', '⌫', 1.6]],
  [
    ['tab', '⇥', 1.5],
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    '[',
    ']',
    ['\\', '\\', 1.1],
  ],
  [['caps', '', 1.8], 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", ['enter', '↵', 2]],
  [['shift', '⇧', 2.3], 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', ['rshift', '⇧', 2.5]],
  [
    ['fn', 'fn', 1],
    ['ctrl', '', 1],
    ['alt', '', 1],
    ['cmd', '⌘', 1.3],
    ['space', '', 6],
    ['cmd2', '⌘', 1.3],
    ['alt2', '', 1],
    ['left', '◂', 1],
    ['down', '▾', 1],
    ['right', '▸', 1],
  ],
];
// Caracteres que se escriben con Shift + otra tecla.
const SHIFTED: Record<string, string> = {
  '<': ',',
  '>': '.',
  '"': "'",
  '{': '[',
  '}': ']',
  '(': '9',
  ')': '0',
  '?': '/',
  ':': ';',
  _: '-',
  '+': '=',
};

const STAGE_W = 580;

type KeyEl = HTMLElement & { _t?: ReturnType<typeof setTimeout> };

/**
 * Hero de la Home: una laptop en 3D escribe código (con teclas que se iluminan al pulsarse) y lo
 * "despliega". Es decorativa (contenido aria-hidden, descrita por `aria-label`). El movimiento es
 * imperativo sobre el DOM (el árbol de React nunca se vuelve a renderizar), con limpieza al desmontar.
 * Con `prefers-reduced-motion` se muestra el código completo, estático. Se pausa fuera de pantalla.
 */
export function HeroLaptop({ labels }: { labels: Labels }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
    const stage = q<HTMLElement>('.dl-stage');
    const code = q<HTMLElement>('.dl-code');
    const kb = q<HTMLElement>('.dl-kb');
    const status = q<HTMLElement>('.dl-status');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let paused = false;
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    // ---------- Escala ----------
    const resizeObserver = new ResizeObserver(() => {
      const w = root.clientWidth;
      if (w) stage.style.transform = `scale(${w / STAGE_W})`;
    });
    resizeObserver.observe(root);

    // ---------- Teclado ----------
    kb.textContent = '';
    const keys: Record<string, KeyEl> = {};
    KEYBOARD.forEach((row) => {
      const r = document.createElement('div');
      r.className = 'dl-krow';
      row.forEach((k) => {
        const [id, label, u] = Array.isArray(k) ? k : [k, k.toUpperCase(), 1];
        const el = document.createElement('span');
        el.className = 'dl-key';
        el.style.setProperty('--u', String(u));
        el.textContent = label;
        r.appendChild(el);
        keys[id] = el;
      });
      kb.appendChild(r);
    });

    function tap(el?: KeyEl) {
      if (!el) return;
      el.classList.add('down');
      clearTimeout(el._t);
      el._t = setTimeout(() => el.classList.remove('down'), 110);
      timers.add(el._t);
    }

    function press(ch: string) {
      if (ch === ' ') return tap(keys.space);
      if (ch === '\n') return tap(keys.enter);
      const base = SHIFTED[ch] || ch.toLowerCase();
      if (SHIFTED[ch] || ch !== ch.toLowerCase()) tap(keys.shift);
      tap(keys[base]);
    }

    // ---------- Escritura del código ----------
    const cursor = document.createElement('span');
    cursor.className = 'dl-cursor';

    const sleep = async (ms: number) => {
      await new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        timers.add(id);
      });
      while (paused && !cancelled) await new Promise((r) => setTimeout(r, 250));
      if (cancelled) throw new Error('cancelled');
    };

    function addRow(i: number) {
      code.querySelectorAll('.cur').forEach((r) => r.classList.remove('cur'));
      const row = document.createElement('div');
      row.className = 'dl-row cur';
      row.innerHTML = `<span class="ln">${i + 1}</span><span class="txt"></span>`;
      code.appendChild(row);
      const txt = row.lastChild as HTMLElement;
      txt.appendChild(cursor);
      code.scrollTop = Math.max(0, row.offsetTop + row.offsetHeight + 8 - code.clientHeight);
      return txt;
    }

    async function typeLine(line: Line, i: number) {
      const txt = addRow(i);
      let indent = true; // la sangría la pone el editor, no se teclea
      for (const [cls, str] of line) {
        const sp = document.createElement('span');
        sp.className = 'c-' + cls;
        txt.insertBefore(sp, cursor);
        for (const ch of str) {
          sp.textContent += ch;
          if (ch !== ' ') indent = false;
          if (indent) continue;
          press(ch);
          await sleep(ch === ' ' ? 30 : 30 + Math.random() * 45);
        }
      }
    }

    function setStatus(text: string, cls = '') {
      status.textContent = text;
      status.className = 'dl-status ' + cls;
    }

    function reset() {
      code.textContent = '';
      code.classList.remove('out');
      setStatus(labels.editing);
    }

    async function loop() {
      for (;;) {
        reset();
        await sleep(700);
        for (const [i, line] of LINES.entries()) {
          await typeLine(line, i);
          press('\n');
          await sleep(line.length ? 220 : 120);
        }
        setStatus(labels.compiling, 'busy');
        await sleep(1200);
        setStatus(labels.deployed, 'ok');
        await sleep(3800);
        code.classList.add('out');
        await sleep(700);
      }
    }

    function renderStatic() {
      reset();
      LINES.forEach((line, i) => {
        const txt = addRow(i);
        line.forEach(([cls, str]) => {
          const sp = document.createElement('span');
          sp.className = 'c-' + cls;
          sp.textContent = str;
          txt.insertBefore(sp, cursor);
        });
      });
      setStatus(labels.deployed, 'ok');
    }

    let intersection: IntersectionObserver | undefined;
    if (reduce) {
      renderStatic();
    } else {
      // Pausa cuando la animación no está en pantalla.
      intersection = new IntersectionObserver(([e]) => {
        paused = !e?.isIntersecting;
      });
      intersection.observe(root);
      loop().catch(() => {});
    }

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      intersection?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [labels]);

  return (
    <div ref={rootRef} className="dl" role="img" aria-label={labels.ariaLabel}>
      <div className="dl-stage" aria-hidden>
        <div className="dl-laptop">
          <div className="dl-lid">
            <span className="dl-cam" />
            <div className="dl-screen">
              <div className="dl-tabs">
                <i />
                <i />
                <i />
                <span className="dl-tab">{'route.ts'}</span>
              </div>
              <div className="dl-code" />
              <div className="dl-statusbar">
                <span>{'⎇ main'}</span>
                <span className="dl-status" />
              </div>
            </div>
            <span className="dl-hinge" />
          </div>
          <div className="dl-deck">
            <div className="dl-shadow" />
            <div className="dl-contact" />
            <div className="dl-spill" />
            <div className="dl-kb" />
            <div className="dl-pad" />
            <div className="dl-deck-edge" />
            <div className="dl-deck-side" />
          </div>
        </div>
      </div>
    </div>
  );
}
