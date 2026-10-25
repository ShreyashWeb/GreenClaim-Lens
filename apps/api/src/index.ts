/**
 * GreenClaim Lens - Edge API Server
 * Built with Hono on Cloudflare Workers / Edge runtime.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiKeyAuth } from './middleware/auth.js';
import { RateLimiter } from './middleware/rate-limit.js';
import { OPENAPI_SPEC, renderApiDocsHtml } from './openapi.js';
import { healthRouter } from './routes/health.js';
import { rulesRouter } from './routes/rules.js';
import { verifyRouter } from './routes/verify.js';
import type { ApiBindings } from './types.js';

export * from './types.js';
export * from './openapi.js';
export * from './middleware/rate-limit.js';
export * from './middleware/auth.js';
export * from './middleware/turnstile.js';

export interface ApiStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
}

export function getApiStatus(): ApiStatus {
  return {
    status: 'ok',
    version: 'v1',
  };
}

export function createApp(_bindings?: ApiBindings) {
  const app = new Hono<{ Bindings: ApiBindings }>();

  // Global CORS
  app.use(
    '*',
    cors({
      origin: '*',
      allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    }),
  );

  // Rate Limiting (60 req/min for public, 300 req/min for API keys)
  const rateLimiter = new RateLimiter({ windowMs: 60_000, maxRequests: 60 });
  app.use('*', rateLimiter.middleware());

  // API Key Authentication (permissive by default; enforces if configured)
  app.use('*', apiKeyAuth());

  // OpenAPI Specification & Interactive Documentation
  app.get('/v1/openapi.json', (c) => c.json(OPENAPI_SPEC));
  app.get('/docs', (c) => c.html(renderApiDocsHtml()));

  // Root redirect to interactive documentation
  app.get('/', (c) => c.redirect('/docs'));

  // API Routes
  app.route('/v1/health', healthRouter);
  app.route('/v1/rules', rulesRouter);
  app.route('/v1/verify-claim', verifyRouter);

  // 404 Handler
  app.notFound((c) => {
    return c.json(
      {
        error: 'NotFound',
        message: `Endpoint ${c.req.method} ${c.req.path} not found. Refer to /docs for available endpoints.`,
      },
      404,
    );
  });

  return app;
}

export const app = createApp();
export default app;
