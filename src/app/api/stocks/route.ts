import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';
import YahooFinance from 'yahoo-finance2';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  change1w?: number;
  changePercent1w?: number;
  change1m?: number;
  changePercent1m?: number;
}

async function scrapeNasdaq(symbol: string, opts?: { include1w?: boolean; include1m?: boolean }): Promise<StockData> {
  const yahooFinance = new YahooFinance();
  const quote = await yahooFinance.quote(symbol.toUpperCase());

  const price = quote.regularMarketPrice || 0;
  const change = quote.regularMarketChange || 0;
  const changePercent = quote.regularMarketChangePercent || 0;

  if (price === 0) {
    throw new Error('Price data not found');
  }

  let change1w: number | undefined;
  let changePercent1w: number | undefined;
  let change1m: number | undefined;
  let changePercent1m: number | undefined;

  // Fetch 1 week historical data if requested
  if (opts?.include1w) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hist1w = await yahooFinance.historical(symbol, { period1: oneWeekAgo, period2: new Date(), interval: '1d' });
    const price1w = hist1w.length > 0 ? hist1w[0].close : price;
    change1w = price - price1w;
    changePercent1w = price1w !== 0 ? (change1w / price1w) * 100 : 0;
  }

  // Fetch 1 month historical data if requested
  if (opts?.include1m) {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hist1m = await yahooFinance.historical(symbol, { period1: oneMonthAgo, period2: new Date(), interval: '1d' });
    const price1m = hist1m.length > 0 ? hist1m[0].close : price;
    change1m = price - price1m;
    changePercent1m = price1m !== 0 ? (change1m / price1m) * 100 : 0;
  }

  console.log(`Extracted ${symbol}: price=${price}, change=${change}, changePercent=${changePercent}, change1w=${change1w}, changePercent1w=${changePercent1w}, change1m=${change1m}, changePercent1m=${changePercent1m}`);

  return {
    symbol: symbol.toUpperCase(),
    price,
    change,
    changePercent,
    ...(change1w !== undefined ? { change1w } : {}),
    ...(changePercent1w !== undefined ? { changePercent1w } : {}),
    ...(change1m !== undefined ? { change1m } : {}),
    ...(changePercent1m !== undefined ? { changePercent1m } : {}),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',') || ['AAPL'];
  // periods can be: 1d (default/24h), 1w, 1m. Example: ?periods=1d,1w
  const periodsParam = searchParams.get('periods');
  const periods = periodsParam ? periodsParam.split(',').map(p => p.trim()) : ['1d','1w','1m'];
  const include1w = periods.includes('1w');
  const include1m = periods.includes('1m');

  try {
    const results = await Promise.all(
      symbols.map(symbol => scrapeNasdaq(symbol.toUpperCase(), { include1w, include1m }))
    );

    const result: ApiResponse<StockData[]> = {
      data: results,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Stocks API error:', error);

    const result: ApiResponse<StockData[]> = {
      data: null,
      error: error?.message || 'Failed to fetch stock prices',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 500 });
  }
}