/**
 * GreenClaim Lens - API Key Authentication Middleware
 */

import type { Context, Next } from 'hono';

export interface AuthOptions {
  required?: boolean | undefined;
  validKeys?: string[] | undefined;
}

export function apiKeyAuth(options: AuthOptions = {}) {
  return async (c: Context, next: Next) => {
    const rawKey =
      c.req.header('x-api-key') ?? c.req.header('authorization')?.replace(/^Bearer\s+/i, '');
    const required = options.required ?? false;

    // Get configured valid keys from options or environment variable
    const envKeys = (c.env?.API_KEYS as string | undefined)?.split(',').map((k) => k.trim()) ?? [];
    const allowedKeys = new Set([...(options.validKeys ?? []), ...envKeys]);

    if (!rawKey) {
      if (required) {
        return c.json(
          {
            error: 'Unauthorized',
            message: 'An x-api-key header or Bearer token is required to access this endpoint.',
          },
          401,
        );
      }
      return next();
    }

    // If allowed keys are configured, validate
    if (allowedKeys.size > 0 && !allowedKeys.has(rawKey)) {
      return c.json(
        {
          error: 'Forbidden',
          message: 'The provided API key is invalid or revoked.',
        },
        403,
      );
    }

    c.set('apiKey', rawKey);
    c.set('authenticated', true);
    await next();
  };
}
