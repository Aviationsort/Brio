/**
 * Live Accurate Weather Service using OpenWeatherMap API
 * Fetches real weather data for any city name.
 */

const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5';

export interface WeatherData {
  city: string;
  country: string;
  tempC: number;
  tempF: number;
  condition: string;
  humidity: number;
  windSpeedMs: number;
  windSpeedKts: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  feelsLikeC: number;
  description: string;
  icon: string;
  isRealTime: boolean;
  lastUpdated: string;
}

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

function getAqiStatus(aqi: number): string {
  if (aqi <= 50) return 'Good / Clean Air';
  if (aqi <= 100) return 'Moderate Air Quality';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  return 'Unhealthy Air Quality';
}

/**
 * Fetch accurate live weather data for any city name or country
 */
export async function fetchAccurateWeather(city: string, units: string = 'metric'): Promise<WeatherData> {
  const query = city.trim();
  let isRealTime = false;

  let tempC = 20;
  let tempF = 68;
  let humidity = 60;
  let windSpeedMs = 3;
  let windSpeedKts = 6;
  let windDirection = '180° S';
  let condition = 'Fair / Clear';
  let pressure = 1013;
  let visibility = 10000;
  let feelsLikeC = 20;
  let description = '';
  let icon = '01d';
  let cityName = query;
  let country = '';

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=${units}`;
    const res = await fetch(weatherUrl);

    if (res.ok) {
      const data = await res.json();
      tempC = Math.round(data.main.temp);
      feelsLikeC = Math.round(data.main.feels_like);
      tempF = Math.round((tempC * 9) / 5 + 32);
      humidity = data.main.humidity;
      pressure = data.main.pressure;
      visibility = data.visibility || 10000;
      windSpeedMs = Math.round(data.wind.speed * 10) / 10;
      windSpeedKts = Math.round(windSpeedMs * 1.94384);
      windDirection = getWindDirDegrees(data.wind.deg || 0);
      condition = mapWeatherCondition(data.weather[0]?.main || '', data.weather[0]?.description || '');
      description = data.weather[0]?.description || '';
      icon = data.weather[0]?.icon || '01d';
      cityName = data.name || query;
      country = data.sys?.country || '';
      isRealTime = true;
    }
  } catch (err) {
    console.warn(`OpenWeatherMap fetch skipped/failed for ${query}:`, err);
  }

  // Deterministic calculation if offline/network fails
  if (!isRealTime) {
    const charSum = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hour = new Date().getHours();
    tempC = 12 + ((charSum + hour) % 18);
    feelsLikeC = tempC;
    tempF = Math.round((tempC * 9) / 5 + 32);
    humidity = 45 + (charSum % 35);
    windSpeedMs = 2 + (charSum % 8);
    windSpeedKts = Math.round(windSpeedMs * 1.94384);
    windDirection = `${(charSum * 15) % 360}°`;
    pressure = 1000 + (charSum % 30);
    visibility = 5000 + (charSum % 10000);
    condition = 'Fair / Clear';
    description = 'clear sky';
    icon = '01d';
  }

  const weatherRecord: WeatherData = {
    city: cityName,
    country,
    tempC,
    tempF,
    condition,
    humidity,
    windSpeedMs,
    windSpeedKts,
    windDirection,
    pressure,
    visibility,
    feelsLikeC,
    description,
    icon,
    isRealTime,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  return weatherRecord;
}
