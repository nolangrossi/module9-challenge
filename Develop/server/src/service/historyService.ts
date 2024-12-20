import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'searchHistory.json');


class City {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}


class HistoryService {
 
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(data) as { id: number; name: string }[];
      return parsedData.map((city) => new City(city.id, city.name));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        
        return [];
      }
      throw error;
    }
  }

 
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(cities, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to searchHistory.json:', error);
      throw error;
    }
  }

  public async getCities(): Promise<City[]> {
    return await this.read();
  }

  public async getHistory(): Promise<{ id: number; name: string }[]> {
    const cities = await this.getCities();
    return cities.map((city) => ({ id: city.id, name: city.name }));
  }

  public async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    const newId = cities.length > 0 ? Math.max(...cities.map((c) => c.id)) + 1 : 1;
    const newCity = new City(newId, cityName);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }

  public async removeCity(id: number): Promise<boolean> {
    const cities = await this.read();
    const updatedCities = cities.filter((city) => city.id !== id);
    if (updatedCities.length === cities.length) {
      throw new Error(`City with ID ${id} not found`);
    }
    await this.write(updatedCities);
    return true;
  }
}

export default new HistoryService();
