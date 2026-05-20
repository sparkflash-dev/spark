/**
 * Reduced motion preferences — respect prefers-reduced-motion.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

export function getAnimationDuration(defaultMs: number): number {
  return prefersReducedMotion() ? 0 : defaultMs;
}

export function getTransitionCSS(property: string, duration: number, easing = 'ease'): string {
  if (prefersReducedMotion()) {
    return `${property} 0ms`;
  }
  return `${property} ${duration}ms ${easing}`;
}

export const MOTION_SAFE_STYLES = {
  fadeIn: {
    normal: 'opacity 200ms ease-in',
    reduced: 'opacity 0ms',
  },
  slideUp: {
    normal: 'transform 300ms ease-out, opacity 200ms ease-in',
    reduced: 'opacity 0ms',
  },
  progressBar: {
    normal: 'width 150ms linear',
    reduced: 'width 0ms',
  },
  tooltip: {
    normal: 'opacity 150ms ease-in, transform 150ms ease-out',
    reduced: 'opacity 0ms',
  },
};

export function getMotionStyle(key: keyof typeof MOTION_SAFE_STYLES): string {
  const styles = MOTION_SAFE_STYLES[key];
  return prefersReducedMotion() ? styles.reduced : styles.normal;
}
