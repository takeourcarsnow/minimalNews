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

    // Mock data for development
    const mockData: HackerNewsItem[] = [
      { id: 1, title: 'Show HN: A new way to build web applications', url: 'https://example.com', score: 256, by: 'developer', time: Date.now() / 1000, descendants: 89, type: 'story' },
      { id: 2, title: 'The future of programming languages', url: 'https://example.com', score: 189, by: 'researcher', time: Date.now() / 1000, descendants: 134, type: 'story' },
      { id: 3, title: 'How we scaled our infrastructure to handle 1M requests/sec', url: 'https://example.com', score: 312, by: 'engineer', time: Date.now() / 1000, descendants: 201, type: 'story' },
      { id: 4, title: 'Ask HN: What are you working on?', url: 'https://news.ycombinator.com/item?id=4', score: 145, by: 'curious', time: Date.now() / 1000, descendants: 267, type: 'story' },
      { id: 5, title: 'Open source project reaches 100k stars', url: 'https://example.com', score: 423, by: 'maintainer', time: Date.now() / 1000, descendants: 156, type: 'story' },
    ];

    const result: ApiResponse<HackerNewsItem[]> = {
      data: mockData,
      error: 'Using mock data',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
