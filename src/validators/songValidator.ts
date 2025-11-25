import { z } from 'zod';
import { MIN_YEAR, MAX_YEAR } from '../utils/constants.js';

export const createSongSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string',
  })
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be at most 255 characters'),
  artist: z.string({
    required_error: 'Artist is required',
    invalid_type_error: 'Artist must be a string',
  })
    .min(1, 'Artist cannot be empty')
    .max(255, 'Artist must be at most 255 characters'),
  album: z.string({
    invalid_type_error: 'Album must be a string',
  })
    .max(255, 'Album must be at most 255 characters')
    .optional(),
  genre: z.string({
    invalid_type_error: 'Genre must be a string',
  })
    .max(100, 'Genre must be at most 100 characters')
    .optional(),
  year: z.number({
    invalid_type_error: 'Year must be a number',
  })
    .int('Year must be an integer')
    .min(MIN_YEAR, `Year must be at least ${MIN_YEAR}`)
    .max(MAX_YEAR, `Year must be at most ${MAX_YEAR}`)
    .optional(),
  duration: z.number({
    required_error: 'Duration is required',
    invalid_type_error: 'Duration must be a number',
  })
    .int('Duration must be an integer')
    .positive('Duration must be a positive number'),
  lyrics: z.string({
    invalid_type_error: 'Lyrics must be a string',
  }).nullable().optional(),
  image_url: z.string({
    invalid_type_error: 'Image URL must be a string',
  })
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be at most 500 characters')
    .nullable()
    .optional()
    .or(z.literal('')),
});

export const songSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'), 
  title: z.string({
    invalid_type_error: 'Title must be a string',
  }),
  artist: z.string({
    invalid_type_error: 'Artist must be a string',
  }),
  album: z.string({
    invalid_type_error: 'Album must be a string',
  }).nullable().optional(),
  genre: z.string({
    invalid_type_error: 'Genre must be a string',
  }).nullable().optional(),
  year: z.number({
    invalid_type_error: 'Year must be a number',
  })
    .int('Year must be an integer')
    .nullable()
    .optional(),
  duration: z.number({
    invalid_type_error: 'Duration must be a number',
  })
    .int('Duration must be an integer'),
  lyrics: z.string({
    invalid_type_error: 'Lyrics must be a string',
  }).nullable().optional(),
  image_url: z.string({
    invalid_type_error: 'Image URL must be a string',
  }).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const updateSongSchema = createSongSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const songQuerySchema = z.object({
  genre: z.string({
    invalid_type_error: 'Genre must be a string',
  }).optional(),
  artist: z.string({
    invalid_type_error: 'Artist must be a string',
  }).optional(),
  year: z.coerce.number({
    invalid_type_error: 'Year must be a number',
  })
    .int('Year must be an integer')
    .optional(),
  search: z.string({
    invalid_type_error: 'Search must be a string',
  }).optional(),
  limit: z.coerce.number({
    invalid_type_error: 'Limit must be a number',
  })
    .int('Limit must be an integer')
    .positive('Limit must be a positive number')
    .max(1000, 'Limit cannot exceed 1000')
    .default(100),
  offset: z.coerce.number({
    invalid_type_error: 'Offset must be a number',
  })
    .int('Offset must be an integer')
    .min(0, 'Offset must be at least 0')
    .default(0),
});