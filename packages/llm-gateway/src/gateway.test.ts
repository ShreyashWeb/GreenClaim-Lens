import { describe, expect, it } from 'vitest';
import {
  type GenerateStructuredParams,
  LLMGateway,
  MockProviderAdapter,
  validateAndEnforceCitations,
} from './index.js';

describe('LLMGateway & Provider Adapters', () => {
  const sampleParams: GenerateStructuredParams = {
    claimText: '100% eco-friendly packaging',
    ruleId: 'GCL-001',
    retrievedChunks: [
      {
        id: 'ch_ccpa_2024_clause_4_1',
        document: 'CCPA_2024',
        clause: 'Clause 4(1)',
        text: 'Broad terms require qualifiers.',
      },
    ],
  };

  it('generates judgment through primary mock provider', async () => {
    const mockPrimary = new MockProviderAdapter({
      id: 'mock-a',
      model: 'mock-v1',
      response: {
        outcome: 'flag',
        reasoning: 'Generic term lacks qualifiers',
        citations: ['ch_ccpa_2024_clause_4_1'],
        confidence: 0.95,
      },
    });

    const gateway = new LLMGateway({ providers: [mockPrimary] });
    const result = await gateway.generateJudgment(sampleParams);

    expect(result.judgment.outcome).toBe('flag');
    expect(result.providerId).toBe('mock-a');
    expect(result.fromCache).toBe(false);
  });

  it('fails over to secondary provider when primary fails', async () => {
    const failingPrimary = new MockProviderAdapter({
      id: 'failing-primary',
      model: 'fail-model',
      shouldFail: true,
    });
    const secondary = new MockProviderAdapter({
      id: 'healthy-secondary',
      model: 'sec-model',
      response: {
        outcome: 'flag',
        reasoning: 'Resolved by secondary',
        citations: ['ch_ccpa_2024_clause_4_1'],
        confidence: 0.9,
      },
    });

    const gateway = new LLMGateway({ providers: [failingPrimary, secondary] });
    const result = await gateway.generateJudgment(sampleParams);

    expect(result.judgment.outcome).toBe('flag');
    expect(result.providerId).toBe('healthy-secondary');
  });

  it('caches responses by SHA-256 prompt hash', async () => {
    let callCount = 0;
    const countingAdapter = new MockProviderAdapter({
      id: 'counting',
      model: 'count-model',
      onCall: () => {
        callCount++;
      },
      response: {
        outcome: 'pass',
        reasoning: 'Valid',
        citations: ['ch_ccpa_2024_clause_4_1'],
        confidence: 1.0,
      },
    });

    const gateway = new LLMGateway({ providers: [countingAdapter] });
    const res1 = await gateway.generateJudgment(sampleParams);
    const res2 = await gateway.generateJudgment(sampleParams);

    expect(res1.fromCache).toBe(false);
    expect(res2.fromCache).toBe(true);
    expect(callCount).toBe(1);
  });

  it('trips circuit breaker after max consecutive failures', async () => {
    const unreliable = new MockProviderAdapter({
      id: 'unreliable',
      model: 'unreliable-model',
      shouldFail: true,
    });
    const fallback = new MockProviderAdapter({
      id: 'fallback',
      model: 'fallback-model',
      response: {
        outcome: 'unsure',
        reasoning: 'Fallback',
        citations: [],
        confidence: 0.5,
      },
    });

    const gateway = new LLMGateway({
      providers: [unreliable, fallback],
      maxFailuresBeforeTrip: 2,
    });

    await gateway.generateJudgment({ ...sampleParams, claimText: 'unreliable call 1' });
    await gateway.generateJudgment({ ...sampleParams, claimText: 'unreliable call 2' });
    // Unreliable should now be tripped
    expect(gateway.isCircuitOpen('unreliable')).toBe(true);
  });

  it('degrades gracefully to unsure without throwing when all providers fail', async () => {
    const broken1 = new MockProviderAdapter({
      id: 'broken-1',
      model: 'broken-model-1',
      shouldFail: true,
    });
    const broken2 = new MockProviderAdapter({
      id: 'broken-2',
      model: 'broken-model-2',
      shouldFail: true,
    });

    const gateway = new LLMGateway({
      providers: [broken1, broken2],
    });

    const result = await gateway.generateJudgment({
      ...sampleParams,
      claimText: 'total failure test claim',
    });

    expect(result.providerId).toBe('none');
    expect(result.model).toBe('none');
    expect(result.judgment.outcome).toBe('unsure');
    expect(result.judgment.confidence).toBe(0.0);
    expect(result.judgment.reasoning).toContain('All configured AI providers failed');
    expect(result.judgment.citations).toEqual([]);
  });

  describe('Server-Side Citation Validation & Abstention', () => {
    it('forces outcome to unsure if citations contain hallucinated chunk IDs', () => {
      const judgment = {
        outcome: 'flag' as const,
        reasoning: 'Claim fails',
        citations: ['ch_hallucinated_clause_999'],
        confidence: 0.9,
      };
      const validChunkIds = new Set(['ch_ccpa_2024_clause_4_1']);

      const validated = validateAndEnforceCitations(judgment, validChunkIds);
      expect(validated.outcome).toBe('unsure');
      expect(validated.reasoning).toContain('Invalid citation');
    });

    it('forces outcome to unsure if flag has zero citations', () => {
      const judgment = {
        outcome: 'flag' as const,
        reasoning: 'Claim fails without citation',
        citations: [],
        confidence: 0.9,
      };
      const validChunkIds = new Set(['ch_ccpa_2024_clause_4_1']);

      const validated = validateAndEnforceCitations(judgment, validChunkIds);
      expect(validated.outcome).toBe('unsure');
    });

    it('retains valid citations matching retrieved chunks', () => {
      const judgment = {
        outcome: 'flag' as const,
        reasoning: 'Claim fails',
        citations: ['ch_ccpa_2024_clause_4_1'],
        confidence: 0.95,
      };
      const validChunkIds = new Set(['ch_ccpa_2024_clause_4_1']);

      const validated = validateAndEnforceCitations(judgment, validChunkIds);
      expect(validated.outcome).toBe('flag');
      expect(validated.citations).toEqual(['ch_ccpa_2024_clause_4_1']);
    });
  });
});
