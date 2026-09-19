'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * `reducedMotion="user"`: con prefers-reduced-motion, motion desactiva las animaciones de
 * transformación (slides, escalas) y conserva las de opacidad/color (apple-design §14).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
