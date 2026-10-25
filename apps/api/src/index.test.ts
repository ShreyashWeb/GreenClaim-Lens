import { describe, expect, it } from 'vitest';
import { getApiStatus } from './index.js';

describe('@greenclaim/api', () => {
  it('returns healthy api status', () => {
    expect(getApiStatus()).toEqual({ status: 'ok', version: 'v1' });
  });
});
