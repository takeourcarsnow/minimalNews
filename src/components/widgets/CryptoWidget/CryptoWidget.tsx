'use client';

import { useEffect, useState, useRef } from 'react';
import TerminalBox from '@/components/ui/TerminalBox';
import styles from './CryptoWidget.module.css';

const DEFAULT_CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE'];
const DEFAULT_STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
const CRYPTO_SYMBOL_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
};

type Mode = 'crypto' | 'stocks';

const AVAILABLE_PERIODS = ['1d', '1w', '1m'];

function formatChange(val: number) {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export default function CryptoWidget() {
  const [mode, setMode] = useState<Mode>('crypto');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(DEFAULT_STOCK_SYMBOLS);
  const [newSymbol, setNewSymbol] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['1d','1w','1m']);
  const symbols = mode === 'crypto' ? DEFAULT_CRYPTO_SYMBOLS : selectedSymbols;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAddSymbol = () => {
    const s = newSymbol.trim().toUpperCase();
    if (!s) return;
    if (!selectedSymbols.map(x => x.toUpperCase()).includes(s)) {
      setSelectedSymbols([...selectedSymbols, s]);
      setNotice(`Added ${s}`);
      setTimeout(() => setNotice(''), 2000);
    } else {
      setNotice(`${s} already added`);
      setTimeout(() => setNotice(''), 1500);
    }
    setNewSymbol('');
    // refocus the input so user can quickly add another symbol
    inputRef?.current?.focus();
  };

  const handleRemoveSymbol = (s: string) => {
    setSelectedSymbols(selectedSymbols.filter(x => x !== s));
    setNotice(`Removed ${s}`);
    setTimeout(() => setNotice(''), 1500);
  };

  const canAdd = !!newSymbol.trim() && !selectedSymbols.map(x => x.toUpperCase()).includes(newSymbol.trim().toUpperCase());
  const addHelperText = !newSymbol.trim() ? 'Enter a symbol' : (selectedSymbols.map(x => x.toUpperCase()).includes(newSymbol.trim().toUpperCase()) ? 'Already added' : '');

  useEffect(() => {
    if (mode === 'stocks') {
      // focus input when switching to stocks mode
      setTimeout(() => inputRef?.current?.focus(), 50);
    }
  }, [mode]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        let url: string;
        if (mode === 'crypto') {
          const ids = symbols.map(s => CRYPTO_SYMBOL_MAP[s] || '').filter(Boolean).join(',');
          url = `/api/crypto?ids=${encodeURIComponent(ids)}`;
        } else {
          // include periods in query
          url = `/api/stocks?symbols=${symbols.join(',')}&periods=${selectedPeriods.join(',')}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        if (mounted) {
          setData(json);
          // Surface provider-side errors into the component state so they appear in the UI
          if (json?.error) {
            setError(json.error);
          } else {
            setError(null);
          }
          // For non-OK responses without an explicit error field, set a generic message
          if (!res.ok && !json?.error) {
            setError('Failed to fetch prices');
          }
        }
      } catch (err) {
        if (mounted) setError('Failed to fetch prices');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    const timer = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 minutes
    return () => { mounted = false; clearInterval(timer); };
  }, [symbols, mode, selectedPeriods]);

  const getPriceData = (symbol: string) => {
    if (mode === 'crypto') {
      const id = CRYPTO_SYMBOL_MAP[symbol];
      const info = data?.data?.[id];
      return {
        price: typeof info?.usd === 'number' ? info.usd : undefined,
        change: typeof info?.usd_24h_change === 'number' ? info.usd_24h_change : undefined,
      };
    } else {
      const raw = data?.data;
      let stocks: any[] = [];
      if (Array.isArray(raw)) {
        stocks = raw;
      } else if (raw && typeof raw === 'object') {
        // sometimes the API might return an object map; normalize to array
        stocks = Object.values(raw);
      } else {
        stocks = [];
      }

      const stock = stocks.find((s: any) => s && s.symbol === symbol);
      return {
        price: typeof stock?.price === 'number' ? stock.price : undefined,
        change: typeof stock?.changePercent === 'number' ? stock.changePercent : undefined,
        change1w: typeof stock?.changePercent1w === 'number' ? stock.changePercent1w : undefined,
        change1m: typeof stock?.changePercent1m === 'number' ? stock.changePercent1m : undefined,
      };
    }
  };

  return (
    <TerminalBox title={`${mode} --prices ${mode === 'stocks' ? `[${selectedPeriods.join(',')}]` : ''}`} icon="💱" status={data ? `Updated: ${new Date().toLocaleTimeString()}` : ''} loading={loading} error={loading ? null : error}>
      <div className={styles.container}>
        <div className={styles.headerLine}>
          $ {symbols.join(', ')}
          <button
            onClick={() => setMode(mode === 'crypto' ? 'stocks' : 'crypto')}
            className={styles.button}
            style={{ marginLeft: '0.5rem' }}
          >
            [{mode === 'crypto' ? 'stocks' : 'crypto'}]
          </button>
        </div>

        {mode === 'stocks' && (
          <div className={styles.controls}>
            <div className={styles.addRow}>
              <input
                ref={inputRef}
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSymbol(); }}
                placeholder="Add symbol (e.g. NFLX)"
                className={styles.input}
              />
              <button
                className={styles.button}
                onClick={() => handleAddSymbol()}
                disabled={!canAdd}
                title={addHelperText || 'Add symbol'}
              >Add</button>
              <span className={styles.helperText}>{addHelperText}</span>
              {notice && <span className={styles.notice}>{notice}</span>}
            </div>

            <div className={styles.periods}>
              {AVAILABLE_PERIODS.map(p => (
                <label key={p} className={styles.periodLabel}>
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPeriods([...selectedPeriods, p]);
                      else setSelectedPeriods(selectedPeriods.filter(x => x !== p));
                    }}
                  /> {p}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={styles.list}>
          {symbols.map((s) => {
            const { price, change, change1w, change1m } = getPriceData(s);
            return (
              <div key={s} className={styles.row}>
                <div className={styles.symbol}>{s}</div>
                <div className={styles.price}>{price ? `$${price.toFixed(2)}` : '—'}</div>
                <div className={change != null ? (change >= 0 ? styles.changeUp : styles.changeDown) : ''}>
                  {change != null ? formatChange(change) : ''}
                </div>
                {mode === 'stocks' && (
                  <div className={styles.extraChanges}>
                    {selectedPeriods.includes('1w') && (
                      <div className={change1w != null ? (change1w >= 0 ? styles.changeUpSmall : styles.changeDownSmall) : ''}>
                        {change1w != null ? formatChange(change1w) : ''}
                      </div>
                    )}
                    {selectedPeriods.includes('1m') && (
                      <div className={change1m != null ? (change1m >= 0 ? styles.changeUpSmall : styles.changeDownSmall) : ''}>
                        {change1m != null ? formatChange(change1m) : ''}
                      </div>
                    )}
                  </div>
                )}
                {mode === 'stocks' && (
                  <button
                    className={styles.remove}
                    onClick={() => handleRemoveSymbol(s)}
                    title="Remove symbol"
                  >×</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TerminalBox>
  );
}
