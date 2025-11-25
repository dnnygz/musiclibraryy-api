import { Hono } from 'hono';
import { PlaylistService } from '../services/playlistService.js';
import { validateBody, validateQuery, validateUUID } from '../middleware/validator.js';
import {
  createPlaylistSchema,
  updatePlaylistSchema,
  playlistQuerySchema,
  addSongToPlaylistSchema,
  reorderPlaylistSongsSchema,
} from '../validators/playlistValidator.js';

const app = new Hono();
const playlistService = new PlaylistService();

// GET /api/playlists
app.get('/', validateQuery(playlistQuerySchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const playlists = await playlistService.getAll(query.include_songs);
    return c.json(playlists);
  } catch (error) {
    throw error;
  }
});

// POST /api/playlist/new 
app.post('/new', validateBody(createPlaylistSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const playlist = await playlistService.create(data);
    return c.json(playlist, 201);
  } catch (error) {
    throw error;
  }
});

// POST /api/playlists
app.post('/', validateBody(createPlaylistSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const playlist = await playlistService.create(data);
    return c.json(playlist, 201);
  } catch (error) {
    throw error;
  }
});

// GET /api/playlists/:id
app.get('/:id', validateUUID('id'), async (c) => {
  try {
    const id = c.req.param('id');
    const playlist = await playlistService.getById(id);
    return c.json(playlist);
  } catch (error) {
    throw error;
  }
});

// PUT /api/playlists/:id
app.put('/:id', validateUUID('id'), validateBody(updatePlaylistSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const playlist = await playlistService.update(id, data);
    return c.json(playlist);
  } catch (error) {
    throw error;
  }
});

// DELETE /api/playlists/:id
app.delete('/:id', validateUUID('id'), async (c) => {
  try {
    const id = c.req.param('id');
    await playlistService.delete(id);
    return c.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    throw error;
  }
});

// POST /api/playlists/:id/songs
app.post('/:id/songs', validateUUID('id'), validateBody(addSongToPlaylistSchema), async (c) => {
  try {
    const playlistId = c.req.param('id');
    const { song_id, position } = c.req.valid('json');
    const playlist = await playlistService.addSong(playlistId, song_id, position);
    return c.json(playlist);
  } catch (error) {
    throw error;
  }
});

// DELETE /api/playlists/:id/songs/:songId
app.delete('/:id/songs/:songId', validateUUID('id'), validateUUID('songId'), async (c) => {
  try {
    const playlistId = c.req.param('id');
    const songId = c.req.param('songId');
    await playlistService.removeSong(playlistId, songId);
    return c.json({ message: 'Song removed from playlist successfully' });
  } catch (error) {
    throw error;
  }
});

// PUT /api/playlists/:id/songs/reorder
app.put('/:id/songs/reorder', validateUUID('id'), validateBody(reorderPlaylistSongsSchema), async (c) => {
  try {
    const playlistId = c.req.param('id');
    const { song_orders } = c.req.valid('json');
    const playlist = await playlistService.reorderSongs(playlistId, song_orders);
    return c.json(playlist);
  } catch (error) {
    throw error;
  }
});

export default app;

