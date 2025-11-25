import { sql } from '../config/database.js';
import { Song } from '../types/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { sanitizeSearchTerm } from '../utils/helpers.js';

export class SongService {
  async getAll(filters: {
    genre?: string;
    artist?: string;
    year?: number;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<Song[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.genre) {
      conditions.push(`genre = $${paramIndex}`);
      values.push(filters.genre);
      paramIndex++;
    }

    if (filters.artist) {
      conditions.push(`artist = $${paramIndex}`);
      values.push(filters.artist);
      paramIndex++;
    }

    if (filters.year) {
      conditions.push(`year = $${paramIndex}`);
      values.push(filters.year);
      paramIndex++;
    }

    if (filters.search) {
      const searchTerm = `%${sanitizeSearchTerm(filters.search)}%`;
      conditions.push(`(title ILIKE $${paramIndex} OR artist ILIKE $${paramIndex} OR album ILIKE $${paramIndex})`);
      values.push(searchTerm);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    values.push(filters.limit, filters.offset);

    const query = `
      SELECT * FROM songs
      ${whereClause}
      ORDER BY created_at ASC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    return await sql.unsafe(query, values) as Song[];
  }

  async getById(id: string): Promise<Song> {
    const [song] = await sql<Song[]>`
      SELECT * FROM songs WHERE id = ${id}
    `;

    if (!song) {
      throw new NotFoundError('Song');
    }

    return song;
  }

  async create(data: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<Song> {
    const [song] = await sql<Song[]>`
      INSERT INTO songs (
        title, artist, album, genre, year, duration, lyrics, image_url
      ) VALUES (
        ${data.title},
        ${data.artist},
        ${data.album || null},
        ${data.genre || null},
        ${data.year || null},
        ${data.duration},
        ${data.lyrics || null},
        ${data.image_url || null}
      )
      RETURNING *
    `;

    return song;
  }

  async update(id: string, data: Partial<Song>): Promise<Song> {
    // Check if song exists
    await this.getById(id);

    const allowedFields = ['title', 'artist', 'album', 'genre', 'year', 'duration', 'lyrics', 'image_url'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value === '' ? null : value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    values.push(id);

    const query = `
      UPDATE songs
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [song] = await sql.unsafe(query, values) as Song[];
    return song;
  }

  async delete(id: string): Promise<void> {
    await sql`
      DELETE FROM songs WHERE id = ${id}
    `;
  }
}

