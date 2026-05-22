/**
 * Theme manager — centralized theme configuration with custom theme support.
 */

export interface Theme {
  name: string;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
    border: string;
    progressBar: string;
    progressGlow: string;
  };
  fonts: {
    primary: string;
    monospace: string;
    size: { small: string; normal: string; large: string; xlarge: string };
  };
  spacing: {
    xs: string; sm: string; md: string; lg: string; xl: string;
  };
  borderRadius: {
    small: string; medium: string; large: string; pill: string;
  };
}

export const SPARK_DARK: Theme = {
  name: 'Spark Dark',
  isDark: true,
  colors: {
    primary: '#5b54e6',
    secondary: '#7c6bf0',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#e8e8e8',
    textSecondary: '#a0a0a0',
    accent: '#00d4ff',
    error: '#ff4757',
    success: '#2ed573',
    warning: '#ffa502',
    border: '#2a2a4a',
    progressBar: '#5b54e6',
    progressGlow: 'rgba(91, 84, 230, 0.4)',
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    monospace: 'JetBrains Mono, Fira Code, Consolas, monospace',
    size: { small: '12px', normal: '14px', large: '16px', xlarge: '24px' },
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  borderRadius: { small: '4px', medium: '8px', large: '12px', pill: '9999px' },
};

export const SPARK_LIGHT: Theme = {
  ...SPARK_DARK,
  name: 'Spark Light',
  isDark: false,
  colors: {
    ...SPARK_DARK.colors,
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
  },
};

export function getThemeCSS(theme: Theme): string {
  const vars = Object.entries(theme.colors)
    .map(([key, val]) => `--spark-${key}: ${val};`)
    .join('\n  ');
  return `:root {\n  ${vars}\n}`;
}

export function getSystemThemePreference(): 'dark' | 'light' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}
