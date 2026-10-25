import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useProgress } from '@/hooks/useProgress';

/**
 * Wraps route content in a short fade/slide transition. The animation is
 * skipped entirely when the OS or the in-app setting asks for reduced motion,
 * and it only animates opacity and transform so it stays off the layout path.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { progress } = useProgress();
  const reduced = prefersReducedMotion || progress.settings.reducedMotion;

  if (reduced) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
