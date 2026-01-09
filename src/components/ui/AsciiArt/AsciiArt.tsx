import styles from './AsciiArt.module.css';

interface AsciiArtProps {
  art: string;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'muted';
  centered?: boolean;
}

export default function AsciiArt({ art, color = 'primary', centered = false }: AsciiArtProps) {
  return (
    <pre
      className={`${styles.art} ${styles[color]} ${centered ? styles.centered : ''}`}
      aria-hidden="true"
    >
      {art}
    </pre>
  );
}

// Common ASCII art patterns
export const ASCII_PATTERNS = {
  divider: '─'.repeat(60),
  doubleDivider: '═'.repeat(60),
  wave: '~'.repeat(60),
  dots: '·'.repeat(60),
  arrow: '►',
  bullet: '•',
  check: '✓',
  cross: '✗',
  star: '★',
  clock: '◷',
  sun: '☀',
  moon: '☾',
  cloud: '☁',
  rain: '☔',
  snow: '❄',
};

export const WEATHER_ASCII = {
  sunny: `
    \\   /
     .-.
  ― (   ) ―
     \`-'
    /   \\
  `,
  cloudy: `
       .--.
    .-(    ).
   (___.__)__)
  `,
  rainy: `
       .--.
    .-(    ).
   (___.__)__)
    ' ' ' '
   ' ' ' '
  `,
  snowy: `
       .--.
    .-(    ).
   (___.__)__)
    * * * *
   * * * *
  `,
  stormy: `
       .--.
    .-(    ).
   (___.__)__)
     ⚡ ⚡
  `,
  partlyCloudy: `
   \\  /
 _ /"".--.
   \\_(   ).
   /(___(__)
  `,
};

export const LOGO_ASCII = `
╔════════════════════════════════════════════════════════════╗
║  _____ _____ ____  __  __ ___ _   _    _    _              ║
║ |_   _| ____|  _ \\|  \\/  |_ _| \\ | |  / \\  | |             ║
║   | | |  _| | |_) | |\\/| || ||  \\| | / _ \\ | |             ║
║   | | | |___|  _ <| |  | || || |\\  |/ ___ \\| |___          ║
║   |_| |_____|_| \\_\\_|  |_|___|_| \\_/_/   \\_\\_____|         ║
║                                                            ║
║            D I G I T A L   D E T O X   H U B               ║
╚════════════════════════════════════════════════════════════╝
`;
