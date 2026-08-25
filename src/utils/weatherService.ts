/**
 * Live Accurate Weather Service using OpenWeatherMap API
 * Rewritten with vanilla JS approach: state object, selectors, clean helpers.
 */

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;

export interface WeatherData {
  city: string;
  country: string;
  countryCode: string;
  tempC: number;
  tempF: number;
  tempMinC: number;
  tempMaxC: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeedMs: number;
  windSpeedKts: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  feelsLikeC: number;
  isRealTime: boolean;
  lastUpdated: string;
  datetime: string;
  timezone: number;
}

interface WeatherState {
  currCity: string;
  units: 'metric' | 'imperial';
  loading: boolean;
  error: string | null;
}

const weatherState: WeatherState = {
  currCity: 'London',
  units: 'metric',
  loading: false,
  error: null,
};

function mapWeatherCondition(main: string, description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('clear')) return 'Clear Sky';
  if (lower.includes('cloud') || lower.includes('overcast')) return 'Cloudy';
  if (lower.includes('rain') || lower.includes('drizzle')) return 'Rain';
  if (lower.includes('snow') || lower.includes('sleet')) return 'Snow';
  if (lower.includes('thunder') || lower.includes('storm')) return 'Thunderstorm';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return 'Foggy / Hazy';
  if (lower.includes('wind')) return 'Windy';
  return main || 'Fair';
}

function getWindDirDegrees(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return `${Math.round(deg)}° ${directions[index]}`;
}

export function convertTimeStamp(timestamp: number, timezoneOffsetSeconds: number): string {
  const utcTime = new Date(timestamp * 1000);
  const localTime = new Date(utcTime.getTime() + timezoneOffsetSeconds * 1000);
  return localTime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function convertCountryCode(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return countryCode;
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode;
  }
}

const selectors = {
  weatherIcon: (iconCode: string, size: string = '2x') =>
    `https://openweathermap.org/img/wn/${iconCode}@${size}.png`,
  searchForm: () => document.querySelector('.weather-search-form') as HTMLFormElement | null,
  cityInput: () => document.querySelector('.weather-city-input') as HTMLInputElement | null,
  unitToggle: () => document.querySelector('.weather-unit-toggle') as HTMLDivElement | null,
  weatherDisplay: () => document.querySelector('.weather-display') as HTMLDivElement | null,
};

function setState(partial: Partial<WeatherState>) {
  Object.assign(weatherState, partial);
}

async function getWeather(city?: string, units?: 'metric' | 'imperial'): Promise<WeatherData> {
  const targetCity = city || weatherState.currCity;
  const targetUnits = units || weatherState.units;
  setState({ currCity: targetCity, units: targetUnits, loading: true, error: null });

  const query = targetCity.trim();
  const isMetric = targetUnits === 'metric';

  const defaults: WeatherData = {
    city: query,
    country: '',
    countryCode: '',
    tempC: 18,
    tempF: Math.round((18 * 9) / 5 + 32),
    tempMinC: 14,
    tempMaxC: 22,
    condition: 'Fair / Clear',
    description: 'clear sky',
    icon: '01d',
    humidity: 55,
    windSpeedMs: 3.5,
    windSpeedKts: Math.round(3.5 * 1.94384),
    windDirection: '180° S',
    pressure: 1013,
    visibility: 10000,
    feelsLikeC: 17,
    isRealTime: false,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    datetime: new Date().toLocaleString(),
    timezone: 0,
  };

  if (!API_KEY) {
    setState({ loading: false, error: 'Weather API key not configured.' });
    return { ...defaults, error: 'Weather API key not configured.' } as any;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=${targetUnits}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      const tempC = Math.round(data.main.temp);
      const feelsLikeC = Math.round(data.main.feels_like);
      const windSpeedMs = data.wind.speed || 0;
      const result: WeatherData = {
        city: data.name || query,
        country: convertCountryCode(data.sys?.country || ''),
        countryCode: data.sys?.country || '',
        tempC: isMetric ? tempC : Math.round((tempC * 9) / 5 + 32),
        tempF: isMetric ? Math.round((tempC * 9) / 5 + 32) : tempC,
        tempMinC: Math.round(data.main.temp_min),
        tempMaxC: Math.round(data.main.temp_max),
        condition: mapWeatherCondition(data.weather[0]?.main || '', data.weather[0]?.description || ''),
        description: data.weather[0]?.description || '',
        icon: data.weather[0]?.icon || '01d',
        humidity: data.main.humidity,
        windSpeedMs,
        windSpeedKts: Math.round(windSpeedMs * 1.94384),
        windDirection: getWindDirDegrees(data.wind.deg || 0),
        pressure: data.main.pressure,
        visibility: data.visibility || 10000,
        feelsLikeC: isMetric ? feelsLikeC : Math.round((feelsLikeC * 9) / 5 + 32),
        isRealTime: true,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        datetime: convertTimeStamp(data.dt, data.timezone || 0),
        timezone: data.timezone || 0,
      };
      setState({ loading: false });
      return result;
    }

    if (res.status === 404) {
      setState({ loading: false, error: `City "${query}" not found.` });
      return { ...defaults, city: query, error: `City "${query}" not found.` } as any;
    }
  } catch (err: any) {
    const message = err?.message || String(err);
    console.warn(`Weather fetch failed for ${query}: ${message}`);
    setState({ loading: false, error: message });
    return { ...defaults, error: message } as any;
  }

  setState({ loading: false });
  return defaults;
}

export { weatherState, selectors, getWeather };
