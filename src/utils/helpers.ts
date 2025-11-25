import { Song } from '../types/index.js';

/**
 * Calculate total duration of songs in seconds
 */
export function calculateTotalDuration(songs: Song[]): number {
  return songs.reduce((total, song) => total + song.duration, 0);
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get decade from year
 */
export function getDecade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

/**
 * Sanitize string for SQL LIKE queries
 */
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%_]/g, '\\$&');
}

