import { NextResponse } from 'next/server';
import type { NewsItem, ApiResponse } from '@/types/api';

// Using multiple free news sources
async function fetchFromMultipleSources(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  // Try fetching from different RSS/JSON sources
  try {
    // NPR News
    const nprResponse = await fetch('https://text.npr.org/', {
      next: { revalidate: 600 },
    });
    // This is HTML, we'll use mock data instead for reliability
  } catch (e) {
    console.log('NPR fetch failed');
  }

  // Return curated mock news for now (in production, use NewsAPI, RSS feeds, etc.)
  const mockNews: NewsItem[] = [
    {
      id: 'news-1',
      title: 'Global Climate Summit Reaches Historic Agreement',
      source: 'World News',
      url: 'https://example.com/climate',
      publishedAt: new Date().toISOString(),
      category: 'Environment',
    },
    {
      id: 'news-2',
      title: 'Tech Giants Report Record Quarterly Earnings',
      source: 'Business Wire',
      url: 'https://example.com/tech',
      publishedAt: new Date().toISOString(),
      category: 'Business',
    },
    {
      id: 'news-3',
      title: 'New Study Reveals Benefits of Mediterranean Diet',
      source: 'Health Today',
      url: 'https://example.com/health',
      publishedAt: new Date().toISOString(),
      category: 'Health',
    },
    {
      id: 'news-4',
      title: 'Space Agency Announces Mission to Europa',
      source: 'Science Daily',
      url: 'https://example.com/space',
      publishedAt: new Date().toISOString(),
      category: 'Science',
    },
    {
      id: 'news-5',
      title: 'Markets Rally on Positive Economic Data',
      source: 'Financial Times',
      url: 'https://example.com/markets',
      publishedAt: new Date().toISOString(),
      category: 'Finance',
    },
    {
      id: 'news-6',
      title: 'New AI Model Sets Performance Records',
      source: 'Tech Review',
      url: 'https://example.com/ai',
      publishedAt: new Date().toISOString(),
      category: 'Technology',
    },
    {
      id: 'news-7',
      title: 'International Film Festival Announces Winners',
      source: 'Entertainment Weekly',
      url: 'https://example.com/film',
      publishedAt: new Date().toISOString(),
      category: 'Entertainment',
    },
    {
      id: 'news-8',
      title: 'Historic Peace Treaty Signed After Decades of Conflict',
      source: 'Global Affairs',
      url: 'https://example.com/peace',
      publishedAt: new Date().toISOString(),
      category: 'Politics',
    },
  ];

  return [...allNews, ...mockNews];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

  try {
    const news = await fetchFromMultipleSources();
    
    let filteredNews = news;
    if (category !== 'all') {
      filteredNews = news.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    const result: ApiResponse<NewsItem[]> = {
      data: filteredNews.slice(0, limit),
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('News API error:', error);

    const result: ApiResponse<NewsItem[]> = {
      data: [],
      error: 'Failed to fetch news',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
