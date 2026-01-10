import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || 'bitcoin,ethereum';

  try {
    const tokens = ids.split(',').map(t => t.trim()).filter(Boolean);

    // Map of known symbols to CoinGecko ids
    const knownMap: Record<string, string> = {
      bitcoin: 'bitcoin',
      ethereum: 'ethereum',
      solana: 'solana',
      dogecoin: 'dogecoin',
      btc: 'bitcoin',
      eth: 'ethereum',
      sol: 'solana',
      doge: 'dogecoin',
    };

    const resolveCoinGeckoId = async (token: string): Promise<string | null> => {
      // direct mapping by token
      if (knownMap[token.toLowerCase()]) return knownMap[token.toLowerCase()];

      // if token already looks like a coingecko id (contains '-') or lowercase name, try using it
      // we'll verify later by checking price response
      try {
        const q = encodeURIComponent(token);
        const url = `https://api.coingecko.com/api/v3/search?query=${q}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.warn('CoinGecko search returned non-ok for', token, res.status);
          return null;
        }
        const js = await res.json();
        const coins = js.coins || [];
        // exact symbol match
        const match = coins.find((c: any) => c.symbol && c.symbol.toLowerCase() === token.toLowerCase());
        if (match) {
          console.log('resolveCoinGeckoId exact match', token, match.id);
          return match.id;
        }
        // exact id/name contains
        const fallback = coins.find((c: any) => (c.id && c.id.toLowerCase() === token.toLowerCase()) || (c.name && c.name.toLowerCase() === token.toLowerCase()));
        if (fallback) {
          console.log('resolveCoinGeckoId fallback match', token, fallback.id);
          return fallback.id;
        }
        // partial name match
        const partial = coins.find((c: any) => (c.name && c.name.toLowerCase().includes(token.toLowerCase())));
        if (partial) {
          console.log('resolveCoinGeckoId partial match', token, partial.id);
          return partial.id;
        }
      } catch (err) {
        console.warn('CoinGecko search error for', token, err);
      }

      // Fallback: fetch full coin list and try to find by symbol (heavier but reliable)
      try {
        const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
        if (listRes.ok) {
          const list = await listRes.json();
          const bySymbol = list.find((c: any) => c.symbol && c.symbol.toLowerCase() === token.toLowerCase());
          if (bySymbol) return bySymbol.id;
        }
      } catch (err) {
        console.warn('CoinGecko list search error for', token, err);
      }

      return null;
    }

    // Resolve tokens to coinGecko ids
    const tokenToId: Record<string, string> = {};
    await Promise.all(tokens.map(async (t) => {
      const id = await resolveCoinGeckoId(t);
      if (id) tokenToId[t] = id;
    }));

    const idsToQuery = Array.from(new Set(Object.values(tokenToId)));

    let priceData: Record<string, any> = {};
    if (idsToQuery.length > 0) {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(idsToQuery.join(','))}&vs_currencies=usd&include_24hr_change=true`;
      const r = await fetch(url);
      if (r.ok) {
        priceData = await r.json();
      }
    }

    const results = tokens.map((token) => {
      const id = tokenToId[token];
      if (!id) return null;
      const pd = priceData[id];
      return {
        id: token,
        usd: pd?.usd || 0,
        usd_24h_change: pd?.usd_24h_change || 0,
        last_updated_at: new Date().toISOString(),
      };
    });

    const data: Record<string, any> = {};
    results.forEach((res) => {
      if (res) {
        data[res.id] = res;
      }
    });

    const result: ApiResponse<any> = {
      data: data,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Crypto API error:', error);

    const result: ApiResponse<any> = {
      data: null,
      error: 'Failed to fetch crypto prices',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 500 });
  }
}