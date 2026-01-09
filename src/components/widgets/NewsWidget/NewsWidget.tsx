'use client';

import { useState, useEffect } from 'react';
import type { NewsItem, ApiResponse } from '@/types/api';
import TerminalBox from '@/components/ui/TerminalBox';
import TerminalList from '@/components/ui/TerminalList';
import styles from './NewsWidget.module.css';

const CATEGORIES = ['all', 'technology', 'business', 'science', 'health', 'politics'];

interface NewsWidgetProps {
  category?: string;
}

export default function NewsWidget({ category: initialCategory = 'all' }: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    fetchNews();
  }, [category]);

  async function fetchNews() {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching news for category:', category);
      const response = await fetch(`/api/news?category=${category}&limit=10`);
      console.log('News API response status:', response.status);

      // Treat only an explicit `ok === false` as an HTTP error. Some tests mock `fetch`
      // with a simple object that doesn't include `ok`, `status` or `statusText`.
      if (response.ok === false) {
        throw new Error(`HTTP ${response.status ?? 'unknown'}: ${response.statusText ?? ''}`);
      }

      const result: ApiResponse<NewsItem[]> = await response.json();
      console.log('News API result:', result);

      if (result.data) {
        setNews(result.data);
        console.log('Set news data:', result.data.length, 'items');
      }
      if (result.error) {
        setError(result.error);
        console.error('News API error:', result.error);
      }
    } catch (err) {
      // Prefer a generic message for UI display on network failures to match tests
      setError('Failed to fetch news');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const listItems = news.map((item) => ({
    id: item.id,
    content: (
      <div className={styles.newsItem}>
        <span className={styles.title}>{item.title}</span>
        {item.category && (
          <span className={styles.category}>[{item.category}]</span>
        )}
      </div>
    ),
    meta: `${item.source} • ${new Date(item.publishedAt).toLocaleDateString()}`,
    url: item.url,
  }));

  return (
    <TerminalBox
      title="news --headlines"
      icon="📰"
      status={`${news.length} articles`}
      loading={loading}
      error={loading ? null : error}
    >
      <div className={styles.container}>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`${styles.categoryBtn} ${category === cat ? styles.active : ''}`}
            >
              [{cat}]
            </button>
          ))}
        </div>

        <TerminalList items={listItems} maxItems={10} />
      </div>
    </TerminalBox>
  );
}
