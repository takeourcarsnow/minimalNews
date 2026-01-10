'use client';

import { useEffect } from 'react';
import type { NewsItem } from '@/types/api';
import TerminalBox from '@/components/ui/TerminalBox';
import TerminalList from '@/components/ui/TerminalList';
import { useWidgetData, useWidgetProps } from '@/hooks/useWidget';
import styles from './NewsWidget.module.css';

const CATEGORIES = ['all', 'technology', 'business', 'science', 'health', 'politics'];

function timeAgo(date: string): string {
  const now = new Date();
  const published = new Date(date);
  const diffMs = now.getTime() - published.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface NewsWidgetProps {
  category?: string;
}

export default function NewsWidget({ category: initialCategory = 'all' }: NewsWidgetProps) {
  const { props: { category }, updateProps } = useWidgetProps({ category: initialCategory });
  const { data: news, loading, error, refetch } = useWidgetData<NewsItem[]>(
    `/api/news?category=${category}&limit=10`,
    [category]
  );

  useEffect(() => {
    if (initialCategory !== category) {
      updateProps({ category: initialCategory });
    }
  }, [initialCategory]);

  const handleCategoryChange = (newCategory: string) => {
    updateProps({ category: newCategory });
  };

  const listItems = (news || []).map((item) => ({
    id: item.id,
    content: (
      <div className={styles.newsItem}>
        <span className={styles.title}>{item.title}</span>
        {item.category && (
          <span className={styles.category}>[{item.category}]</span>
        )}
      </div>
    ),
    meta: `${item.source} • ${timeAgo(item.publishedAt)}`,
    url: item.url,
  }));

  return (
    <TerminalBox
      title="news --headlines"
      icon="📰"
      status={`${news?.length || 0} articles`}
      loading={loading}
      error={loading ? null : error}
    >
      <div className={styles.container}>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
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
