'use client';

import { useEffect, useState } from 'react';
import TerminalBox from '@/components/ui/TerminalBox';
import styles from './CryptoWidget.module.css';

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE'];
const SYMBOL_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
};

function formatChange(val: number) {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export default function CryptoWidget() {
  const [symbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const ids = symbols.map(s => SYMBOL_MAP[s] || '').filter(Boolean).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
        const res = await fetch(url);
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err) {
        if (mounted) setError('Failed to fetch prices');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    const timer = setInterval(fetchData, 60 * 1000); // refresh every minute
    return () => { mounted = false; clearInterval(timer); };
  }, [symbols]);

  return (
    <TerminalBox title="crypto --prices" icon="💱" status={data ? `Updated: ${new Date().toLocaleTimeString()}` : ''} loading={loading} error={loading ? null : error}>
      <div className={styles.container}>
        <div className={styles.headerLine}>$ {symbols.join(', ')}</div>
        <div className={styles.list}>
          {symbols.map((s) => {
            const id = SYMBOL_MAP[s];
            const info = data?.[id];
            const price = info?.usd;
            const change = info?.usd_24h_change;
            return (
              <div key={s} className={styles.row}>
                <div className={styles.symbol}>{s}</div>
                <div className={styles.price}>{price ? `$${price.toFixed(2)}` : '—'}</div>
                <div className={change != null ? (change >= 0 ? styles.changeUp : styles.changeDown) : ''}>
                  {change != null ? formatChange(change) : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TerminalBox>
  );
}
