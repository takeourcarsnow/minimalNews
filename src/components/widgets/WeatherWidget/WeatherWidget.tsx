'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '@/types/api';
import TerminalBox from '@/components/ui/TerminalBox';
import { useWidgetData, useWidgetProps } from '@/hooks/useWidget';
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
  const { props: { location }, updateProps } = useWidgetProps({ location: defaultLocation });
  const [inputValue, setInputValue] = useState(defaultLocation);
  const [locationDetected, setLocationDetected] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(true);

  const { data: weather, loading, error, refetch } = useWidgetData<WeatherData>(
    `/api/weather?location=${encodeURIComponent(location)}`,
    [location],
    { initialData: null }
  );

  // React to prop updates from CLI or other actions so the widget updates immediately
  useEffect(() => {
    if (defaultLocation && defaultLocation !== location) {
      updateProps({ location: defaultLocation });
      setInputValue(defaultLocation);
    }
  }, [defaultLocation, location, updateProps]);

  // Detect user's location on mount
  useEffect(() => {
    if (!locationDetected && detectingLocation) {
      // Use browser's geolocation API (most reliable, no CORS issues)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Use BigDataCloud for reverse geocoding (free tier, CORS-friendly)
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );

              if (response.ok) {
                const data = await response.json();
                if (data.city) {
                  const detectedLocation = `${data.city}${data.principalSubdivision ? ', ' + data.principalSubdivision : ''}`;
                  updateProps({ location: detectedLocation });
                  setInputValue(detectedLocation);
                } else {
                  // Use coordinates as fallback
                  const coordLocation = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
                  updateProps({ location: coordLocation });
                  setInputValue(coordLocation);
                }
              } else {
                throw new Error('Geocoding service unavailable');
              }
            } catch (err) {
              console.warn('Geocoding failed:', err);
              // Use coordinates as final fallback
              const coordLocation = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
              updateProps({ location: coordLocation });
              setInputValue(coordLocation);
            } finally {
              setLocationDetected(true);
              setDetectingLocation(false);
            }
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            // Keep default location if geolocation fails or is denied
            setLocationDetected(true);
            setDetectingLocation(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        // No geolocation support
        setLocationDetected(true);
        setDetectingLocation(false);
      }
    }
  }, [locationDetected, detectingLocation, updateProps]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      updateProps({ location: inputValue.trim() });
    }
  }, [inputValue, updateProps]);
  const status = detectingLocation
    ? 'Detecting your location...'
    : weather
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
            placeholder={detectingLocation ? "Detecting location..." : "Enter location..."}
            className={styles.input}
            disabled={detectingLocation}
          />
          <button type="submit" className={styles.button} disabled={detectingLocation}>
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
