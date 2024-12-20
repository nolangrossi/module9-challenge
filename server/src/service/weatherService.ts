import dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';
dotenv.config();

interface Coordinates {
  latitude: number;
  longitude: number;
}

class Weather {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;

  constructor(temperature: number, description: string, humidity: number, windSpeed: number) {
    this.temperature = temperature;
    this.description = description;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

interface Forecast {
  date: string;
  temperature: number;
  description: string;
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    if (!this.apiKey) {
      throw new Error('API key is not defined in the environment variables.');
    }
  }

  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`;
    try {
      const response: AxiosResponse = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw new Error('Failed to fetch location data.');
    }
  }

  private destructureLocationData(locationData: any): Coordinates {
    return { latitude: locationData.coord.lat, longitude: locationData.coord.lon };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    const { latitude, longitude } = coordinates;
    return `${this.baseURL}/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${this.apiKey}&units=metric`;
  }

  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    try {
      const response: AxiosResponse = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data.');
    }
  }

  private parseCurrentWeather(response: any): Weather {
    const { temp, weather, humidity, wind_speed } = response.current;
    return new Weather(temp, weather[0].description, humidity, wind_speed);
  }

  private buildForecastArray(weatherData: any): Forecast[] {
    return weatherData.daily.slice(0, 7).map((day: any) => ({
      date: new Date(day.dt * 1000).toISOString().split('T')[0],
      temperature: day.temp.day,
      description: day.weather[0].description,
    }));
  }

  public async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Forecast[] }> {
    if (!city) {
      throw new Error('City name is required.');
    }

    try {
      const coordinates: Coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(weatherData);

      return {
        current: currentWeather,
        forecast,
      };
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}

export default new WeatherService();
