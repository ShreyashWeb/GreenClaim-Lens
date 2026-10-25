import { describe, expect, it } from 'vitest';
import { CORE_VERSION, VERDICTS, isVerdict } from './index.js';

describe('@greenclaim/core foundations', () => {
  it('exports valid core version string', () => {
    expect(CORE_VERSION).toBe('0.1.0');
  });

  it('defines the four official verdict states', () => {
    expect(VERDICTS).toEqual(['CREDIBLE', 'VAGUE', 'LIKELY_MISLEADING', 'INSUFFICIENT_EVIDENCE']);
  });

  it('validates verdict values using isVerdict type guard', () => {
    expect(isVerdict('CREDIBLE')).toBe(true);
    expect(isVerdict('VAGUE')).toBe(true);
    expect(isVerdict('LIKELY_MISLEADING')).toBe(true);
    expect(isVerdict('INSUFFICIENT_EVIDENCE')).toBe(true);
    expect(isVerdict('INVALID')).toBe(false);
    expect(isVerdict(null)).toBe(false);
  });
});
