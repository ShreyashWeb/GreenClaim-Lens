import { describe, expect, it } from 'vitest';
import {
  AuthenticationError,
  GreenClaimClient,
  GreenClaimError,
  RateLimitError,
  ValidationError,
} from './index.js';

describe('@greenclaim/sdk', () => {
  it('instantiates client with default and custom configs', () => {
    const defaultClient = new GreenClaimClient();
    expect(defaultClient.getBaseUrl()).toBe('https://api.greenclaimlens.org');
    expect(defaultClient.getApiKey()).toBeUndefined();

    const customClient = new GreenClaimClient({
      baseUrl: 'https://staging.greenclaimlens.org/',
      apiKey: 'test-api-key',
    });
    expect(customClient.getBaseUrl()).toBe('https://staging.greenclaimlens.org');
    expect(customClient.getApiKey()).toBe('test-api-key');
  });

  it('checks health endpoint via mock fetch', async () => {
    const mockFetch: typeof fetch = async (input, init) => {
      expect(input.toString()).toBe('https://api.greenclaimlens.org/v1/health');
      expect((init?.headers as Record<string, string>)?.Accept).toBe('application/json');

      return new Response(
        JSON.stringify({
          status: 'ok',
          version: 'v1',
          coreVersion: '0.1.0',
          timestamp: '2026-10-25T14:00:00Z',
          rulesLoaded: 8,
          uptime: 120,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };

    const client = new GreenClaimClient({ fetchFn: mockFetch });
    const health = await client.checkHealth();
    expect(health.status).toBe('ok');
    expect(health.rulesLoaded).toBe(8);
  });

  it('lists rules and fetches specific rule', async () => {
    const mockFetch: typeof fetch = async (input) => {
      const url = input.toString();
      if (url.endsWith('/v1/rules')) {
        return new Response(
          JSON.stringify({
            total: 1,
            rules: [
              {
                id: 'GCL-001',
                title: 'Generic Eco Claims',
                severity: 'medium',
                status: 'active',
                source: { document: 'CCPA 2024', clause: 'Cl 4', url: 'https://ccpa.gov.in' },
                explain: { en: 'Generic terms prohibited' },
              },
            ],
          }),
          { status: 200 },
        );
      }

      if (url.endsWith('/v1/rules/GCL-001')) {
        return new Response(
          JSON.stringify({
            id: 'GCL-001',
            title: 'Generic Eco Claims',
            severity: 'medium',
            status: 'active',
            source: { document: 'CCPA 2024', clause: 'Cl 4', url: 'https://ccpa.gov.in' },
            explain: { en: 'Generic terms prohibited' },
          }),
          { status: 200 },
        );
      }

      return new Response('Not found', { status: 404 });
    };

    const client = new GreenClaimClient({ fetchFn: mockFetch });
    const rulesList = await client.listRules();
    expect(rulesList.total).toBe(1);
    expect(rulesList.rules[0]?.id).toBe('GCL-001');

    const singleRule = await client.getRule('GCL-001');
    expect(singleRule.id).toBe('GCL-001');
  });

  it('verifies claim sending post request and receiving typed response', async () => {
    const mockFetch: typeof fetch = async (input, init) => {
      expect(input.toString()).toBe('https://api.greenclaimlens.org/v1/verify-claim');
      expect(init?.method).toBe('POST');
      expect((init?.headers as Record<string, string>)?.['x-api-key']).toBe('secret-123');

      const body = JSON.parse(init?.body as string);
      expect(body.claim).toBe('100% natural organic');

      return new Response(
        JSON.stringify({
          claim: '100% natural organic',
          claimHash: 'hash123',
          verdict: 'LIKELY_MISLEADING',
          riskScore: 78,
          explanation: 'Claim does not appear to meet regulatory standards.',
          whatWouldHelp: ['Qualify 100% attribute'],
          ruleHits: [
            {
              ruleId: 'GCL-002',
              ruleName: 'Absolute Claims',
              outcome: 'flag',
              severity: 'high',
              evidence: '100% natural',
            },
          ],
          cached: false,
          evaluatedAt: '2026-10-25T14:00:00Z',
        }),
        { status: 200 },
      );
    };

    const client = new GreenClaimClient({ apiKey: 'secret-123', fetchFn: mockFetch });
    const res = await client.verifyClaim({ claim: '100% natural organic' });
    expect(res.verdict).toBe('LIKELY_MISLEADING');
    expect(res.riskScore).toBe(78);
    expect(res.ruleHits.length).toBe(1);
  });

  it('handles rate limit 429 with RateLimitError and Retry-After header', async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Retry-After': '45' },
      });
    };

    const client = new GreenClaimClient({ fetchFn: mockFetch });
    await expect(client.verifyClaim({ claim: 'test' })).rejects.toThrow(RateLimitError);
    try {
      await client.verifyClaim({ claim: 'test' });
    } catch (err) {
      expect(err instanceof RateLimitError).toBe(true);
      expect((err as RateLimitError).retryAfterSeconds).toBe(45);
    }
  });

  it('handles 401 unauthorized with AuthenticationError', async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid API key' }), {
        status: 401,
      });
    };

    const client = new GreenClaimClient({ fetchFn: mockFetch });
    await expect(client.verifyClaim({ claim: 'test' })).rejects.toThrow(AuthenticationError);
  });

  it('handles 400 bad request with ValidationError', async () => {
    const mockFetch: typeof fetch = async () => {
      return new Response(
        JSON.stringify({ error: 'ValidationError', message: 'Claim text too short' }),
        { status: 400 },
      );
    };

    const client = new GreenClaimClient({ fetchFn: mockFetch });
    await expect(client.verifyClaim({ claim: '' })).rejects.toThrow(ValidationError);
  });

  it('handles network failure with GreenClaimError', async () => {
    const mockFetch: typeof fetch = async () => {
      throw new Error('Connection refused');
    };

    const client = new GreenClaimClient({ fetchFn: mockFetch });
    await expect(client.checkHealth()).rejects.toThrow(GreenClaimError);
  });
});
