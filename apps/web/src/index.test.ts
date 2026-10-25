import { describe, expect, it } from 'vitest';
import { getAppTitle } from './index.js';

describe('@greenclaim/web', () => {
  it('returns application title', () => {
    expect(getAppTitle()).toBe('GreenClaim Lens');
  });
});
