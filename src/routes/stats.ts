import { Hono } from 'hono';
import { StatsService } from '../services/statsService.js';

const app = new Hono();
const statsService = new StatsService();

// GET /api/stats
app.get('/', async (c) => {
  try {
    const stats = await statsService.getDashboardStats();
    return c.json(stats);
  } catch (error) {
    throw error;
  }
});

export default app;


