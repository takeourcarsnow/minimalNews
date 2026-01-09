'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useWidgets } from '@/context/WidgetContext';

interface KeyboardShortcutsProps {
  onOpenCli?: () => void;
  onToggleFocus?: () => void;
}

export function useKeyboardShortcuts({ onOpenCli, onToggleFocus }: KeyboardShortcutsProps) {
  const { nextTheme } = useTheme();
  const { refreshAllWidgets } = useWidgets();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 't':
            event.preventDefault();
            nextTheme();
            break;
          case 'r':
            event.preventDefault();
            refreshAllWidgets();
            break;
          case 'f':
            event.preventDefault();
            onToggleFocus?.();
            break;
          case 'k':
            event.preventDefault();
            onOpenCli?.();
            break;
        }
      }

      // Escape key handling
      if (event.key === 'Escape') {
        // Could be handled by individual components
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nextTheme, refreshAllWidgets, onOpenCli, onToggleFocus]);
}