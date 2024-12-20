import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();


router.post('/', async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

   
    const weatherData = await WeatherService.getWeatherForCity(city);

    await HistoryService.addCity(city);

    return res.status(200).json({
      message: 'Weather data retrieved successfully',
      data: weatherData,
    });
  } catch (error) {
    console.error('Error retrieving weather data:', error);
    return res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});


router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getHistory();
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    return res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

export default router;