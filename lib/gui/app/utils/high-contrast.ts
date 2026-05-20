/**
 * High contrast mode for accessibility.
 * Provides theme overrides for visually impaired users.
 */

export interface HighContrastTheme {
  background: string;
  foreground: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  border: string;
  focusRing: string;
  buttonBg: string;
  buttonFg: string;
  inputBg: string;
  inputFg: string;
  inputBorder: string;
}

export const HIGH_CONTRAST_DARK: HighContrastTheme = {
  background: '#000000',
  foreground: '#FFFFFF',
  accent: '#00FFFF',
  error: '#FF4444',
  success: '#44FF44',
  warning: '#FFFF00',
  border: '#FFFFFF',
  focusRing: '#00FFFF',
  buttonBg: '#FFFFFF',
  buttonFg: '#000000',
  inputBg: '#1A1A1A',
  inputFg: '#FFFFFF',
  inputBorder: '#FFFFFF',
};

export const HIGH_CONTRAST_LIGHT: HighContrastTheme = {
  background: '#FFFFFF',
  foreground: '#000000',
  accent: '#0000CC',
  error: '#CC0000',
  success: '#006600',
  warning: '#CC6600',
  border: '#000000',
  focusRing: '#0000CC',
  buttonBg: '#000000',
  buttonFg: '#FFFFFF',
  inputBg: '#F0F0F0',
  inputFg: '#000000',
  inputBorder: '#000000',
};

export function detectSystemHighContrast(): boolean {
  // Check for forced-colors media query support indicator
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(forced-colors: active)').matches;
  }
  return false;
}

export function getHighContrastCSS(theme: HighContrastTheme): string {
  return `
    :root {
      --hc-bg: ${theme.background};
      --hc-fg: ${theme.foreground};
      --hc-accent: ${theme.accent};
      --hc-error: ${theme.error};
      --hc-success: ${theme.success};
      --hc-warning: ${theme.warning};
      --hc-border: ${theme.border};
      --hc-focus: ${theme.focusRing};
    }
    * { border-color: var(--hc-border) !important; }
    *:focus { outline: 3px solid var(--hc-focus) !important; outline-offset: 2px !important; }
    body { background: var(--hc-bg) !important; color: var(--hc-fg) !important; }
  `.trim();
}
