import { sql } from '../config/database.js';
import { DashboardStats } from '../types/index.js';
import { getDecade } from '../utils/helpers.js';

export class StatsService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalSongsResult,
        totalPlaylistsResult,
        uniqueGenresResult,
        uniqueArtistsResult,
        songsByGenreResult,
        songsByDecadeResult,
      ] = await Promise.all([
        sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM songs`,
        sql<{ count: number }[]>`SELECT COUNT(*)::int as count FROM playlists`,
        sql<{ count: number }[]>`SELECT COUNT(DISTINCT genre)::int as count FROM songs WHERE genre IS NOT NULL`,
        sql<{ count: number }[]>`SELECT COUNT(DISTINCT artist)::int as count FROM songs`,
        sql<{ genre: string; count: number }[]>`
          SELECT genre, COUNT(*)::int as count
          FROM songs
          WHERE genre IS NOT NULL
          GROUP BY genre
          ORDER BY count DESC
        `,
        sql<{ year: number }[]>`
          SELECT year
          FROM songs
          WHERE year IS NOT NULL
        `,
      ]);

      // Ensure safe defaults for all numeric values
      const totalSongs = totalSongsResult[0]?.count ?? 0;
      const totalPlaylists = totalPlaylistsResult[0]?.count ?? 0;
      const uniqueGenres = uniqueGenresResult[0]?.count ?? 0;
      const uniqueArtists = uniqueArtistsResult[0]?.count ?? 0;

      // Ensure songsByGenre is always an array, even if empty
      const songsByGenre = (songsByGenreResult || []).map((row) => ({
        genre: row.genre || '',
        count: row.count || 0,
      }));

      // Calculate songs by decade, ensuring it's always an array
      const decadeMap = new Map<string, number>();
      (songsByDecadeResult || []).forEach((row) => {
        if (row.year) {
          const decade = getDecade(row.year);
          decadeMap.set(decade, (decadeMap.get(decade) ?? 0) + 1);
        }
      });

      const songsByDecade = Array.from(decadeMap.entries())
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => a.decade.localeCompare(b.decade));

      // Always return all properties with safe defaults
      return {
        total_songs: totalSongs,
        total_playlists: totalPlaylists,
        unique_genres: uniqueGenres,
        unique_artists: uniqueArtists,
        songs_by_genre: songsByGenre,
        songs_by_decade: songsByDecade,
      };
    } catch (error) {
      // Return safe defaults if any error occurs
      console.error('Error fetching dashboard stats:', error);
      return {
        total_songs: 0,
        total_playlists: 0,
        unique_genres: 0,
        unique_artists: 0,
        songs_by_genre: [],
        songs_by_decade: [],
      };
    }
  }
}

