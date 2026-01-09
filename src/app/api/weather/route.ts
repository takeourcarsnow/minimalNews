import { NextResponse } from 'next/server';
import type { WeatherData, ApiResponse } from '@/types/api';

// Weather condition mappings for ASCII art
const conditionIcons: Record<string, string> = {
  Clear: '☀',
  Sunny: '☀',
  'Partly cloudy': '⛅',
  Cloudy: '☁',
  Overcast: '☁',
  Mist: '🌫',
  Fog: '🌫',
  Rain: '🌧',
  'Light rain': '🌦',
  'Heavy rain': '⛈',
  Snow: '❄',
  'Light snow': '🌨',
  'Heavy snow': '❄',
  Thunderstorm: '⛈',
  Drizzle: '🌦',
};

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') || 'New York';

  try {
    // Using wttr.in for weather data (JSON format)
    const wttrUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const response = await fetch(wttrUrl, {
      headers: {
        'User-Agent': 'Terminal-Detox-App/1.0',
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error('Weather service unavailable');
    }

    const data = await response.json();
    const current = data.current_condition[0];
    const nearest = data.nearest_area[0];
    
    const weatherData: WeatherData = {
      location: `${nearest.areaName[0].value}, ${nearest.country[0].value}`,
      current: {
        temp: parseInt(current.temp_C),
        feels_like: parseInt(current.FeelsLikeC),
        humidity: parseInt(current.humidity),
        wind_speed: parseInt(current.windspeedKmph),
        wind_direction: getWindDirection(parseInt(current.winddirDegree)),
        condition: current.weatherDesc[0].value,
        icon: conditionIcons[current.weatherDesc[0].value] || '☁',
        visibility: parseInt(current.visibility),
        pressure: parseInt(current.pressure),
      },
      forecast: data.weather.slice(0, 5).map((day: any) => ({
        date: day.date,
        high: parseInt(day.maxtempC),
        low: parseInt(day.mintempC),
        condition: day.hourly[4]?.weatherDesc[0]?.value || 'Unknown',
        icon: conditionIcons[day.hourly[4]?.weatherDesc[0]?.value] || '☁',
        precipitation: parseFloat(day.hourly[4]?.precipMM || 0),
      })),
      lastUpdated: new Date().toISOString(),
    };

    const result: ApiResponse<WeatherData> = {
      data: weatherData,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data on error for development
    const mockData: WeatherData = {
      location: location,
      current: {
        temp: 12,
        feels_like: 10,
        humidity: 65,
        wind_speed: 15,
        wind_direction: 'NW',
        condition: 'Partly cloudy',
        icon: '⛅',
        visibility: 10,
        pressure: 1015,
      },
      forecast: [
        { date: '2026-01-10', high: 14, low: 8, condition: 'Cloudy', icon: '☁', precipitation: 0.2 },
        { date: '2026-01-11', high: 12, low: 6, condition: 'Rain', icon: '🌧', precipitation: 5.0 },
        { date: '2026-01-12', high: 10, low: 4, condition: 'Clear', icon: '☀', precipitation: 0 },
        { date: '2026-01-13', high: 11, low: 5, condition: 'Partly cloudy', icon: '⛅', precipitation: 0.1 },
        { date: '2026-01-14', high: 13, low: 7, condition: 'Cloudy', icon: '☁', precipitation: 0.5 },
      ],
      lastUpdated: new Date().toISOString(),
    };

    const result: ApiResponse<WeatherData> = {
      data: mockData,
      error: 'Using cached/mock data',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
