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
];

export function WidgetProvider({ children }: { children: ReactNode }) {
  // Load enabled widgets from localStorage (persisted by id)
  const loadInitialWidgets = () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('enabledWidgets') : null;
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        // Map ids to available widget configs (preserve any saved props if needed)
        return ids
          .map(id => AVAILABLE_WIDGETS.find(w => w.id === id))
          .filter(Boolean) as WidgetConfig[];
      }
    } catch (err) {
      // ignore and fallback
    }
    return DEFAULT_WIDGETS;
  };

  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadInitialWidgets);
  const [refreshKey, setRefreshKey] = useState(0);

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