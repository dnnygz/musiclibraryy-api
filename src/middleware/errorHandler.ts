import { Context } from 'hono';
import { AppError } from '../utils/errors.js';

export async function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.statusCode
    );
  }

  // Unknown error
  return c.json(
    {
      success: false,
      error: 'Internal server error',
    },
    500
  );
}

