import { describe, expect, it } from 'vitest';
import { DEFAULT_EVAL_GATES, type EvaluationReport, checkEvalGates } from './index.js';

describe('@greenclaim/eval - Quality & Safety Gates', () => {
  const baseReport: EvaluationReport = {
    status: 'completed',
    totalCases: 52,
    macroF1: 0.97,
    accuracy: 0.98,
    falseAccusationRate: 0.0,
    citationValidity: 1.0,
    ruleOnlyResolutionRate: 0.88,
    perClass: {} as EvaluationReport['perClass'],
    confusionMatrix: {} as EvaluationReport['confusionMatrix'],
    items: [],
  };

  it('passes when metrics satisfy default hard gates', () => {
    const result = checkEvalGates(baseReport);
    expect(result.passed).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('fails when false-accusation rate exceeds ceiling', () => {
    const failingReport: EvaluationReport = {
      ...baseReport,
      falseAccusationRate: 0.02, // 2%
    };

    const result = checkEvalGates(failingReport, {
      ...DEFAULT_EVAL_GATES,
      maxFalseAccusationRate: 0.0, // Strict 0%
    });

    expect(result.passed).toBe(false);
    expect(result.failures[0]).toContain('False-accusation rate 2.00% exceeds ceiling');
  });

  it('fails when citation validity drops below 100%', () => {
    const failingReport: EvaluationReport = {
      ...baseReport,
      citationValidity: 0.96,
    };

    const result = checkEvalGates(failingReport);
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toContain('Citation validity 96.0% is below required 100.0%');
  });

  it('fails when accuracy drops below 95%', () => {
    const failingReport: EvaluationReport = {
      ...baseReport,
      accuracy: 0.92,
    };

    const result = checkEvalGates(failingReport);
    expect(result.passed).toBe(false);
    expect(result.failures[0]).toContain('Accuracy 92.0% is below threshold of 95.0%');
  });
});
