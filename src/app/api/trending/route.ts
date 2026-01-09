import { NextResponse } from 'next/server';
import type { SocialTrending, ApiResponse } from '@/types/api';

async function fetchGitHubTrending(): Promise<SocialTrending['github']> {
  try {
    // GitHub's unofficial trending page scraping alternative
    // Using the GitHub API for starred repos as proxy
    const response = await fetch(
      'https://api.github.com/search/repositories?q=created:>2026-01-01&sort=stars&order=desc&per_page=10',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Terminal-Detox-App/1.0',
        },
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!response.ok) {
      throw new Error('GitHub API error');
    }

    const data = await response.json();
    return data.items.map((repo: any) => ({
      name: repo.full_name,
      description: repo.description || 'No description',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      url: repo.html_url,
    }));
  } catch (error) {
    console.error('GitHub trending error:', error);
    return [];
  }
}

async function fetchRedditTrending(): Promise<SocialTrending['reddit']> {
  try {
    // Get trending subreddits from Reddit's public API
    const response = await fetch('https://www.reddit.com/subreddits/popular.json?limit=10', {
      headers: {
        'User-Agent': 'Terminal-Detox-App/1.0',
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error('Reddit API error');
    }

    const data = await response.json();
    return data.data.children.map((sub: any) => ({
      name: sub.data.display_name,
      subscribers: sub.data.subscribers,
      description: sub.data.public_description || sub.data.display_name_prefixed,
    }));
  } catch (error) {
    console.error('Reddit trending error:', error);
    return [];
  }
}

async function fetchHackerNewsTrending(): Promise<SocialTrending['hackernews']> {
  try {
    // Get top stories from HN
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error('HackerNews API error');
    }

    const storyIds: number[] = await response.json();
    const topIds = storyIds.slice(0, 5);

    // Get story details
    const stories = await Promise.all(
      topIds.map(async (id) => {
        const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return itemResponse.json();
      })
    );

    return stories
      .filter(story => story && story.title)
      .map(story => ({
        title: story.title,
        score: story.score,
        comments: story.descendants || 0,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      }));
  } catch (error) {
    console.error('HackerNews trending error:', error);
    return [];
  }
}

export async function GET() {
  try {
    const [github, reddit, hackernews] = await Promise.all([
      fetchGitHubTrending(),
      fetchRedditTrending(),
      fetchHackerNewsTrending(),
    ]);

    // For Twitter/X trends, we would need API access
    // Using a placeholder for now - in production, consider alternative free sources
    const twitter: SocialTrending['twitter'] = [
      { id: '1', name: '#OpenSource', category: 'Technology', volume: 50000 },
      { id: '2', name: '#WebDev', category: 'Technology', volume: 35000 },
      { id: '3', name: '#AI', category: 'Technology', volume: 75000 },
      { id: '4', name: '#Climate', category: 'Environment', volume: 25000 },
      { id: '5', name: '#Music', category: 'Entertainment', volume: 40000 },
    ];

    const result: ApiResponse<SocialTrending> = {
      data: {
        github,
        twitter,
        reddit,
        hackernews,
      },
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trending API error:', error);

    // Return fallback data
    const fallbackData: SocialTrending = {
      github: [
        { name: 'facebook/react', description: 'A declarative, efficient, and flexible JavaScript library', language: 'JavaScript', stars: 220000, url: 'https://github.com/facebook/react' },
        { name: 'microsoft/vscode', description: 'Visual Studio Code', language: 'TypeScript', stars: 156000, url: 'https://github.com/microsoft/vscode' },
        { name: 'torvalds/linux', description: 'Linux kernel source tree', language: 'C', stars: 168000, url: 'https://github.com/torvalds/linux' },
      ],
      twitter: [
        { id: '1', name: '#OpenSource', category: 'Technology', volume: 50000 },
        { id: '2', name: '#WebDev', category: 'Technology', volume: 35000 },
      ],
      reddit: [],
      hackernews: [],
    };

    const result: ApiResponse<SocialTrending> = {
      data: fallbackData,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
