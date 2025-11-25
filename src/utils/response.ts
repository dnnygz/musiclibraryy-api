import { Context } from 'hono';

/**
 * Standard success response format
 */
export function successResponse<T>(c: Context, data: T, statusCode: number = 200) {
  return c.json(
    {
      success: true,
      data,
    },
    statusCode as any
  );
}

/**
 * Standard error response format (handled by error handler middleware)
 */
export function errorResponse(c: Context, message: string, statusCode: number = 400) {
  return c.json(
    {
      success: false,
      error: message,
    },
    statusCode as any
  );
}

