'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { commandUtils } from '@/utils/commands';
import TypingAnimation from '@/components/ui/TypingAnimation';
import styles from './CommandLine.module.css';

interface CommandLineProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string, args: string[]) => void;
}

interface CommandHistory {
  command: string;
  output: string;
  timestamp: Date;
}

const COMMANDS = [
  'help - Show available commands',
  'weather [location] - Get weather for location',
  'news [category] - Get news (tech, business, sports, etc.)',
  'reddit [subreddit] - Get posts from subreddit',
  'hackernews - Get Hacker News top stories',
  'trending - Get trending topics',
  'quote - Get random quote',
  'theme [name] - Change theme (dark, light, retro-green, amber, blue, matrix, solarized-dark, solarized-light)',
  'clear - Clear terminal',
  'exit - Close CLI',
];

export default function CommandLine({ isOpen, onClose, onCommand }: CommandLineProps) {
  const { theme, setTheme, availableThemes } = useTheme();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHistory([]);
      setCurrentLine(0);
      addToHistory('', 'Terminal Detox CLI v1.0.0\nType "help" for available commands.\n');
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  interface CommandHistory {
    id: string;
    command: string;
    output: string;
    timestamp: Date;
    type?: 'info' | 'success' | 'error' | 'loading' | 'command';
  }

  const addToHistory = useCallback((command: string, output: string, type: CommandHistory['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setHistory(prev => [...prev, {
      id,
      command,
      output,
      timestamp: new Date(),
      type,
    }]);
    return id;
  }, []);

  const updateHistory = useCallback((id: string, output: string, type?: CommandHistory['type']) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, output, type: type ?? h.type } : h));
  }, []);

  // Perform the underlying API calls so the CLI shows results immediately
  const runAsyncCommand = useCallback(async (command: string, args: string[]) => {
    // Insert a loading line that we'll update later
    const loadingId = addToHistory('', 'Loading...', 'loading');

    try {
      let result: string;

      switch (command) {
        case 'weather':
          result = await commandUtils.fetchWeather(args.join(' '));
          break;
        case 'news':
          result = await commandUtils.fetchNews(args[0] || 'general');
          break;
        case 'hackernews':
          result = await commandUtils.fetchHackerNews();
          break;
        case 'trending':
          result = await commandUtils.fetchTrending();
          break;
        case 'quote':
          result = await commandUtils.fetchQuote();
          break;
        case 'reddit':
          result = await commandUtils.fetchReddit(args[0] || 'all');
          break;
        default:
          updateHistory(loadingId, `Unknown command: ${command}`, 'error');
          return;
      }

      updateHistory(loadingId, result, 'success');
      // Propagate to widget
      onCommand(command, args);
    } catch (err) {
      updateHistory(loadingId, `Error fetching ${command}: ${(err as Error).message}`, 'error');
    }
  }, [addToHistory, updateHistory, onCommand]);

  const parseCommand = useCallback((command: string) => {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        return COMMANDS.join('\n');

      case 'weather':
        if (args.length === 0) {
          return 'Usage: weather [location]\nExample: weather New York';
        }
        onCommand('weather', args);
        runAsyncCommand('weather', args);
        return `Fetching weather for ${args.join(' ')}...`;

      case 'news':
        const category = args[0] || 'general';
        onCommand('news', [category]);
        runAsyncCommand('news', [category]);
        return `Fetching ${category} news...`;

      case 'reddit':
        const subreddit = args[0] || 'all';
        onCommand('reddit', [subreddit]);
        runAsyncCommand('reddit', [subreddit]);
        return `Fetching posts from r/${subreddit}...`;

      case 'hackernews':
        onCommand('hackernews', []);
        runAsyncCommand('hackernews', []);
        return 'Fetching Hacker News top stories...';

      case 'trending':
        onCommand('trending', []);
        runAsyncCommand('trending', []);
        return 'Fetching trending topics...';

      case 'quote':
        onCommand('quote', []);
        runAsyncCommand('quote', []);
        return 'Fetching random quote...';

      case 'theme':
        if (args.length === 0) {
          return `Current theme: ${theme}\nAvailable themes: ${availableThemes.join(', ')}`;
        }
        const newTheme = args[0];
        if (availableThemes.includes(newTheme as any)) {
          setTheme(newTheme as any);
          return `Theme changed to ${newTheme}`;
        }
        return `Invalid theme. Available: ${availableThemes.join(', ')}`;

      case 'clear':
        setHistory([]);
        return '';

      case 'exit':
        onClose();
        return 'Goodbye!';

      default:
        return `Command not found: ${cmd}. Type "help" for available commands.`;
    }
  }, [theme, setTheme, availableThemes, onCommand, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    const output = parseCommand(command);

    if (output) {
      addToHistory(command, output);
    }

    setInput('');
    setCurrentLine(history.length + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.dots}>
            <span className={`${styles.dot} ${styles.red}`}></span>
            <span className={`${styles.dot} ${styles.yellow}`}></span>
            <span className={`${styles.dot} ${styles.green}`}></span>
          </div>
          <div className={styles.title}>
            <span className={styles.icon}>▸</span>
            <span>Terminal CLI</span>
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.terminal} ref={terminalRef}>
          {history.map((item) => {
            const outputClass =
              item.type === 'error' ? `${styles.output} ${styles.error}` :
              item.type === 'success' ? `${styles.output} ${styles.success}` :
              item.type === 'loading' ? `${styles.output} ${styles.loading}` :
              `${styles.output} ${styles.info}`;

            const textClass =
              item.type === 'error' ? styles.textError :
              item.type === 'success' ? styles.textSuccess :
              item.type === 'loading' ? styles.textLoading :
              styles.textInfo;

            return (
              <div key={item.id} className={styles.line}>
                {item.command && (
                  <div className={styles.inputLine}>
                    <span className={styles.prompt}>$</span>
                    <span className={styles.commandText}>{item.command}</span>
                  </div>
                )}
                {item.output && (
                  <div className={outputClass}>
                    {item.type === 'loading' && <span className={styles.spinner}>◐</span>}
                    <TypingAnimation
                      text={item.output}
                      speed={20}
                      delay={item.command ? 100 : 0}
                      className={textClass}
                    />
                  </div>
                )}
              </div>
            );
          })}

          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <span className={styles.prompt}>$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className={styles.input}
              autoComplete="off"
            />
          </form>
        </div>
      </div>
    </div>
  );
}