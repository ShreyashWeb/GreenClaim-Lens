/**
 * GreenClaim Lens - Public TypeScript/JavaScript Client SDK
 * Provides typed access to GreenClaim Lens Edge API.
 */

import type { Verdict } from '@greenclaim/core';

export class GreenClaimError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'GreenClaimError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class RateLimitError extends GreenClaimError {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds = 60) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class AuthenticationError extends GreenClaimError {
  constructor(message: string, statusCode = 401) {
    super(message, statusCode);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends GreenClaimError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export interface ClientConfig {
  baseUrl?: string | undefined;
  apiKey?: string | undefined;
  timeoutMs?: number | undefined;
  fetchFn?: typeof fetch | undefined;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  coreVersion: string;
  timestamp: string;
  rulesLoaded: number;
  uptime: number;
}

export interface RuleSource {
  document: string;
  clause: string;
  url: string;
}

export interface RuleItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  status: string;
  source: RuleSource;
  explain: Record<string, string>;
  remediation?: Record<string, string> | undefined;
}

export interface RulesResponse {
  total: number;
  rules: RuleItem[];
}

export interface VerifyClaimRequest {
  claim: string;
  lang?: 'en' | 'hi' | undefined;
  productCategory?: string | undefined;
  brandName?: string | undefined;
  turnstileToken?: string | undefined;
}

export interface RuleHitItem {
  ruleId: string;
  ruleName: string;
  outcome: 'flag' | 'pass' | 'n/a';
  severity: 'high' | 'medium' | 'low';
  evidence?: string | undefined;
}

export interface VerifyClaimResponse {
  claim: string;
  claimHash: string;
  verdict: Verdict;
  riskScore: number;
  explanation: string;
  whatWouldHelp: string[];
  ruleHits: RuleHitItem[];
  cached: boolean;
  evaluatedAt: string;
}

export class GreenClaimClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string | undefined;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? 'https://api.greenclaimlens.org').replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.fetchImpl = config.fetchFn ?? globalThis.fetch;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorData: { error?: string; message?: string; details?: unknown } = {};
        try {
          errorData = (await response.json()) as typeof errorData;
        } catch {
          // Non-JSON error payload
        }

        const msg =
          errorData.message ?? errorData.error ?? `Request failed with status ${response.status}`;

        if (response.status === 429) {
          const retryHeader = response.headers.get('Retry-After');
          const retrySeconds = retryHeader ? Number.parseInt(retryHeader, 10) : 60;
          throw new RateLimitError(msg, retrySeconds);
        }

        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(msg, response.status);
        }

        if (response.status === 400) {
          throw new ValidationError(msg, errorData.details);
        }

        throw new GreenClaimError(msg, response.status, errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof GreenClaimError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new GreenClaimError(`Request timed out after ${this.timeoutMs}ms`, 408);
      }
      throw new GreenClaimError(
        `Network error: ${err instanceof Error ? err.message : String(err)}`,
        0,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Checks health and operational metrics of GreenClaim Edge API.
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/v1/health');
  }

  /**
   * Retrieves all active codified regulatory rules.
   */
  async listRules(): Promise<RulesResponse> {
    return this.request<RulesResponse>('/v1/rules');
  }

  /**
   * Retrieves a single rule by ID (e.g. 'GCL-001').
   */
  async getRule(ruleId: string): Promise<RuleItem> {
    return this.request<RuleItem>(`/v1/rules/${encodeURIComponent(ruleId)}`);
  }

  /**
   * Verifies an environmental marketing claim against CCPA 2024 and ASCI guidelines.
   */
  async verifyClaim(params: VerifyClaimRequest): Promise<VerifyClaimResponse> {
    return this.request<VerifyClaimResponse>('/v1/verify-claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  }
}
