import { describe, expect, it } from 'vitest';
import { runEvaluationBaseline } from './index.js';

describe('@greenclaim/eval skeleton', () => {
  it('returns baseline evaluation results', async () => {
    const result = await runEvaluationBaseline();
    expect(result.status).toBe('ready');
    expect(result.totalCases).toBe(0);
    expect(result.macroF1).toBe(1.0);
  });
});
