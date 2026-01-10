import { NextResponse } from 'next/server';
import type { QuoteOfTheDay, ApiResponse } from '@/types/api';

export async function GET() {
  try {
    // Use ZenQuotes API for dynamic quotes
    const response = await fetch('https://zenquotes.io/api/random', {
      headers: {
        'User-Agent': 'Terminal-Detox-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Quote service unavailable');
    }

    const quotes = await response.json();
    const quote = quotes[0];

    const result: ApiResponse<QuoteOfTheDay> = {
      data: {
        text: quote.q,
        author: quote.a,
      },
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Quote API error:', error);

    const result: ApiResponse<QuoteOfTheDay> = {
      data: null,
      error: 'Unable to fetch quote. Please try again later.',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 500 });
  }
}
