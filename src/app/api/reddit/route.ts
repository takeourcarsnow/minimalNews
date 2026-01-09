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

    const result: ApiResponse<RedditPost[]> = {
      data: posts,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Reddit API error:', error);

    // Mock data for development
    const mockData: RedditPost[] = [
      { id: '1', title: 'TIL something fascinating about the universe', subreddit: 'todayilearned', score: 15420, numComments: 892, url: 'https://example.com', permalink: 'https://reddit.com/r/todayilearned/1', author: 'curious_learner', createdAt: new Date().toISOString() },
      { id: '2', title: 'Scientists discover new species in deep ocean', subreddit: 'science', score: 8934, numComments: 456, url: 'https://example.com', permalink: 'https://reddit.com/r/science/2', author: 'marine_bio', createdAt: new Date().toISOString() },
      { id: '3', title: 'This sunset from my balcony', subreddit: 'pics', score: 23456, numComments: 234, url: 'https://example.com', permalink: 'https://reddit.com/r/pics/3', author: 'photo_lover', createdAt: new Date().toISOString() },
      { id: '4', title: 'New programming language gains popularity', subreddit: 'programming', score: 3421, numComments: 567, url: 'https://example.com', permalink: 'https://reddit.com/r/programming/4', author: 'dev_guru', createdAt: new Date().toISOString() },
      { id: '5', title: 'Wholesome moment at local coffee shop', subreddit: 'MadeMeSmile', score: 12345, numComments: 189, url: 'https://example.com', permalink: 'https://reddit.com/r/MadeMeSmile/5', author: 'happy_person', createdAt: new Date().toISOString() },
    ];

    const result: ApiResponse<RedditPost[]> = {
      data: mockData,
      error: 'Using mock data',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
