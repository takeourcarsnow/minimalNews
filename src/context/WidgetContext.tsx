'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface WidgetConfig {
  id: string;
  component: string;
  props?: Record<string, any>;
}

interface WidgetContextType {
  widgets: WidgetConfig[];
  availableWidgets: WidgetConfig[];
  updateWidgetProps: (id: string, props: Record<string, any>) => void;
  refreshAllWidgets: () => void;
  executeCommand: (command: string, args: string[]) => void;
  refreshKey: number;
  toggleWidget: (id: string) => void;
  isEnabled: (id: string) => boolean;
  moveWidget: (id: string, dir: 'up' | 'down') => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'quote', component: 'QuoteWidget' },
  { id: 'weather', component: 'WeatherWidget' },
  { id: 'trending', component: 'TrendingWidget' },
  { id: 'hackernews', component: 'HackerNewsWidget' },
  { id: 'news', component: 'NewsWidget' },
  { id: 'reddit', component: 'RedditWidget' },
];

// All available widgets (includes new widgets like crypto and clocks)
const AVAILABLE_WIDGETS: WidgetConfig[] = [
  ...DEFAULT_WIDGETS,
  { id: 'crypto', component: 'CryptoWidget' },
  { id: 'clocks', component: 'WorldClocksWidget' },
  { id: 'todo', component: 'TodoWidget' },
  { id: 'systeminfo', component: 'SystemInfoWidget' },
];

export function WidgetProvider({ children }: { children: ReactNode }) {
  // Initialize widgets from localStorage if available to preserve enabled/disabled state across refreshes.
  const [refreshKey, setRefreshKey] = useState(0);

  const getInitialWidgets = () => {
    try {
      if (typeof window === 'undefined') return DEFAULT_WIDGETS;
      const raw = localStorage.getItem('enabledWidgets');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const initial = ids
          .map(id => AVAILABLE_WIDGETS.find(w => w.id === id))
          .filter(Boolean) as WidgetConfig[];
        if (initial.length) return initial;
      }
    } catch (err) {
      // ignore
    }
    return DEFAULT_WIDGETS;
  };

  const [widgets, setWidgets] = useState<WidgetConfig[]>(getInitialWidgets);

  useEffect(() => {
    try {
      const ids = widgets.map(w => w.id);
      localStorage.setItem('enabledWidgets', JSON.stringify(ids));
    } catch (err) {
      // ignore
    }
  }, [widgets]);

  const updateWidgetProps = useCallback((id: string, props: Record<string, any>) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, props: { ...widget.props, ...props } } : widget
    ));
  }, []);

  const refreshAllWidgets = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Toggle whether a widget is enabled/visible
  const toggleWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const exists = prev.some(w => w.id === id);
      if (exists) {
        return prev.filter(w => w.id !== id);
      }
      const found = AVAILABLE_WIDGETS.find(w => w.id === id);
      if (found) return [...prev, found];
      return prev;
    });
  }, []);

  const isEnabled = useCallback((id: string) => {
    return widgets.some(w => w.id === id);
  }, [widgets]);

  // Move widget up or down within the enabled widgets list
  const moveWidget = useCallback((id: string, dir: 'up' | 'down') => {
    setWidgets(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx === -1) return prev;
      const newIdx = dir === 'up' ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1);
      if (newIdx === idx) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(newIdx, 0, item);
      return arr;
    });
  }, []);

  const executeCommand = useCallback((command: string, args: string[]) => {
    const commandMap: Record<string, (args: string[]) => void> = {
      weather: (args) => updateWidgetProps('weather', { defaultLocation: args.join(' ') || 'New York' }),
      news: (args) => updateWidgetProps('news', { category: args[0] || 'general' }),
      reddit: (args) => updateWidgetProps('reddit', { subreddit: args[0] || 'all' }),
      hackernews: () => {},
      trending: () => {},
      quote: () => {},
    };

    const action = commandMap[command];
    if (action) {
      action(args);
      // Trigger refresh for widgets that need it
      if (['weather', 'news', 'reddit', 'hackernews', 'trending', 'quote'].includes(command)) {
        setRefreshKey(prev => prev + 1);
      }
    }
  }, [updateWidgetProps]);

  const value = {
    widgets,
    availableWidgets: AVAILABLE_WIDGETS,
    updateWidgetProps,
    refreshAllWidgets,
    executeCommand,
    refreshKey,
    toggleWidget,
    isEnabled,
    moveWidget,
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}