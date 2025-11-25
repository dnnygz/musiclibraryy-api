import { Hono } from 'hono';
import { SongService } from '../services/songService.js';
import { validateBody, validateQuery, validateUUID } from '../middleware/validator.js';
import {
  createSongSchema,
  updateSongSchema,
  songQuerySchema,
} from '../validators/songValidator.js';

const app = new Hono();
const songService = new SongService();

// GET /api/songs
app.get('/', validateQuery(songQuerySchema), async (c) => {
  try {
    const filters = c.req.valid('query');
    const songs = await songService.getAll(filters);
    return c.json(songs);
  } catch (error) {
    throw error;
  }
});

// GET /api/songs/:id
app.get('/:id', validateUUID('id'), async (c) => {
  try {
    const id = c.req.param('id');
    const song = await songService.getById(id);
    return c.json(song);
  } catch (error) {
    throw error;
  }
});

// POST /api/songs
app.post('/', validateBody(createSongSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const song = await songService.create(data);
    return c.json(song, 201);
  } catch (error) {
    throw error;
  }
});

// PUT /api/songs/:id
app.put('/:id', validateUUID('id'), validateBody(updateSongSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const song = await songService.update(id, data);
    return c.json(song);
  } catch (error) {
    throw error;
  }
});

// DELETE /api/songs/:id
app.delete('/:id', validateUUID('id'), async (c) => {
  try {
    const id = c.req.param('id');
    await songService.delete(id);
    return c.json({ message: 'Song deleted successfully' });
  } catch (error) {
    throw error;
  }
});

export default app;

