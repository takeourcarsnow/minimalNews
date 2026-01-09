import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import type { ApiResponse } from '@/types/api';

// Generic widget data fetching hook
export function useWidgetData<T>(
  apiUrl: string,
  deps: any[] = [],
  options?: {
    initialData?: T | null;
    transformData?: (data: any) => T;
  }
) {
  const [data, setData] = useState<T | null>(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result: ApiResponse<any> = await apiFetch(apiUrl);

    if (result.data) {
      const processedData = options?.transformData
        ? options.transformData(result.data)
        : result.data;
      setData(processedData);
    }
    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  }, [apiUrl, options?.transformData]);

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

// Widget props management hook
export function useWidgetProps<T extends Record<string, any>>(
  initialProps: T,
  onPropsChange?: (props: T) => void
) {
  const [props, setProps] = useState<T>(initialProps);

  const updateProps = useCallback((newProps: Partial<T>) => {
    setProps(prev => {
      const updated = { ...prev, ...newProps };
      onPropsChange?.(updated);
      return updated;
    });
  }, [onPropsChange]);

  useEffect(() => {
    if (initialProps && Object.keys(initialProps).length > 0) {
      setProps(initialProps);
    }
  }, [initialProps]);

  return { props, updateProps };
}