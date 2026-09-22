'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ReactNode } from 'react';

/**
 * Tooltip breve (Radix): aparece con foco de teclado o con el puntero, se cierra con Esc y no bloquea
 * nada. Solo para información COMPLEMENTARIA: lo esencial va siempre visible. Material «thick».
 */
export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-70 max-w-64 rounded-md material-thick px-2.5 py-1.5 text-label text-fg"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
