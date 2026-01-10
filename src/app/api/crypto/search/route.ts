import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  try {
    const q = encodeURIComponent(query);
    const url = `https://api.coingecko.com/api/v3/search?query=${q}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ data: null }, { status: 502 });
    }
    const js = await res.json();
    const coins = js.coins || [];
    const match = coins.find((c: any) => c.symbol && c.symbol.toLowerCase() === query.toLowerCase()) ||
                  coins.find((c: any) => c.id && c.id.toLowerCase() === query.toLowerCase()) ||
                  coins.find((c: any) => c.name && c.name.toLowerCase().includes(query.toLowerCase()));
    if (!match) {
      // fallback: try the coins list endpoint
      const listRes = await fetch('https://api.coingecko.com/api/v3/coins/list');
      if (listRes.ok) {
        const list = await listRes.json();
        const bySymbol = list.find((c: any) => c.symbol && c.symbol.toLowerCase() === query.toLowerCase());
        if (bySymbol) {
          return NextResponse.json({ data: { id: bySymbol.id } });
        }
      }
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: { id: match.id, name: match.name, symbol: match.symbol } });
  } catch (err) {
    console.error('Crypto search error:', err);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}
