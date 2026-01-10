import { NextResponse } from 'next/server';
import type { HackerNewsItem, ApiResponse } from '@/types/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'top'; // top, new, best, ask, show
  const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 30);

  try {
    // Fetch story IDs from HackerNews API
    const storiesUrl = `https://hacker-news.firebaseio.com/v0/${type}stories.json`;
    const storiesResponse = await fetch(storiesUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!storiesResponse.ok) {
      throw new Error('HackerNews API unavailable');
    }

    const storyIds: number[] = await storiesResponse.json();
    const topIds = storyIds.slice(0, limit);

    // Fetch individual stories
    const stories = await Promise.all(
      topIds.map(async (id) => {
        const itemUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
        const itemResponse = await fetch(itemUrl, {
          next: { revalidate: 300 },
        });
        return itemResponse.json();
      })
    );

    const hnItems: HackerNewsItem[] = stories
      .filter((item) => item && item.title)
      .map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        score: item.score || 0,
        by: item.by || 'unknown',
        time: item.time,
        descendants: item.descendants || 0,
        type: item.type,
      }));

    const result: ApiResponse<HackerNewsItem[]> = {
      data: hnItems,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('HackerNews API error:', error);

    const result: ApiResponse<HackerNewsItem[]> = {
      data: null,
      error: 'Unable to fetch HackerNews data. Please try again later.',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 500 });
  }
}
