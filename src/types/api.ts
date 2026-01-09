// Shared types for API responses

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: string;
    condition: string;
    icon: string;
    visibility: number;
    pressure: number;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }[];
  lastUpdated: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category?: string;
}

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  permalink: string;
  author: string;
  createdAt: string;
}

export interface HackerNewsItem {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  type: string;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  volume?: number;
  url?: string;
}

export interface SocialTrending {
  twitter: TrendingTopic[];
  github: {
    name: string;
    description: string;
    language: string;
    stars: number;
    url: string;
  }[];
  reddit: {
    name: string;
    subscribers: number;
    description: string;
  }[];
  hackernews: {
    title: string;
    score: number;
    comments: number;
    url: string;
  }[];
}

export interface QuoteOfTheDay {
  text: string;
  author: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: string;
}
