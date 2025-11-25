import { Hono } from 'hono';
import { ArtistService } from '../services/artistService.js';

const app = new Hono();
const artistService = new ArtistService();

// GET /api/artists
app.get('/', async (c) => {
  try {
    const artists = await artistService.getAll();
    return c.json(artists);
  } catch (error) {
    throw error;
  }
});

// GET /api/artists/:name
app.get('/:name', async (c) => {
  try {
    const name = decodeURIComponent(c.req.param('name'));
    const result = await artistService.getByName(name);
    return c.json(result);
  } catch (error) {
    throw error;
  }
});

export default app;

