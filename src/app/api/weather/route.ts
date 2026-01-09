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
    // Use wttr.in for real weather data (no API key required)
    const wttrUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const response = await fetch(wttrUrl, {
      headers: {
        'User-Agent': 'Terminal-Detox-App/1.0',
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error('Weather service unavailable');
    }

    const data = await response.json();
    const current = data.current_condition[0];
    const weather = data.weather[0];

    const weatherData: WeatherData = {
      location: data.nearest_area[0].areaName[0].value,
      current: {
        temp: parseInt(current.temp_C),
        feels_like: parseInt(current.FeelsLikeC),
        humidity: parseInt(current.humidity),
        wind_speed: parseInt(current.windspeedKmph),
        wind_direction: current.winddir16Point,
        condition: current.weatherDesc[0].value,
        icon: conditionIcons[current.weatherDesc[0].value] || '☀',
        visibility: parseInt(current.visibility),
        pressure: parseInt(current.pressure),
      },
      forecast: data.weather.slice(0, 5).map((day: any) => ({
        date: day.date,
        high: parseInt(day.maxtempC),
        low: parseInt(day.mintempC),
        condition: day.hourly[4].weatherDesc[0].value, // Midday condition
        icon: conditionIcons[day.hourly[4].weatherDesc[0].value] || '☀',
        precipitation: parseInt(day.hourly[4].chanceofrain) || 0,
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

    // Return mock data as fallback
    const mockWeatherData: WeatherData = {
      location: location,
      current: {
        temp: 22,
        feels_like: 24,
        humidity: 65,
        wind_speed: 15,
        wind_direction: 'SW',
        condition: 'Partly cloudy',
        icon: '⛅',
        visibility: 10,
        pressure: 1013,
      },
      forecast: [
        { date: new Date().toISOString().split('T')[0], high: 25, low: 18, condition: 'Sunny', icon: '☀', precipitation: 0 },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], high: 23, low: 16, condition: 'Cloudy', icon: '☁', precipitation: 2 },
        { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], high: 20, low: 14, condition: 'Rain', icon: '🌧', precipitation: 5 },
        { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], high: 22, low: 15, condition: 'Partly cloudy', icon: '⛅', precipitation: 0 },
        { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], high: 24, low: 17, condition: 'Sunny', icon: '☀', precipitation: 0 },
      ],
      lastUpdated: new Date().toISOString(),
    };

    const result: ApiResponse<WeatherData> = {
      data: mockWeatherData,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  }
}
