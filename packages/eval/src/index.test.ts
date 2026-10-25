import { DEFAULT_RULES } from '@greenclaim/core';
import { describe, expect, it } from 'vitest';
import { evaluateDataset } from './index.js';

describe('@greenclaim/eval baseline benchmark', () => {
  it('runs evaluation on baseline sample records', () => {
    const records = [
      {
        id: 'gc-001',
        text: '100% eco-friendly packaging',
        expected_verdict: 'VAGUE' as const,
      },
      {
        id: 'gc-002',
        text: 'Zero emission vehicle in city',
        expected_verdict: 'LIKELY_MISLEADING' as const,
      },
    ];

    const report = evaluateDataset(records, DEFAULT_RULES);
    expect(report.totalCases).toBe(2);
    expect(report.falseAccusationRate).toBe(0);
    expect(report.citationValidity).toBe(1.0);
  });
});
