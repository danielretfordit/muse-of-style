import { useState, useEffect, useCallback } from "react";
import { DEV_MOCK_PROFILE } from "@/lib/devProfile";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";

interface WeatherData {
  temperature: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  icon: string;
  location: string;
}

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
}

const CACHE_KEY = "stilisti_weather_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Weather code to condition mapping (WMO codes)
const getCondition = (code: number): { condition: string; icon: string } => {
  if (code === 0) return { condition: "sunny", icon: "☀️" };
  if (code === 1 || code === 2) return { condition: "partly_cloudy", icon: "⛅" };
  if (code === 3) return { condition: "cloudy", icon: "☁️" };
  if (code >= 45 && code <= 48) return { condition: "foggy", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { condition: "drizzle", icon: "🌧️" };
  if (code >= 61 && code <= 67) return { condition: "rainy", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { condition: "snowy", icon: "❄️" };
  if (code >= 80 && code <= 82) return { condition: "rainy", icon: "🌧️" };
  if (code >= 85 && code <= 86) return { condition: "snowy", icon: "❄️" };
  if (code >= 95 && code <= 99) return { condition: "stormy", icon: "⛈️" };
  return { condition: "cloudy", icon: "☁️" };
};

// Reverse geocode to get city name
const getCityName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
    );
    if (!response.ok) throw new Error("Geocoding failed");
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || "Unknown";
  } catch {
    return "Unknown";
  }
};

export function useWeather(options: UseWeatherOptions = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default to Moscow or use profile location in dev mode
  const defaultLat = DEV_BYPASS_AUTH ? DEV_MOCK_PROFILE.latitude : 55.7558;
  const defaultLon = DEV_BYPASS_AUTH ? DEV_MOCK_PROFILE.longitude : 37.6173;
  
  const latitude = options.latitude ?? defaultLat;
  const longitude = options.longitude ?? defaultLon;

  const fetchWeather = useCallback(async (lat: number, lon: number, forceRefresh = false) => {
    // Check cache
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp, coords } = JSON.parse(cached);
          const isValid = Date.now() - timestamp < CACHE_DURATION;
          const isSameLocation = coords.lat === lat && coords.lon === lon;
          
          if (isValid && isSameLocation) {
            setWeather(data);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Cache read failed, continue with fetch
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }

      const data = await response.json();
      const current = data.current;
      
      const { condition, icon } = getCondition(current.weather_code);
      const location = await getCityName(lat, lon);

      const weatherData: WeatherData = {
        temperature: Math.round(current.temperature_2m),
        condition,
        conditionCode: current.weather_code,
        humidity: current.relative_humidity_2m,
        icon,
        location,
      };

      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: weatherData,
          timestamp: Date.now(),
          coords: { lat, lon },
        }));
      } catch {
        // Cache write failed, continue anyway
      }

      setWeather(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Weather fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchWeather(latitude, longitude, true);
  }, [fetchWeather, latitude, longitude]);

  useEffect(() => {
    fetchWeather(latitude, longitude);
  }, [fetchWeather, latitude, longitude]);

  return {
    weather,
    loading,
    error,
    refresh,
  };
}
