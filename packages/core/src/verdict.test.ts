import { describe, expect, it } from 'vitest';
import type { RuleHit } from './schemas.js';
import { aggregateVerdict, calculateRiskScore } from './verdict.js';

describe('Verdict Aggregation & Risk Scoring', () => {
  it('returns LIKELY_MISLEADING when any high severity rule is flagged', () => {
    const hits: RuleHit[] = [
      {
        rule_id: 'GCL-003',
        outcome: 'flag',
        severity: 'high',
        evidence: 'greener than before',
        reason: 'Comparative claim missing baseline',
      },
      {
        rule_id: 'GCL-001',
        outcome: 'flag',
        severity: 'medium',
        evidence: 'eco-friendly',
      },
    ];

    const result = aggregateVerdict(hits);
    expect(result.verdict).toBe('LIKELY_MISLEADING');
    expect(result.riskScore).toBeGreaterThanOrEqual(75);
    expect(result.explanation).toContain('does not appear to meet');
    expect(result.explanation).not.toContain('lying');
  });

  it('returns VAGUE when only medium severity rules are flagged', () => {
    const hits: RuleHit[] = [
      {
        rule_id: 'GCL-001',
        outcome: 'flag',
        severity: 'medium',
        evidence: 'natural',
      },
    ];

    const result = aggregateVerdict(hits);
    expect(result.verdict).toBe('VAGUE');
    expect(result.riskScore).toBeGreaterThanOrEqual(40);
    expect(result.riskScore).toBeLessThan(75);
    expect(result.whatWouldHelp.length).toBeGreaterThan(0);
  });

  it('returns CREDIBLE when all applicable rules pass', () => {
    const hits: RuleHit[] = [
      {
        rule_id: 'GCL-001',
        outcome: 'pass',
        severity: 'medium',
        evidence: 'eco-friendly',
      },
    ];

    const result = aggregateVerdict(hits);
    expect(result.verdict).toBe('CREDIBLE');
    expect(result.riskScore).toBeLessThanOrEqual(25);
  });

  it('returns INSUFFICIENT_EVIDENCE if no rules apply or hits are empty (cite or abstain rule)', () => {
    const hits: RuleHit[] = [
      {
        rule_id: 'GCL-001',
        outcome: 'n/a',
        severity: 'medium',
      },
    ];

    const result = aggregateVerdict(hits);
    expect(result.verdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('returns INSUFFICIENT_EVIDENCE if any hit is unsure', () => {
    const hits: RuleHit[] = [
      {
        rule_id: 'GCL-002',
        outcome: 'unsure',
        severity: 'medium',
      },
    ];

    const result = aggregateVerdict(hits);
    expect(result.verdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('calculates bounded risk scores between 0 and 100', () => {
    expect(calculateRiskScore('CREDIBLE', 0, 1)).toBeGreaterThanOrEqual(0);
    expect(calculateRiskScore('CREDIBLE', 0, 1)).toBeLessThanOrEqual(30);
    expect(calculateRiskScore('VAGUE', 1, 0)).toBeGreaterThanOrEqual(40);
    expect(calculateRiskScore('LIKELY_MISLEADING', 2, 0)).toBeGreaterThanOrEqual(75);
    expect(calculateRiskScore('LIKELY_MISLEADING', 5, 0)).toBeLessThanOrEqual(100);
  });
});
