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
    switch (command) {
      case 'weather':
        updateWidgetProps('weather', { defaultLocation: args.join(' ') || 'New York' });
        // Trigger refresh for weather widget
        setRefreshKey(prev => prev + 1);
        break;
      case 'news':
        updateWidgetProps('news', { category: args[0] || 'general' });
        setRefreshKey(prev => prev + 1);
        break;
      case 'reddit':
        updateWidgetProps('reddit', { subreddit: args[0] || 'all' });
        setRefreshKey(prev => prev + 1);
        break;
      case 'hackernews':
        setRefreshKey(prev => prev + 1);
        break;
      case 'trending':
        setRefreshKey(prev => prev + 1);
        break;
      case 'quote':
        setRefreshKey(prev => prev + 1);
        break;
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