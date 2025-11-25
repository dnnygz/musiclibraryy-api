import { Hono } from 'hono';
import { AIService } from '../services/aiService.js';
import { validateBody } from '../middleware/validator.js';
import {
  describePlaylistRequestSchema,
  recommendSongsRequestSchema,
  generatePlaylistNameRequestSchema,
  analyzeMoodRequestSchema,
  semanticSearchRequestSchema,
} from '../validators/aiValidator.js';

const app = new Hono();
const aiService = new AIService();

// POST /api/ai/describe-playlist
app.post('/describe-playlist', validateBody(describePlaylistRequestSchema), async (c) => {
  try {
    const { songs } = c.req.valid('json');
    const result = await aiService.describePlaylist(songs);
    return c.json(result);
  } catch (error) {
    throw error;
  }
});

// POST /api/ai/recommend-songs
app.post('/recommend-songs', validateBody(recommendSongsRequestSchema), async (c) => {
  try {
    const { current_songs, number_of_recommendations } = c.req.valid('json');
    const result = await aiService.recommendSongs(current_songs, number_of_recommendations);
    return c.json(result);
  } catch (error) {
    throw error;
  }
});

// POST /api/ai/generate-playlist-name
app.post('/generate-playlist-name', validateBody(generatePlaylistNameRequestSchema), async (c) => {
  try {
    const { songs, style } = c.req.valid('json');
    const result = await aiService.generatePlaylistName(songs, style);
    return c.json(result);
  } catch (error) {
    throw error;
  }
});

// POST /api/ai/analyze-mood
app.post('/analyze-mood', validateBody(analyzeMoodRequestSchema), async (c) => {
  try {
    const { songs } = c.req.valid('json');
    const result = await aiService.analyzeMood(songs);
    return c.json(result);
  } catch (error) {
    throw error;
  }
});

// POST /api/ai/semantic-search
app.post('/semantic-search', validateBody(semanticSearchRequestSchema), async (c) => {
  try {
    const { query, limit } = c.req.valid('json');
    const result = await aiService.semanticSearch(query, limit);
    return c.json(result);
  } catch (error) {
    throw error;
  }
});

export default app;

