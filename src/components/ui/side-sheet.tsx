'use client';

import { Dialog } from 'radix-ui';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { X } from 'lucide-react';
import { useVelocityTracker } from '@/components/motion/use-velocity-tracker';
import { cn } from '@/lib/cn';
import { clamp, gesture, reducedFade, resolveSnap, rubberband, spring } from '@/styles/motion';

/** Distancia extra fuera de pantalla: el rebote de un flick nunca deja ver un hueco en el borde. */
const BLEED_REM = 2;
/** Velocidad mínima (px/s) para considerar que el gesto trajo inercia y merece rebote. */
const FLICK_VELOCITY = 100;

type SideSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  closeLabel: string;
  /** Elemento al que se devuelve el foco al cerrar (los toques no siempre enfocan el botón que abre). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
};

type DragState = {
  pointerId: number;
  /** Punto donde se inició el gesto (se reinicia al superar la histéresis: sin salto). */
  originX: number;
  originY: number;
  /** Valor de x en el origen del gesto: se respeta dónde se "agarró" el panel. */
  baseX: number;
  committed: boolean;
};

/**
 * Sheet lateral (entra y sale por la derecha, donde vive el botón que lo abre — apple-design §7).
 *  - Sigue al dedo 1:1 y respeta el punto de agarre; pointer capture tras 10 px de histéresis.
 *  - Interrumpible: agarrarlo a mitad de cierre lo devuelve al dedo desde su posición actual.
 *  - Al soltar: proyección de momentum para decidir abrir/cerrar y traspaso de velocidad al spring.
 *  - Rubber-banding al arrastrar hacia el interior (más allá de su posición abierta).
 *  - Con prefers-reduced-motion: fundido de opacidad, sin desplazamiento ni arrastre. Teclado: Esc y botón.
 */
export function SideSheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  returnFocusRef,
  children,
  className,
}: SideSheetProps) {
  const reduceMotion = useReducedMotion();
  const [present, setPresent] = useState(open);

  const widthRef = useRef(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const closingRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const tracker = useVelocityTracker();

  // x arranca fuera de pantalla; el callback ref (setPanel) lo mide y lo anima al montar.
  const x = useMotionValue(9999);
  const fade = useMotionValue(0);

  const slideProgress = useTransform(() => {
    const width = widthRef.current;
    return width > 0 ? 1 - clamp(x.get() / width, 0, 1) : 0;
  });
  const overlayOpacity = reduceMotion ? fade : slideProgress;

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  const finishClose = useCallback(() => {
    closingRef.current = false;
    setPresent(false);
  }, []);

  const animateClose = useCallback(
    (velocity = 0) => {
      closingRef.current = true;
      stop();
      if (reduceMotion) {
        controlsRef.current = animate(fade, 0, { ...reducedFade, onComplete: finishClose });
        return;
      }
      const flicked = Math.abs(velocity) > FLICK_VELOCITY;
      controlsRef.current = animate(x, widthRef.current, {
        ...(flicked ? spring.momentum : spring.default),
        velocity,
        onComplete: finishClose,
      });
    },
    [finishClose, fade, reduceMotion, stop, x],
  );

  const animateOpen = useCallback(
    (velocity = 0) => {
      stop();
      if (reduceMotion) {
        controlsRef.current = animate(fade, 1, reducedFade);
        return;
      }
      const flicked = Math.abs(velocity) > FLICK_VELOCITY;
      controlsRef.current = animate(x, 0, {
        ...(flicked ? spring.momentum : spring.default),
        velocity,
      });
    },
    [fade, reduceMotion, stop, x],
  );

  /** Cierre iniciado por el usuario (Esc, scrim, botón, gesto). */
  const requestClose = useCallback(
    (velocity = 0) => {
      if (closingRef.current) return;
      onOpenChange(false);
      animateClose(velocity);
    },
    [animateClose, onOpenChange],
  );

  // Montaje físico: el panel debe existir en cuanto se pide abrir (ajuste de estado durante el render).
  if (open && !present) setPresent(true);

  // Sincroniza el estado lógico (`open`) con la animación en curso.
  useEffect(() => {
    if (open) {
      closingRef.current = false;
    } else if (present && !closingRef.current) {
      // Cierre provocado desde fuera (p. ej. cambio de ruta): animar igualmente.
      animateClose(0);
    }
    // `present` se omite a propósito: solo reaccionamos a cambios de `open`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Entrada: Radix Portal monta el contenido DESPUÉS del primer commit, así que el arranque no puede
  // vivir en un effect con dependencias: un callback ref se ejecuta justo cuando el nodo existe
  // (fase de commit, antes del primer pintado), lo mide y lo anima desde fuera de pantalla.
  const setPanel = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        stop();
        return;
      }
      widthRef.current = node.offsetWidth;
      if (reduceMotion) {
        x.set(0);
        fade.set(0);
      } else {
        x.set(widthRef.current);
      }
      animateOpen();
    },
    [animateOpen, fade, reduceMotion, stop, x],
  );

  useEffect(() => () => stop(), [stop]);

  /* ───────────── Gesto de arrastre ───────────── */

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !event.isPrimary || event.button > 0) return;

    // Interrupción: si se está cerrando, el dedo recupera el panel desde su posición ACTUAL.
    if (closingRef.current) {
      closingRef.current = false;
      onOpenChange(true);
    }
    stop();

    dragRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      baseX: x.get(),
      committed: false,
    };
    tracker.reset();
    tracker.push(event.clientX, event.timeStamp);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.originX;
    const dy = event.clientY - drag.originY;

    if (!drag.committed) {
      // Histéresis: decidir la intención antes de tomar el control (los toques y el scroll siguen libres).
      if (Math.abs(dy) > gesture.hysteresis && Math.abs(dy) > Math.abs(dx)) {
        dragRef.current = null;
        return;
      }
      if (Math.abs(dx) <= gesture.hysteresis) return;
      drag.committed = true;
      drag.originX = event.clientX; // sin salto al comprometer
      drag.baseX = x.get();
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    tracker.push(event.clientX, event.timeStamp);
    const raw = drag.baseX + (event.clientX - drag.originX);
    // Más allá de la posición abierta (raw < 0): resistencia progresiva.
    x.set(raw < 0 ? rubberband(raw, widthRef.current) : raw);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (!drag.committed) return;

    const velocity = tracker.velocity(event.timeStamp);
    const target = resolveSnap(x.get(), velocity, [0, widthRef.current]);
    if (target === 0) animateOpen(velocity);
    else requestClose(velocity);
  };

  return (
    <Dialog.Root
      open={present}
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-60 bg-scrim"
            style={{ opacity: overlayOpacity }}
            onClick={() => requestClose()}
          />
        </Dialog.Overlay>

        <Dialog.Content
          asChild
          onCloseAutoFocus={(event) => {
            if (!returnFocusRef?.current) return;
            event.preventDefault();
            returnFocusRef.current.focus();
          }}
        >
          <motion.div
            ref={setPanel}
            className={cn(
              'fixed inset-y-0 z-61 flex flex-col rounded-l-xl material-thick outline-none',
              // touch-action: el navegador solo gestiona el scroll vertical; el horizontal es nuestro.
              'touch-pan-y will-change-transform',
              className,
            )}
            style={{
              right: `-${BLEED_REM}rem`,
              width: `calc(min(88vw, 26rem) + ${BLEED_REM}rem)`,
              paddingRight: `${BLEED_REM}rem`,
              x: reduceMotion ? 0 : x,
              opacity: reduceMotion ? fade : 1,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* Asa: indica que el panel se puede arrastrar (oculta si hay reduced-motion) */}
            <div
              aria-hidden
              className="absolute top-1/2 left-2 h-10 w-1 -translate-y-1/2 rounded-full bg-hairline-strong motion-reduce:hidden"
            />

            <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-2">
              <Dialog.Title className="text-h3">{title}</Dialog.Title>
              <Dialog.Close
                aria-label={closeLabel}
                className="press inline-flex size-8 items-center justify-center rounded-md material-thin text-fg"
              >
                <X aria-hidden className="size-4" strokeWidth={1.5} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">{description}</Dialog.Description>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-8">
              {children}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
