import { apiFetch } from '@/utils/api';
import type { ApiResponse, WeatherData, NewsItem, HackerNewsItem, TrendingTopic, QuoteOfTheDay } from '@/types/api';

// Utility functions for CLI commands
export const commandUtils = {
  async fetchWeather(location: string) {
    const res: ApiResponse<WeatherData> = await apiFetch(`/api/weather?location=${encodeURIComponent(location)}`);
    if (res.data) {
      const weather = res.data;
      return `Location: ${weather.location}\n${weather.current.temp}°C - ${weather.current.condition}\nLast updated: ${new Date(weather.lastUpdated).toLocaleString()}`;
    }
    throw new Error('No weather data available');
  },

  async fetchNews(category: string, limit = 5) {
    const res: ApiResponse<NewsItem[]> = await apiFetch(`/api/news?category=${encodeURIComponent(category)}&limit=${limit}`);
    const items = res.data || [];
    if (items.length) {
      const out = items.map((it, idx: number) => `${idx + 1}. ${it.title}`).join('\n');
      return `Top ${items.length} ${category} headlines:\n${out}`;
    }
    return `No ${category} news available`;
  },

  async fetchHackerNews(limit = 5) {
    const res: ApiResponse<HackerNewsItem[]> = await apiFetch(`/api/hackernews?limit=${limit}`);
    const items = res.data || [];
    if (items.length) {
      const out = items.slice(0, limit).map((it: any, idx: number) => `${idx + 1}. ${it.title}`).join('\n');
      return `Top Hacker News:\n${out}`;
    }
    return 'No hackernews data';
  },

  async fetchTrending() {
    const res: ApiResponse<{ github: any[], twitter: TrendingTopic[], reddit: any[], hackernews: any[] }> = await apiFetch('/api/trending');
    const data = res.data;
    if (data && data.github && data.github.length) {
      const out = data.github.slice(0, 5).map((g: any, idx: number) => `${idx + 1}. ${g.name} (${g.stars} ★)`).join('\n');
      return `Trending repos:\n${out}`;
    }
    return 'No trending data';
  },

  async fetchQuote() {
    const res: ApiResponse<QuoteOfTheDay> = await apiFetch('/api/quote');
    const q = res.data;
    if (q) {
      return `${q.text}\n— ${q.author || 'Unknown'}`;
    }
    return 'No quote available';
  },

  async fetchReddit(subreddit: string, limit = 5) {
    const res: ApiResponse<any[]> = await apiFetch(`/api/reddit?subreddit=${encodeURIComponent(subreddit)}&limit=${limit}`);
    const items = res.data || [];
    if (items.length) {
      const out = items.map((it: any, idx: number) => `${idx + 1}. ${it.title}`).join('\n');
      return `Top posts from r/${subreddit}:\n${out}`;
    }
    return `No posts from r/${subreddit}`;
  },
};