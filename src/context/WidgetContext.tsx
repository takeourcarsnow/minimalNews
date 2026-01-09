'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface WidgetConfig {
  id: string;
  component: string;
  props?: Record<string, any>;
}

interface WidgetContextType {
  widgets: WidgetConfig[];
  updateWidgetProps: (id: string, props: Record<string, any>) => void;
  refreshAllWidgets: () => void;
  executeCommand: (command: string, args: string[]) => void;
  refreshKey: number;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'quote', component: 'QuoteWidget' },
  { id: 'weather', component: 'WeatherWidget', props: { defaultLocation: 'New York' } },
  { id: 'trending', component: 'TrendingWidget' },
  { id: 'hackernews', component: 'HackerNewsWidget' },
  { id: 'news', component: 'NewsWidget' },
  { id: 'reddit', component: 'RedditWidget' },
];

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [refreshKey, setRefreshKey] = useState(0);

  const updateWidgetProps = useCallback((id: string, props: Record<string, any>) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, props: { ...widget.props, ...props } } : widget
    ));
  }, []);

  const refreshAllWidgets = useCallback(() => {
    setRefreshKey(prev => prev + 1);
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
    updateWidgetProps,
    refreshAllWidgets,
    executeCommand,
    refreshKey,
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