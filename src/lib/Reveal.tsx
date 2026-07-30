import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

// The system's signature glide — patient camera moves, never UI snaps
export const GLIDE = [0.19, 1, 0.22, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduce
          ? { opacity: 0 }
          : {
              opacity: 0,
              transform: 'translateY(56px)',
              filter: 'blur(10px)',
            }
      }
      whileInView={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }
      }
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, delay, ease: GLIDE }}
    >
      {children}
    </motion.div>
  );
}
