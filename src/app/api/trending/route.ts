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

export async function GET() {
  try {
    const github = await fetchGitHubTrending();

    // Mock Twitter/X trends (would need official API access)
    const mockTwitterTrends = [
      { id: '1', name: '#TechNews', category: 'Technology', volume: 125000 },
      { id: '2', name: '#ClimateAction', category: 'Environment', volume: 89000 },
      { id: '3', name: '#WorldCup', category: 'Sports', volume: 234000 },
      { id: '4', name: '#AI', category: 'Technology', volume: 156000 },
      { id: '5', name: '#Music', category: 'Entertainment', volume: 78000 },
      { id: '6', name: '#Breaking', category: 'News', volume: 312000 },
      { id: '7', name: '#Crypto', category: 'Finance', volume: 67000 },
      { id: '8', name: '#Gaming', category: 'Entertainment', volume: 145000 },
      { id: '9', name: '#Health', category: 'Lifestyle', volume: 54000 },
      { id: '10', name: '#Science', category: 'Education', volume: 43000 },
    ];

    // Mock GitHub if API fails
    const finalGithub = github.length > 0 ? github : [
      { name: 'facebook/react', description: 'A declarative, efficient, and flexible JavaScript library', language: 'JavaScript', stars: 220000, url: 'https://github.com/facebook/react' },
      { name: 'microsoft/vscode', description: 'Visual Studio Code', language: 'TypeScript', stars: 156000, url: 'https://github.com/microsoft/vscode' },
      { name: 'torvalds/linux', description: 'Linux kernel source tree', language: 'C', stars: 168000, url: 'https://github.com/torvalds/linux' },
      { name: 'denoland/deno', description: 'A modern runtime for JavaScript and TypeScript', language: 'Rust', stars: 93000, url: 'https://github.com/denoland/deno' },
      { name: 'vercel/next.js', description: 'The React Framework', language: 'JavaScript', stars: 119000, url: 'https://github.com/vercel/next.js' },
    ];

    const trending: SocialTrending = {
      twitter: mockTwitterTrends,
      github: finalGithub,
    };

    const result: ApiResponse<SocialTrending> = {
      data: trending,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Social trending error:', error);

    const result: ApiResponse<SocialTrending> = {
      data: { twitter: [], github: [] },
      error: 'Failed to fetch trending data',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
