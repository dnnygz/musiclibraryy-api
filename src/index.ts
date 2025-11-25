import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './config/env.js';
import { testConnection } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import songsRouter from './routes/songs.js';
import playlistsRouter from './routes/playlists.js';
import artistsRouter from './routes/artists.js';
import statsRouter from './routes/stats.js';
import aiRouter from './routes/ai.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  })
);

// Health check
app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Routes
app.route('/api/v1/songs', songsRouter);
app.route('/api/v1/playlists', playlistsRouter);
app.route('/api/v1/playlist', playlistsRouter);
app.route('/api/v1/artists', artistsRouter);
app.route('/api/v1/stats', statsRouter);
app.route('/api/v1/ai', aiRouter);

// Error handler
app.onError(errorHandler);

// Start server
const port = parseInt(env.PORT);

async function start() {
  await testConnection();

  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`🎵 MusicLibrary API running on http://localhost:${port}`);
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

