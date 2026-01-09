'use client';

import { useState, useEffect } from 'react';
import type { WeatherData, ApiResponse } from '@/types/api';
import TerminalBox from '@/components/ui/TerminalBox';
import styles from './WeatherWidget.module.css';

interface WeatherWidgetProps {
  defaultLocation?: string;
}

const WEATHER_ASCII: Record<string, string> = {
  Clear: `
    \\   /
     .-.
  ― (   ) ―
     \`-'
    /   \\`,
  Sunny: `
    \\   /
     .-.
  ― (   ) ―
     \`-'
    /   \\`,
  'Partly cloudy': `
   \\  /
 _ /"".-.
   \\_(   ).
   /(___(__) `,
  Cloudy: `
     .--.
  .-(    ).
 (___.__)__)`,
  Overcast: `
     .--.
  .-(    ).
 (___.__)__)`,
  Rain: `
     .--.
  .-(    ).
 (___.__)__)
  ' ' ' '
 ' ' ' '`,
  'Light rain': `
     .--.
  .-(    ).
 (___.__)__)
    ' ' '`,
  Snow: `
     .--.
  .-(    ).
 (___.__)__)
   * * * *
  * * * *`,
  'Light snow': `
     .--.
  .-(    ).
 (___.__)__)
    * * *`,
  Thunderstorm: `
     .--.
  .-(    ).
 (___.__)__)
    ⚡⚡
   ' ' ' '`,
  Mist: `
  _ - _ - _
   _ - _ -
  _ - _ - _`,
  Fog: `
  _ - _ - _
   _ - _ -
  _ - _ - _`,
};

function getWeatherAscii(condition: string): string {
  for (const [key, art] of Object.entries(WEATHER_ASCII)) {
    if (condition.toLowerCase().includes(key.toLowerCase())) {
      return art;
    }
  }
  return WEATHER_ASCII['Cloudy'];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function WeatherWidget({ defaultLocation = 'New York' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(defaultLocation);
  const [inputValue, setInputValue] = useState(defaultLocation);

  useEffect(() => {
    fetchWeather();
  }, [location]);

  async function fetchWeather() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      const result: ApiResponse<WeatherData> = await response.json();

      if (result.data) {
        setWeather(result.data);
      }
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      setLocation(inputValue.trim());
    }
  }

  const status = weather
    ? `Last updated: ${new Date(weather.lastUpdated).toLocaleTimeString()}`
    : '';

  return (
    <TerminalBox
      title="weather --location"
      icon="☁"
      status={status}
      loading={loading}
      error={loading ? null : error}
    >
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <span className={styles.prompt}>$</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter location..."
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            [fetch]
          </button>
        </form>

        {weather && (
          <>
            <div className={styles.current}>
              <pre className={styles.ascii}>{getWeatherAscii(weather.current.condition)}</pre>
              <div className={styles.info}>
                <div className={styles.location}>{weather.location}</div>
                <div className={styles.temp}>
                  <span className={styles.tempValue}>{weather.current.temp}°C</span>
                  <span className={styles.feelsLike}>
                    (feels like {weather.current.feels_like}°C)
                  </span>
                </div>
                <div className={styles.condition}>{weather.current.condition}</div>
                <div className={styles.details}>
                  <span>💧 {weather.current.humidity}%</span>
                  <span>💨 {weather.current.wind_speed} km/h {weather.current.wind_direction}</span>
                  <span>👁 {weather.current.visibility} km</span>
                </div>
              </div>
            </div>

            <div className={styles.divider}>─── forecast ───</div>

            <div className={styles.forecast}>
              {weather.forecast.map((day, index) => (
                <div key={index} className={styles.forecastDay}>
                  <div className={styles.forecastDate}>{formatDate(day.date)}</div>
                  <div className={styles.forecastIcon}>{day.icon}</div>
                  <div className={styles.forecastTemp}>
                    <span className={styles.high}>{day.high}°</span>
                    <span className={styles.low}>{day.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </TerminalBox>
  );
}
