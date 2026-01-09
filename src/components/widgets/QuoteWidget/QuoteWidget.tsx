'use client';

import { useState, useEffect } from 'react';
import type { QuoteOfTheDay, ApiResponse } from '@/types/api';
import styles from './QuoteWidget.module.css';

export default function QuoteWidget() {
  const [quote, setQuote] = useState<QuoteOfTheDay | null>(null);

  useEffect(() => {
    fetchQuote();
  }, []);

  async function fetchQuote() {
    try {
      const response = await fetch('/api/quote');
      const result: ApiResponse<QuoteOfTheDay> = await response.json();
      if (result.data) {
        setQuote(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch quote');
    }
  }

  if (!quote) return null;

  return (
    <div className={styles.container}>
      <div className={styles.quote}>
        <span className={styles.mark}>"</span>
        {quote.text}
        <span className={styles.mark}>"</span>
      </div>
      <div className={styles.author}>— {quote.author}</div>
    </div>
  );
}
