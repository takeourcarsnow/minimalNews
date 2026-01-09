// Theme type definitions
export type Theme = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    primary: '#58a6ff',
    secondary: '#8b949e',
    accent: '#f0883e',
    muted: '#484f58',
    border: '#30363d',
    success: '#3fb950',
    warning: '#d29922',
    error: '#f85149',
    info: '#58a6ff',
  },
  light: {
    background: '#ffffff',
    foreground: '#24292f',
    primary: '#0969da',
    secondary: '#57606a',
    accent: '#bf8700',
    muted: '#8c959f',
    border: '#d0d7de',
    success: '#1a7f37',
    warning: '#9a6700',
    error: '#cf222e',
    info: '#0969da',
  },
};
