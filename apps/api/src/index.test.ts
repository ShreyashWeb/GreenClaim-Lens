import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { app, getApiStatus } from './index.js';
import { apiKeyAuth } from './middleware/auth.js';
import { RateLimiter } from './middleware/rate-limit.js';

describe('@greenclaim/api', () => {
  it('returns healthy api status via helper', () => {
    expect(getApiStatus()).toEqual({ status: 'ok', version: 'v1' });
  });

  describe('Endpoints', () => {
    it('GET /v1/health returns operational metrics', async () => {
      const res = await app.request('/v1/health');
      expect(res.status).toBe(200);

      const data = (await res.json()) as Record<string, unknown>;
      expect(data.status).toBe('ok');
      expect(data.version).toBe('v1');
      expect(data.rulesLoaded).toBeGreaterThan(0);
      expect(typeof data.uptime).toBe('number');
    });

    it('GET /v1/rules returns all codified rules', async () => {
      const res = await app.request('/v1/rules');
      expect(res.status).toBe(200);

      const data = (await res.json()) as { total: number; rules: Array<{ id: string }> };
      expect(data.total).toBe(8);
      expect(data.rules.some((r) => r.id === 'GCL-001')).toBe(true);
      expect(data.rules.some((r) => r.id === 'GCL-008')).toBe(true);
    });

    it('GET /v1/rules/:id returns specific rule or 404', async () => {
      const resOk = await app.request('/v1/rules/GCL-001');
      expect(resOk.status).toBe(200);
      const rule = (await resOk.json()) as { id: string; name: string };
      expect(rule.id).toBe('GCL-001');

      const res404 = await app.request('/v1/rules/GCL-999');
      expect(res404.status).toBe(404);
    });

    it('GET /v1/openapi.json returns valid OpenAPI 3.1 specification', async () => {
      const res = await app.request('/v1/openapi.json');
      expect(res.status).toBe(200);

      const spec = (await res.json()) as { openapi: string; paths: Record<string, unknown> };
      expect(spec.openapi).toBe('3.1.0');
      expect(spec.paths['/v1/verify-claim']).toBeDefined();
      expect(spec.paths['/v1/health']).toBeDefined();
    });

    it('GET /docs renders interactive HTML documentation', async () => {
      const res = await app.request('/docs');
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('GreenClaim Lens — API Documentation');
      expect(html).toContain('@scalar/api-reference');
    });

    it('POST /v1/verify-claim evaluates misleading claim deterministically', async () => {
      const res = await app.request('/v1/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: '100% natural organic ingredients with zero carbon',
        }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();

      const data = (await res.json()) as {
        verdict: string;
        riskScore: number;
        explanation: string;
        whatWouldHelp: string[];
        cached: boolean;
      };

      expect(data.verdict).toBe('LIKELY_MISLEADING');
      expect(data.riskScore).toBeGreaterThanOrEqual(70);
      expect(data.explanation).toContain('does not appear to meet regulatory standards');
      expect(data.whatWouldHelp.length).toBeGreaterThan(0);
      expect(data.cached).toBe(false);
    });

    it('POST /v1/verify-claim returns cached result for identical query', async () => {
      const claimText = 'Completely chemical-free formula';
      const res1 = await app.request('/v1/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimText }),
      });
      const data1 = (await res1.json()) as { cached: boolean };
      expect(data1.cached).toBe(false);

      const res2 = await app.request('/v1/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimText }),
      });
      const data2 = (await res2.json()) as { cached: boolean };
      expect(data2.cached).toBe(true);
    });

    it('POST /v1/verify-claim validates payload schema', async () => {
      const res = await app.request('/v1/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: '' }), // Too short
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as { error: string };
      expect(data.error).toBe('ValidationError');
    });

    it('returns 404 for unknown endpoints', async () => {
      const res = await app.request('/v1/unknown');
      expect(res.status).toBe(404);
    });
  });

  describe('Middleware & Protection', () => {
    it('rate limiter throttles requests exceeding limit', async () => {
      const testLimiter = new RateLimiter({ windowMs: 1000, maxRequests: 2 });
      const testApp = new Hono();
      testApp.use('*', testLimiter.middleware());
      testApp.get('/test', (c) => c.text('ok'));

      const r1 = await testApp.request('/test');
      expect(r1.status).toBe(200);

      const r2 = await testApp.request('/test');
      expect(r2.status).toBe(200);

      const r3 = await testApp.request('/test');
      expect(r3.status).toBe(429);
      const data = (await r3.json()) as { error: string };
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('auth middleware validates configured API keys', async () => {
      const testApp = new Hono();
      testApp.use('*', apiKeyAuth({ required: true, validKeys: ['valid-secret-key'] }));
      testApp.get('/protected', (c) => c.json({ secure: true }));

      const noKey = await testApp.request('/protected');
      expect(noKey.status).toBe(401);

      const badKey = await testApp.request('/protected', {
        headers: { 'x-api-key': 'invalid-key' },
      });
      expect(badKey.status).toBe(403);

      const goodKey = await testApp.request('/protected', {
        headers: { 'x-api-key': 'valid-secret-key' },
      });
      expect(goodKey.status).toBe(200);
    });
  });
});
