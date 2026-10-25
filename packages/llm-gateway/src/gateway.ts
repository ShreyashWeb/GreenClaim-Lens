import { createHash } from 'node:crypto';
import type {
  GatewayResult,
  GenerateStructuredParams,
  LLMJudgment,
  LLMProviderAdapter,
} from './types.js';

/**
 * Server-side validation of LLM citations.
 * Hard rule: Any citation not present in the retrieved chunk IDs forces abstention ('unsure').
 * A 'flag' outcome must cite at least one retrieved chunk.
 */
export function validateAndEnforceCitations(
  judgment: LLMJudgment,
  validChunkIds: Set<string>,
): LLMJudgment {
  // Validate every citation is in the retrieved set
  const allCitationsValid = judgment.citations.every((c) => validChunkIds.has(c));

  if (!allCitationsValid) {
    return {
      outcome: 'unsure',
      reasoning:
        'Invalid citation: LLM cited sources not present in retrieved context; abstaining.',
      citations: [],
      confidence: 0.0,
    };
  }

  // A flag verdict requires at least one citation
  if (judgment.outcome === 'flag' && judgment.citations.length === 0) {
    return {
      outcome: 'unsure',
      reasoning: 'Missing required citation for flagged verdict; abstaining.',
      citations: [],
      confidence: 0.0,
    };
  }

  return judgment;
}

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export interface LLMGatewayOptions {
  providers: Array<LLMProviderAdapter | string>;
  maxFailuresBeforeTrip?: number | undefined;
  cooldownWindowMs?: number | undefined;
}

export class LLMGateway {
  private providers: LLMProviderAdapter[];
  private circuits = new Map<string, CircuitState>();
  private cache = new Map<string, LLMJudgment>();
  private maxFailures: number;
  private cooldownWindowMs: number;

  constructor(options: LLMGatewayOptions) {
    this.providers = options.providers.map((p) =>
      typeof p === 'string'
        ? {
            id: p,
            model: p,
            generateStructured: async () => ({
              outcome: 'unsure' as const,
              reasoning: 'Stub',
              citations: [],
              confidence: 0,
            }),
          }
        : p,
    );
    this.maxFailures = options.maxFailuresBeforeTrip ?? 3;
    this.cooldownWindowMs = options.cooldownWindowMs ?? 60_000;
  }

  getActiveProviders(): string[] {
    return this.providers.map((p) => p.id);
  }

  isCircuitOpen(providerId: string): boolean {
    const state = this.circuits.get(providerId);
    if (!state || !state.isOpen) return false;

    // Check if cooldown window has expired
    if (Date.now() - state.lastFailureTime > this.cooldownWindowMs) {
      state.isOpen = false;
      state.failures = 0;
      return false;
    }

    return true;
  }

  private recordSuccess(providerId: string) {
    const state = this.circuits.get(providerId);
    if (state) {
      state.failures = 0;
      state.isOpen = false;
    }
  }

  private recordFailure(providerId: string) {
    let state = this.circuits.get(providerId);
    if (!state) {
      state = { failures: 0, lastFailureTime: 0, isOpen: false };
      this.circuits.set(providerId, state);
    }

    state.failures++;
    state.lastFailureTime = Date.now();
    if (state.failures >= this.maxFailures) {
      state.isOpen = true;
    }
  }

  private computeCacheKey(params: GenerateStructuredParams): string {
    const payload = JSON.stringify({
      claim: params.claimText.trim().toLowerCase(),
      ruleId: params.ruleId,
      chunkIds: params.retrievedChunks.map((c) => c.id).sort(),
    });
    return createHash('sha256').update(payload).digest('hex');
  }

  async generateJudgment(params: GenerateStructuredParams): Promise<GatewayResult> {
    const validChunkIds = new Set(params.retrievedChunks.map((c) => c.id));
    const cacheKey = this.computeCacheKey(params);

    // Check prompt hash cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        judgment: validateAndEnforceCitations(cached, validChunkIds),
        providerId: 'cache',
        model: 'cache',
        fromCache: true,
      };
    }

    let lastError: Error | null = null;

    // Iterate through configured providers in priority order
    for (const provider of this.providers) {
      if (this.isCircuitOpen(provider.id)) {
        continue;
      }

      try {
        const rawJudgment = await provider.generateStructured(params);
        const enforcedJudgment = validateAndEnforceCitations(rawJudgment, validChunkIds);

        this.recordSuccess(provider.id);
        this.cache.set(cacheKey, enforcedJudgment);

        return {
          judgment: enforcedJudgment,
          providerId: provider.id,
          model: provider.model,
          fromCache: false,
        };
      } catch (err) {
        this.recordFailure(provider.id);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // All providers failed or were tripped: return graceful abstention
    return {
      judgment: {
        outcome: 'unsure',
        reasoning: `All configured AI providers failed or were unreachable (${lastError?.message ?? 'no healthy provider'}). Gracefully abstaining.`,
        citations: [],
        confidence: 0.0,
      },
      providerId: 'none',
      model: 'none',
      fromCache: false,
    };
  }
}
