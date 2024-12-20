import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST request to get weather data for a city and add it to search history if it doesn't already exist in the history
router.post('/', async (req: Request, res: Response) => {
  try {
    const city = req.body.cityName;
    if (!city) {
      return res.status(400).json({ error: `City name is required: ${city}` });
    }

    const weatherData = await WeatherService.getWeatherForCity(city);

    // Check for existing city before adding to history
    const existingCity = await HistoryService.getCities().then((cities) =>
      cities.find((existingCity: { name: string }) => existingCity.name === city)
    );

    if (!existingCity) {
      await HistoryService.addCity(city);
      console.log(`City "${city}" added to search history.`);
    } else {
      console.log(`City "${city}" already exists in search history.`);
    }

    return res.status(200).json(weatherData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

// GET request to fetch search history of cities
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch search history' });
  }
});

// * DELETE request to remove a city from search history by id
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const cityId = req.params.id;
    await HistoryService.removeCity(cityId);
    res.json({ message: 'City removed from search history' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete city from search history' });
  }
});

export default router;
