import { NextResponse } from 'next/server';
import type { NewsItem, ApiResponse } from '@/types/api';

// Using multiple free RSS feeds
async function fetchFromRSSFeeds(): Promise<NewsItem[]> {
  const feeds = [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.npr.org/1001/rss.xml',
    'https://www.theguardian.com/world/rss',
  ];

  const categoryKeywords: Record<string, string[]> = {
    technology: ['tech', 'software', 'ai', 'computer', 'digital', 'chip', 'silicon', 'semiconductor'],
    business: ['business', 'economy', 'market', 'finance', 'company', 'stocks', 'shares'],
    science: ['science', 'research', 'study', 'space', 'nasa', 'scientist', 'physics', 'chemistry'],
    health: ['health', 'medical', 'disease', 'treatment', 'doctor', 'vaccine'],
    politics: ['politic', 'election', 'government', 'senate', 'congress', 'minister', 'president'],
    sports: ['sport', 'football', 'basketball', 'tennis', 'game', 'match'],
    entertainment: ['entertainment', 'movie', 'music', 'celebrity', 'film', 'tv'],
  };

  const allNews: NewsItem[] = [];

  for (const feedUrl of feeds) {
    try {
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Terminal-Detox-App/1.0',
        },
        next: { revalidate: 600 }, // Cache for 10 minutes
      });

      if (!response.ok) continue;

      const xmlText = await response.text();

      // Simple RSS parsing (in production, use a proper RSS parser)
      const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

      for (const item of items.slice(0, 5)) { // Limit per feed
        const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        const link = item.match(/<link>(.*?)<\/link>/)?.[1];
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];

        if (title && link) {
          // Extract source from URL
          let source = 'News';
          try {
            const url = new URL(link);
            source = url.hostname.replace('www.', '').replace('.com', '').replace('.co.uk', '');
            source = source.charAt(0).toUpperCase() + source.slice(1);
          } catch (e) {
            // Keep default source if URL parsing fails
          }

          // Determine category from title/source keywords
          const lowerTitle = title.toLowerCase();
          const lowerSource = source.toLowerCase();
          let detectedCategory = 'general';
          for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(k => lowerTitle.includes(k) || lowerSource.includes(k))) {
              detectedCategory = cat;
              break;
            }
          }

          allNews.push({
            id: `news-${Date.now()}-${Math.random()}`,
            title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
            source,
            url: link,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            category: detectedCategory,
          });
        }
      }
    } catch (error) {
      // Continue with other feeds if one fails
    }
  }

  // Remove duplicates and sort by date
  const uniqueNews = allNews.filter((item, index, self) =>
    index === self.findIndex(t => t.title === item.title)
  );

  return uniqueNews
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 20);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Normalize category: frontend uses 'all', backend uses 'general' as the no-filter default
  const rawCategory = searchParams.get('category') || 'general';
  const category = rawCategory === 'all' ? 'general' : rawCategory;
  const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 25);

  try {
    let allNews = await fetchFromRSSFeeds();



    // Filter by category if needed; prefer detected item.category, fallback to keyword matching
    let filteredNews = allNews;
    if (category !== 'general') {
      filteredNews = allNews.filter(item => (item.category || '').toLowerCase() === category);

      // Fallback: if nothing matched, try keyword matching on title/source
      if (filteredNews.length === 0) {
        const fallbackKeywords: Record<string, string[]> = {
          technology: ['tech', 'software', 'ai', 'computer', 'digital', 'chip', 'semiconductor'],
          business: ['business', 'economy', 'market', 'finance', 'company', 'stocks', 'shares'],
          science: ['science', 'research', 'study', 'space', 'nasa', 'scientist', 'physics', 'chemistry'],
          health: ['health', 'medical', 'disease', 'treatment', 'doctor', 'vaccine'],
          politics: ['politic', 'election', 'government', 'senate', 'congress', 'minister', 'president'],
          sports: ['sport', 'football', 'basketball', 'tennis', 'game', 'match'],
          entertainment: ['entertainment', 'movie', 'music', 'celebrity', 'film', 'tv'],
        };

        const keywords = fallbackKeywords[category] || [];
        filteredNews = allNews.filter(item =>
          keywords.some(keyword =>
            item.title.toLowerCase().includes(keyword) ||
            item.source.toLowerCase().includes(keyword)
          )
        );
      }
    }

    const result: ApiResponse<NewsItem[]> = {
      data: filteredNews.slice(0, limit),
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('News fetch error:', error);

    // Return empty array as fallback
    const result: ApiResponse<NewsItem[]> = {
      data: [],
      error: 'Failed to fetch news',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
