'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { FaqItem } from '@/schemas/page-content';
import { reducedFade, spring } from '@/styles/motion';

/**
 * Acordeón de preguntas frecuentes. La altura se anima con un spring (interrumpible: si se pulsa a
 * mitad de apertura, parte de la altura ACTUAL y cambia de dirección sin saltos). Solo una respuesta
 * abierta a la vez. Con prefers-reduced-motion la altura cambia al instante y solo se funde la opacidad.
 * Accesibilidad: botón con aria-expanded/aria-controls; la respuesta cerrada es `inert`, por lo que
 * no recibe foco ni la leen los lectores de pantalla.
 */
export function Faq({ items, idPrefix }: { items: FaqItem[]; idPrefix: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-lg material-panel">
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${idPrefix}-question-${index}`;
        const panelId = `${idPrefix}-answer-${index}`;

        return (
          <div key={`${index}:${item.q}`}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-3.5 text-left text-title transition-colors hover:bg-glass-hover focus-visible:outline-offset-[-3px]"
              >
                <span>{item.q}</span>
                <motion.span
                  aria-hidden
                  className="inline-flex shrink-0 text-h-fg"
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={spring.snappy}
                >
                  <Plus className="size-4" strokeWidth={1.75} />
                </motion.span>
              </button>
            </h3>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              initial={false}
              animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
              transition={
                reduceMotion ? { height: { duration: 0 }, opacity: reducedFade } : spring.default
              }
              className="overflow-hidden"
            >
              <p className="px-5 pb-5 text-body text-fg-muted">{item.a}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
