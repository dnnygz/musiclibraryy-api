import { sql } from '../config/database.js';
import { ArtistInfo, Song } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class ArtistService {
  async getAll(): Promise<ArtistInfo[]> {
    const artists = await sql<ArtistInfo[]>`
      SELECT 
        artist as name,
        COUNT(*)::int as total_songs,
        ARRAY_AGG(DISTINCT genre) FILTER (WHERE genre IS NOT NULL) as genres
      FROM songs
      GROUP BY artist
      ORDER BY total_songs DESC, artist ASC
    `;

    return artists;
  }

  async getByName(name: string): Promise<{ artist: string; total_songs: number; songs: Song[] }> {
    const songs = await sql<Song[]>`
      SELECT * FROM songs
      WHERE artist = ${name}
      ORDER BY year DESC, title ASC
    `;

    if (songs.length === 0) {
      throw new NotFoundError('Artist');
    }

    return {
      artist: name,
      total_songs: songs.length,
      songs,
    };
  }
}

