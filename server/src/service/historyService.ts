import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}
// HistoryService class definition with methods to read, write, get, add, and remove cities from the searchHistory.json file
class HistoryService {
  
  // read method that reads the searchHistory.json file and returns the parsed data
  private async read() {
    const filePath = './db/searchHistory.json';
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading or parsing search history:', error);
    }
  }
  // write method that writes the cities to the searchHistory.json file
  private async write(cities: City[]) {
    const filePath = './db/searchHistory.json';
    try {
      await fs.writeFile(filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history:', error);
    }
  }
  // get method that returns the cities from the searchHistory.json file
  async getCities() {
    try {
      const cities = await this.read();
      return cities;
    } catch (error) {
      console.error('Error getting cities:', error);
      return [];
    }
  }
  // addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    try {
      const cities = await this.read();
      const newCity = new City(city, uuidv4());
      cities.push(newCity);
      await this.write(cities);
      return newCity;
    } catch (error) {
      console.error('Error adding city:', error);
      return null;
    }
  }
  // removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    try {
      const cities = await this.read();
      const filteredCities = cities.filter((city: City) => city.id !== id);
      await this.write(filteredCities);
    } catch (error) {
      console.error('Error removing city:', error);
    }
  }
}
// Export an instance of the HistoryService class to be used in other files
export default new HistoryService();
