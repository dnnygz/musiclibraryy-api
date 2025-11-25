# MusicLibrary API

Backend REST API for the MusicLibrary system built with Hono and TypeScript.

## Features

- Complete CRUD operations for songs and playlists
- AI-powered features (recommendations, descriptions, mood analysis)
- PostgreSQL database with optimized queries
- Type-safe with TypeScript and Zod validation
- RESTful API design
- Artist management and statistics
- Semantic search capabilities

## Tech Stack

- **Framework:** Hono v4
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL 15
- **Validation:** Zod
- **Query Builder:** postgres.js
- **Runtime:** Node.js 20+

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 15 or higher
- npm or yarn

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Create `.env` file:**

Copy the example environment file and configure it:

```bash
# Create .env file with the following variables:
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://admin:admin123@localhost:5432/musiclibrary
AI_API_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000
```

3. **Setup database:**

```bash
# Make sure PostgreSQL is running
npm run db:setup
```

4. **Seed initial data (optional):**

```bash
npm run db:seed
```

5. **Run development server:**

```bash
npm run dev
```

API will be available at `http://localhost:3001`

## Build for Production

```bash
npm run build
npm start
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Songs

- `GET /api/v1/songs` - Get all songs (with optional filters: genre, artist, year, search)
- `GET /api/v1/songs/:id` - Get a single song by ID
- `POST /api/v1/songs` - Create a new song
- `PUT /api/v1/songs/:id` - Update a song
- `DELETE /api/v1/songs/:id` - Delete a song

### Playlists

- `GET /api/v1/playlists` - Get all playlists (optional: include_songs query param). Returns `total_songs` for each playlist.
- `GET /api/v1/playlists/:id` - Get a playlist with its songs
- `POST /api/v1/playlists` - Create a new playlist
- `POST /api/v1/playlist/new` - Create a new playlist (singular route, alias)
- `PUT /api/v1/playlists/:id` - Update a playlist
- `DELETE /api/v1/playlists/:id` - Delete a playlist
- `POST /api/v1/playlists/:id/songs` - Add a song to a playlist
- `DELETE /api/v1/playlists/:id/songs/:songId` - Remove a song from a playlist
- `PUT /api/v1/playlists/:id/songs/reorder` - Reorder songs in a playlist

### Artists

- `GET /api/v1/artists` - Get all unique artists with song counts
- `GET /api/v1/artists/:name` - Get all songs by an artist

### Statistics

- `GET /api/v1/stats` - Get dashboard statistics (includes songs_by_genre, songs_by_decade, etc.)

### AI Endpoints (Proxy to AI API)

- `POST /api/v1/ai/describe-playlist` - Generate a description for a playlist
- `POST /api/v1/ai/recommend-songs` - Get song recommendations
- `POST /api/v1/ai/generate-playlist-name` - Generate creative names for a playlist
- `POST /api/v1/ai/analyze-mood` - Analyze the mood of songs
- `POST /api/v1/ai/semantic-search` - Search songs using natural language (returns songs and explanation)

### Health Check

- `GET /health` - Health check endpoint

## Project Structure

```
musiclibrary-api/
├── src/
│   ├── index.ts                 # Entry point, Hono app setup
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection
│   │   └── env.ts               # Environment variables validation
│   ├── types/
│   │   └── index.ts             # All TypeScript interfaces
│   ├── routes/
│   │   ├── songs.ts             # Songs CRUD routes
│   │   ├── playlists.ts         # Playlists CRUD routes
│   │   ├── artists.ts           # Artists routes
│   │   ├── stats.ts             # Statistics routes
│   │   └── ai.ts                # AI proxy routes
│   ├── services/
│   │   ├── songService.ts       # Business logic for songs
│   │   ├── playlistService.ts   # Business logic for playlists
│   │   ├── artistService.ts     # Business logic for artists
│   │   ├── statsService.ts      # Statistics calculations
│   │   └── aiService.ts         # AI API client
│   ├── validators/
│   │   ├── songValidator.ts     # Zod schemas for songs
│   │   ├── playlistValidator.ts # Zod schemas for playlists
│   │   └── aiValidator.ts       # Zod schemas for AI requests
│   ├── middleware/
│   │   ├── errorHandler.ts      # Global error handler
│   │   └── validator.ts         # Validation middleware (using Hono validator)
│   └── utils/
│       ├── errors.ts            # Custom error classes
│       ├── helpers.ts           # Helper functions
│       ├── constants.ts         # Constants
│       ├── uuid.ts              # UUID validation utilities
│       └── response.ts          # Response formatting helpers
├── scripts/
│   ├── setup-db.sql             # Database schema
│   └── seed-data.ts             # Seed initial data
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Database Schema

The database includes three main tables:

- **songs**: Stores song information (title, artist, album, genre, year, duration, lyrics, etc.)
- **playlists**: Stores playlist information (name, description, tags)
- **playlist_songs**: Junction table for many-to-many relationship between playlists and songs

See `scripts/setup-db.sql` for the complete schema.

## Response Format

### Success Responses

All successful responses return data directly (no wrapper):
- Arrays: `[...]`
- Objects: `{...}`

### Error Responses

All errors return JSON in the format:
```json
{
  "success": false,
  "error": "Error message"
}
```

The API uses custom error classes for consistent error responses:

- `NotFoundError` (404): Resource not found
- `ValidationError` (400): Invalid input data
- `ConflictError` (409): Resource conflict (e.g., duplicate entry)
- `AppError` (custom): For AI API errors and other application errors

## Validation

All request bodies and query parameters are validated using Zod schemas with Hono's validator middleware. Invalid data will return a 400 status with detailed validation error messages. UUID parameters are automatically validated before processing.

### Validation Features

- **Type-safe validation** with Zod schemas
- **Descriptive error messages** for each field
- **Array size limits** to prevent abuse (e.g., max 500 songs in AI requests)
- **UUID validation** for all ID parameters
- **Automatic type coercion** for query parameters

## Docker

Build and run with Docker:

```bash
docker build -t musiclibrary-api .
docker run -p 3001:3001 --env-file .env musiclibrary-api
```

## Development

The project uses:

- **TypeScript** in strict mode for type safety
- **ES modules** for modern JavaScript
- **tsx** for development with hot reload
- **postgres.js** for type-safe SQL queries
- **Hono validator** for request validation
- **Zod** for schema validation with detailed error messages

## Key Features

- ✅ **UUID validation** - All ID parameters are validated as UUIDs
- ✅ **Comprehensive error handling** - Custom error classes with appropriate HTTP status codes
- ✅ **AI API integration** - Robust error handling with timeouts and connection error detection
- ✅ **Type-safe** - Full TypeScript coverage with strict mode
- ✅ **Efficient queries** - Optimized SQL with indexes and connection pooling
- ✅ **Playlist statistics** - `total_songs` included in playlist responses

## License

MIT
