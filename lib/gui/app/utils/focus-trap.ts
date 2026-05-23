/**
 * Focus trap utility — trap keyboard focus within modals and dialogs.
 * Essential for accessibility compliance.
 */

export interface FocusTrapConfig {
  containerSelector: string;
  initialFocusSelector?: string;
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selectors))
    .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[0] || null;
}

export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] || null;
}

export function shouldTrapFocus(event: KeyboardEvent, container: HTMLElement): {
  shouldTrap: boolean;
  targetElement?: HTMLElement;
} {
  if (event.key !== 'Tab') {
    return { shouldTrap: false };
  }

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    return { shouldTrap: true }; // Prevent focus from leaving
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement;

  if (event.shiftKey && active === first) {
    return { shouldTrap: true, targetElement: last };
  }

  if (!event.shiftKey && active === last) {
    return { shouldTrap: true, targetElement: first };
  }

  return { shouldTrap: false };
}
