'use client';

import { motion, useScroll, useTransform } from 'motion/react';

/** Distancia de scroll (px) en la que el efecto pasa de invisible a completo. */
const RANGE = 64;

/**
 * Scroll-edge effect (apple-design §12): sin línea divisoria, un degradado con blur bajo el header
 * que aparece a medida que el contenido pasa por debajo. La opacidad sigue el scroll 1:1.
 */
export function ScrollEdge() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, RANGE], [0, 1], { clamp: true });

  return <motion.div aria-hidden className="scroll-edge" style={{ opacity }} />;
}
