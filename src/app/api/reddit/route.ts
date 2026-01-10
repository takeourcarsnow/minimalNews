import { NextResponse } from 'next/server';
import type { RedditPost, ApiResponse } from '@/types/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit') || 'all';
  const sort = searchParams.get('sort') || 'hot'; // hot, new, top, rising
  const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 25);

  try {
    const redditUrl = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'Terminal-Detox-App/1.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error('Reddit API unavailable');
    }

    const data = await response.json();

    const posts: RedditPost[] = data.data.children
      .filter((child: any) => child.kind === 't3')
      .map((child: any) => {
        const post = child.data;
        return {
          id: post.id,
          title: post.title,
          subreddit: post.subreddit,
          score: post.score,
          numComments: post.num_comments,
          url: post.url,
          permalink: `https://reddit.com${post.permalink}`,
          author: post.author,
          createdAt: new Date(post.created_utc * 1000).toISOString(),
        };
      });

    if (posts.length === 0) {
      throw new Error('No Reddit posts available');
    }

    const result: ApiResponse<RedditPost[]> = {
      data: posts,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Reddit API error:', error);

    const result: ApiResponse<RedditPost[]> = {
      data: null,
      error: 'Unable to fetch Reddit data. Please try again later.',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 500 });
  }
}
