import { NextResponse } from 'next/server';
import type { SocialTrending, ApiResponse } from '@/types/api';
import * as cheerio from 'cheerio';

async function fetchGitHubTrending(): Promise<SocialTrending['github']> {
  try {
    const response = await fetch('https://github.com/trending', {
      headers: {
        'User-Agent': 'Terminal-Detox-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub trending fetch error');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const repos: SocialTrending['github'] = [];

    $('article.Box-row').each((index, element) => {
      if (index >= 5) return false; // Limit to 5 repos

      const $article = $(element);
      const title = $article.find('h2 a').text().trim().replace(/\s+/g, ' ');
      const description = $article.find('p').text().trim();
      const language = $article.find('[itemprop="programmingLanguage"]').text().trim();
      const starsText = $article.find('a[href*="stargazers"]').text().trim();
      const stars = parseInt(starsText.replace(/,/g, '')) || 0;
      const url = 'https://github.com' + $article.find('h2 a').attr('href');

      repos.push({
        name: title,
        description: description || 'No description',
        language: language || 'Unknown',
        stars,
        url,
      });
    });

    return repos;
  } catch (error) {
    console.error('GitHub trending error:', error);
    return [];
  }
}

async function fetchTwitterTrending(): Promise<SocialTrending['twitter']> {
  try {
    const response = await fetch('https://getdaytrends.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      console.error('Twitter trends fetch error:', response.status, response.statusText);
      throw new Error('Twitter trends fetch error');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const trends: SocialTrending['twitter'] = [];

    $('li').each((index, element) => {
      if (index >= 5) return false;

      const $li = $(element);
      const fullText = $li.text().trim();

      // Extract hashtag from the text
      const hashtagMatch = fullText.match(/#([^\sUnder]+)/);
      let trendName = '';
      let volume = 0;

      if (hashtagMatch) {
        trendName = '#' + hashtagMatch[1];
      }

      // Extract volume
      const volumeMatch = fullText.match(/(\d+(?:\.\d+)?)(K|M)? tweets/);
      if (volumeMatch) {
        volume = parseFloat(volumeMatch[1]);
        if (volumeMatch[2] === 'K') volume *= 1000;
        if (volumeMatch[2] === 'M') volume *= 1000000;
      }

      if (trendName && trendName.length > 1 && trendName !== '#Trending' && trendName !== '#Top' && trendName !== '#Help') {
        trends.push({
          id: trendName,
          name: trendName,
          category: 'Trending',
          volume: Math.floor(volume),
          url: `https://twitter.com/search?q=${encodeURIComponent(trendName)}`,
        });
      }
    });

    if (trends.length === 0) {
      // Fallback: try to extract hashtags from the entire text
      const textContent = $.text();
      const hashtagRegex = /#([^\s\n]+)/g;
      let match;
      while ((match = hashtagRegex.exec(textContent)) && trends.length < 5) {
        const trendName = '#' + match[1];
        if (trendName.length > 2 && !trends.find(t => t.name === trendName)) {
          trends.push({
            id: trendName,
            name: trendName,
            category: 'Trending',
            volume: 0,
            url: `https://twitter.com/search?q=${encodeURIComponent(trendName)}`,
          });
        }
      }
    }

    return trends;
  } catch (error) {
    console.error('Twitter trending error:', error);
    return [];
  }
}

export async function GET() {
  try {
    const [github, twitter] = await Promise.all([
      fetchGitHubTrending(),
      fetchTwitterTrending(),
    ]);

    const result: ApiResponse<SocialTrending> = {
      data: {
        github,
        twitter,
      },
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trending API error:', error);

    const result: ApiResponse<SocialTrending> = {
      data: null,
      error: 'Unable to fetch trending data. Please try again later.',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 500 });
  }
}
