import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

// Weather class with properties
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number,
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  private baseURL?: string;
  private apiKey?: string;
  private cityName: string = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Error fetching location data: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.length === 0) {
        throw new Error('No location data found for the provided city name');
      }
      return data[0];
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch location data');
    }
  }
  private destructureLocationData(locationData: Coordinates) {
    const { lat, lon } = locationData;
    return { lat, lon };
  }
  private buildGeocodeQuery() {
    if (!this.cityName || !this.apiKey) {
      throw new Error('City name or API key is missing');
    }
    const query = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`;
    return query;
  }
  private buildWeatherQuery(coordinates: Coordinates) {
    if (!this.apiKey) {
      throw new Error('API key is missing');
    }
    const { lat, lon } = coordinates;
    const query = `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
    return query;
  }
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const query = this.buildWeatherQuery(coordinates);
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch weather data');
    }
  }
  private parseCurrentWeather(response: any) {
    const { temp, humidity } = response.main;
    const { speed: windSpeed } = response.wind;
    const { description, icon } = response.weather[0];
    return new Weather(this.cityName, response.dt_txt, icon, description, temp, windSpeed, humidity);
  }
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    let filteredDays = weatherData.filter((day: any) => day.dt_txt.includes('12:00:00'));

    const forecast = filteredDays.map((day: any) => {
      const { temp, humidity } = day.main;
      const { speed: windSpeed } = day.wind;
      const { description, icon } = day.weather[0];
      return new Weather(this.cityName, day.dt_txt, icon, description, temp, windSpeed, humidity);
    });
    return { currentWeather, forecast };
  }
  async getWeatherForCity(city: string) {
    if (!city) {
      throw new Error('City name is missing');
    }

    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
      const forecast = this.buildForecastArray(currentWeather, weatherData.list);
      
      if (!currentWeather || !forecast) {
        throw new Error('Failed to parse weather data');
      }

      return forecast;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
}
export default new WeatherService();
