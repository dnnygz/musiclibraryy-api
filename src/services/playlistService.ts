import { sql } from '../config/database.js';
import { Playlist, PlaylistWithSongs, Song } from '../types/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { calculateTotalDuration } from '../utils/helpers.js';

export class PlaylistService {
  async getAll(includeSongs: boolean = false): Promise<Playlist[] | PlaylistWithSongs[]> {
    const playlistsWithCount = await sql<Playlist[]>`
      SELECT 
        p.*,
        COALESCE(COUNT(ps.song_id), 0)::int as total_songs
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    if (!includeSongs) {
      return playlistsWithCount;
    }

    const playlistsWithSongs: PlaylistWithSongs[] = await Promise.all(
      playlistsWithCount.map(async (playlist) => {
        const songs = await this.getSongsForPlaylist(playlist.id);
        return {
          ...playlist,
          songs,
          total_duration: calculateTotalDuration(songs),
        };
      })
    );

    return playlistsWithSongs;
  }

  async getById(id: string): Promise<PlaylistWithSongs> {
    const [playlist] = await sql<Playlist[]>`
      SELECT * FROM playlists WHERE id = ${id}
    `;

    if (!playlist) {
      throw new NotFoundError('Playlist');
    }

    const songs = await this.getSongsForPlaylist(id);

    return {
      ...playlist,
      songs,
      total_duration: calculateTotalDuration(songs),
    };
  }

  async create(data: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>): Promise<Playlist> {
    const [playlist] = await sql<Playlist[]>`
      INSERT INTO playlists (name, description, tags)
      VALUES (
        ${data.name},
        ${data.description || null},
        ${data.tags || []}
      )
      RETURNING *
    `;

    return playlist;
  }

  async update(id: string, data: Partial<Playlist>): Promise<Playlist> {
    await this.getById(id); // Check if exists

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(data.description === '' ? null : data.description);
      paramIndex++;
    }

    if (data.tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      values.push(data.tags);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    values.push(id);

    const query = `
      UPDATE playlists
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [playlist] = await sql.unsafe(query, values) as Playlist[];
    return playlist;
  }

  async delete(id: string): Promise<void> {
    const result = await sql`
      DELETE FROM playlists WHERE id = ${id}
    `;

    if (result.count === 0) {
      throw new NotFoundError('Playlist');
    }
  }

  async addSong(playlistId: string, songId: string, position?: number): Promise<PlaylistWithSongs> {
    // Check if playlist exists
    await this.getById(playlistId);

    // Check if song exists
    const [song] = await sql<Song[]>`
      SELECT * FROM songs WHERE id = ${songId}
    `;
    if (!song) {
      throw new NotFoundError('Song');
    }

    // Check if song is already in playlist
    const [existing] = await sql`
      SELECT * FROM playlist_songs
      WHERE playlist_id = ${playlistId} AND song_id = ${songId}
    `;
    if (existing) {
      throw new ConflictError('Song is already in the playlist');
    }

    // Get max position if not provided
    if (position === undefined) {
      const [maxPos] = await sql<{ max: number }[]>`
        SELECT COALESCE(MAX(position), -1) as max
        FROM playlist_songs
        WHERE playlist_id = ${playlistId}
      `;
      position = (maxPos?.max ?? -1) + 1;
    }

    await sql`
      INSERT INTO playlist_songs (playlist_id, song_id, position)
      VALUES (${playlistId}, ${songId}, ${position})
    `;

    return this.getById(playlistId);
  }

  async removeSong(playlistId: string, songId: string): Promise<void> {
    // Verificar que la playlist existe (esto sí debe fallar si no existe)
    const [playlist] = await sql<Playlist[]>`
      SELECT id FROM playlists WHERE id = ${playlistId}
    `;
    
    if (!playlist) {
      throw new NotFoundError('Playlist');
    }
    
    await sql`
      DELETE FROM playlist_songs
      WHERE playlist_id = ${playlistId} AND song_id = ${songId}
    `;
  }

  async reorderSongs(playlistId: string, songOrders: { song_id: string; position: number }[]): Promise<PlaylistWithSongs> {
    await this.getById(playlistId); // Check if playlist exists

    // Validate all songs exist in playlist
    const playlistSongs = await this.getSongsForPlaylist(playlistId);
    const playlistSongIds = new Set(playlistSongs.map(s => s.id));
    
    for (const order of songOrders) {
      if (!playlistSongIds.has(order.song_id)) {
        throw new NotFoundError(`Song ${order.song_id} in playlist`);
      }
    }

    // Update positions
    await sql.begin(async (sql) => {
      for (const order of songOrders) {
        await sql`
          UPDATE playlist_songs
          SET position = ${order.position}
          WHERE playlist_id = ${playlistId} AND song_id = ${order.song_id}
        `;
      }
    });

    return this.getById(playlistId);
  }

  private async getSongsForPlaylist(playlistId: string): Promise<Song[]> {
    return await sql<Song[]>`
      SELECT s.*
      FROM songs s
      INNER JOIN playlist_songs ps ON s.id = ps.song_id
      WHERE ps.playlist_id = ${playlistId}
      ORDER BY ps.position ASC, ps.added_at ASC
    `;
  }
}

