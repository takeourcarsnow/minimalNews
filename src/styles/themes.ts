// Theme type definitions
export type Theme = 'dark' | 'light' | 'retro-green' | 'amber' | 'blue' | 'matrix' | 'solarized-dark' | 'solarized-light';

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
  'retro-green': {
    background: '#000000',
    foreground: '#00ff00',
    primary: '#00ff00',
    secondary: '#008000',
    accent: '#ffff00',
    muted: '#004000',
    border: '#008000',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00ffff',
  },
  amber: {
    background: '#1a0f00',
    foreground: '#ffb000',
    primary: '#ffb000',
    secondary: '#cc8000',
    accent: '#ff6b00',
    muted: '#663300',
    border: '#cc8000',
    success: '#00ff00',
    warning: '#ffb000',
    error: '#ff0000',
    info: '#ffb000',
  },
  blue: {
    background: '#00001a',
    foreground: '#00bfff',
    primary: '#00bfff',
    secondary: '#0080cc',
    accent: '#0080ff',
    muted: '#003366',
    border: '#0080cc',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00bfff',
  },
  matrix: {
    background: '#000000',
    foreground: '#00ff00',
    primary: '#00ff00',
    secondary: '#004400',
    accent: '#00aa00',
    muted: '#002200',
    border: '#004400',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00ff00',
  },
  'solarized-dark': {
    background: '#002b36',
    foreground: '#839496',
    primary: '#268bd2',
    secondary: '#586e75',
    accent: '#b58900',
    muted: '#073642',
    border: '#586e75',
    success: '#859900',
    warning: '#b58900',
    error: '#dc322f',
    info: '#268bd2',
  },
  'solarized-light': {
    background: '#fdf6e3',
    foreground: '#657b83',
    primary: '#2aa198',
    secondary: '#93a1a1',
    accent: '#cb4b16',
    muted: '#eee8d5',
    border: '#93a1a1',
    success: '#859900',
    warning: '#b58900',
    error: '#dc322f',
    info: '#2aa198',
  },
};
