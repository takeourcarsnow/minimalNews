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
    const coinIds = ids.split(',');
    const paprikaMap: Record<string, string> = {
      bitcoin: 'btc-bitcoin',
      ethereum: 'eth-ethereum',
      solana: 'sol-solana',
      dogecoin: 'doge-dogecoin',
    };

    const results = await Promise.all(
      coinIds.map(async (id) => {
        const paprikaId = paprikaMap[id];
        if (!paprikaId) return null;
        const url = `https://api.coinpaprika.com/v1/tickers/${paprikaId}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`CoinPaprika API error for ${id}: ${response.status}`);
          return null;
        }

        const data = await response.json();
        return {
          id,
          usd: data.quotes?.USD?.price || 0,
          usd_24h_change: data.quotes?.USD?.percent_change_24h || 0,
          last_updated_at: data.last_updated,
        };
      })
    );

    const data: Record<string, any> = {};
    results.forEach((res, i) => {
      if (res) {
        data[coinIds[i]] = res;
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