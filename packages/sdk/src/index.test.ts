import { describe, expect, it } from 'vitest';
import { GreenClaimClient } from './index.js';

describe('@greenclaim/sdk', () => {
  it('instantiates client with baseUrl', () => {
    const client = new GreenClaimClient({ baseUrl: 'https://api.greenclaim.lens' });
    expect(client.getBaseUrl()).toBe('https://api.greenclaim.lens');
  });
});
