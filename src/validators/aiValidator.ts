import { z } from 'zod';
import { songSchema } from './songValidator.js';

const MAX_SONGS_ARRAY = 500;

export const describePlaylistRequestSchema = z.object({
  songs: z.array(songSchema, { 
    required_error: 'songs is required',
    invalid_type_error: 'songs must be an array',
  })
    .min(1, 'songs array must contain at least one song')
    .max(MAX_SONGS_ARRAY, `songs array cannot exceed ${MAX_SONGS_ARRAY} items`),
});

export const recommendSongsRequestSchema = z.object({
  current_songs: z.array(songSchema, { 
    required_error: 'current_songs is required',
    invalid_type_error: 'current_songs must be an array',
  })
    .min(1, 'current_songs array must contain at least one song')
    .max(MAX_SONGS_ARRAY, `current_songs array cannot exceed ${MAX_SONGS_ARRAY} items`),
  number_of_recommendations: z.number({
    required_error: 'number_of_recommendations is required',
    invalid_type_error: 'number_of_recommendations must be a number',
  })
    .int('number_of_recommendations must be an integer')
    .positive('number_of_recommendations must be a positive number')
    .max(50, 'number_of_recommendations cannot exceed 50'),
});

export const generatePlaylistNameRequestSchema = z.object({
  songs: z.array(songSchema, {
    required_error: 'songs is required',
    invalid_type_error: 'songs must be an array',
  })
    .min(1, 'songs array must contain at least one song')
    .max(MAX_SONGS_ARRAY, `songs array cannot exceed ${MAX_SONGS_ARRAY} items`),
  style: z.enum(['creative', 'descriptive', 'fun'], {
    required_error: 'style is required',
    invalid_type_error: 'style must be one of: creative, descriptive, fun',
  }),
});

export const analyzeMoodRequestSchema = z.object({
  songs: z.array(songSchema, { 
    required_error: 'songs is required',
    invalid_type_error: 'songs must be an array',
  })
    .min(1, 'songs array must contain at least one song')
    .max(MAX_SONGS_ARRAY, `songs array cannot exceed ${MAX_SONGS_ARRAY} items`),
});

export const semanticSearchRequestSchema = z.object({
  query: z.string({
    required_error: 'query is required',
    invalid_type_error: 'query must be a string',
  })
    .min(1, 'query cannot be empty')
    .max(500, 'query must be at most 500 characters'),
  limit: z.number({
    invalid_type_error: 'limit must be a number',
  })
    .int('limit must be an integer')
    .positive('limit must be a positive number')
    .max(100, 'limit cannot exceed 100')
    .default(10),
});