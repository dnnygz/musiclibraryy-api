import { Context, Next } from 'hono';
import { validator } from 'hono/validator';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { isValidUUID } from '../utils/uuid.js';

/**
 * Validator middleware for request body using Hono's validator
 */
export function validateBody(schema: ZodSchema) {
  return validator('json', async (value, c) => {
    try {
      return schema.parse(value);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => {
          const path = e.path.length > 0 ? e.path.join('.') : 'root';
          return `${path}: ${e.message}`;
        }).join(', ');
        throw new ValidationError(messages);
      }
      throw new ValidationError(error.message || 'Invalid request body');
    }
  });
}

/**
 * Validator middleware for query parameters using Hono's validator
 */
export function validateQuery(schema: ZodSchema) {
  return validator('query', async (value, c) => {
    try {
      return schema.parse(value);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => {
          const path = e.path.length > 0 ? e.path.join('.') : 'root';
          return `${path}: ${e.message}`;
        }).join(', ');
        throw new ValidationError(messages);
      }
      throw new ValidationError(error.message || 'Invalid query parameters');
    }
  });
}

/**
 * Middleware to validate UUID parameters
 */
export function validateUUID(paramName: string = 'id') {
  return async (c: Context, next: Next) => {
    const id = c.req.param(paramName);
    if (!id || !isValidUUID(id)) {
      throw new NotFoundError('Resource');
    }
    await next();
  };
}

