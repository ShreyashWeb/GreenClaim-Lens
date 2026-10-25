import { DEFAULT_RULES } from '@greenclaim/core';
import { describe, expect, it } from 'vitest';
import { calculateMetrics, evaluateDataset } from './index.js';

describe('Evaluation Engine in @greenclaim/eval', () => {
  const miniDataset = [
    {
      id: 'test-1',
      text: '100% eco-friendly packaging',
      lang: 'en',
      category: 'packaging',
      expected_verdict: 'VAGUE' as const,
      expected_rules: ['GCL-001'],
      expected_citations: [],
      difficulty: 'easy',
    },
    {
      id: 'test-2',
      text: '50% greener than before',
      lang: 'en',
      category: 'packaging',
      expected_verdict: 'LIKELY_MISLEADING' as const,
      expected_rules: ['GCL-003'],
      expected_citations: [],
      difficulty: 'easy',
    },
    {
      id: 'test-3',
      text: 'Ceramic mug blue glazed',
      lang: 'en',
      category: 'kitchen',
      expected_verdict: 'INSUFFICIENT_EVIDENCE' as const,
      expected_rules: [],
      expected_citations: [],
      difficulty: 'easy',
    },
  ];

  it('evaluates mini dataset and calculates metrics', () => {
    const report = evaluateDataset(miniDataset, DEFAULT_RULES);
    expect(report.totalCases).toBe(3);
    expect(report.macroF1).toBeGreaterThan(0.5);
    expect(report.falseAccusationRate).toBe(0);
    expect(report.citationValidity).toBe(1.0);
  });

  it('correctly flags false accusations when a safe claim is marked misleading', () => {
    const predictions = [
      { expected: 'VAGUE' as const, actual: 'LIKELY_MISLEADING' as const },
      { expected: 'CREDIBLE' as const, actual: 'CREDIBLE' as const },
    ];
    const metrics = calculateMetrics(predictions);
    expect(metrics.falseAccusationRate).toBe(0.5); // 1 out of 2 non-misleading marked misleading
  });
});
