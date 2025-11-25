import { z } from 'zod';

const MAX_TAGS = 50;
const MAX_SONG_ORDERS = 1000;

export const createPlaylistSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  })
    .min(1, 'Name cannot be empty')
    .max(255, 'Name must be at most 255 characters'),
  description: z.string({
    invalid_type_error: 'Description must be a string',
  }).optional(),
  tags: z.array(z.string({
    invalid_type_error: 'Each tag must be a string',
  }), {
    invalid_type_error: 'Tags must be an array',
  })
    .max(MAX_TAGS, `Tags array cannot exceed ${MAX_TAGS} items`)
    .default([]),
});

export const updatePlaylistSchema = z.object({
  name: z.string({
    invalid_type_error: 'Name must be a string',
  })
    .min(1, 'Name cannot be empty')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  description: z.string({
    invalid_type_error: 'Description must be a string',
  }).optional(),
  tags: z.array(z.string({
    invalid_type_error: 'Each tag must be a string',
  }), {
    invalid_type_error: 'Tags must be an array',
  })
    .max(MAX_TAGS, `Tags array cannot exceed ${MAX_TAGS} items`)
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const playlistQuerySchema = z.object({
  include_songs: z.coerce.boolean({
    invalid_type_error: 'include_songs must be a boolean',
  }).default(false),
});

export const addSongToPlaylistSchema = z.object({
  song_id: z.string({
    required_error: 'song_id is required',
    invalid_type_error: 'song_id must be a string',
  })
    .uuid('song_id must be a valid UUID'),
  position: z.number({
    invalid_type_error: 'Position must be a number',
  })
    .int('Position must be an integer')
    .min(0, 'Position must be at least 0')
    .optional(),
});

export const reorderPlaylistSongsSchema = z.object({
  song_orders: z.array(z.object({
    song_id: z.string({
      required_error: 'song_id is required',
      invalid_type_error: 'song_id must be a string',
    })
      .uuid('song_id must be a valid UUID'),
    position: z.number({
      required_error: 'position is required',
      invalid_type_error: 'position must be a number',
    })
      .int('Position must be an integer')
      .min(0, 'Position must be at least 0'),
  }), {
    required_error: 'song_orders is required',
    invalid_type_error: 'song_orders must be an array',
  })
    .min(1, 'song_orders must contain at least one item')
    .max(MAX_SONG_ORDERS, `song_orders cannot exceed ${MAX_SONG_ORDERS} items`),
});

