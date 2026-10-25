import { describe, expect, it } from 'vitest';
import { LLMGateway } from './index.js';

describe('@greenclaim/llm-gateway', () => {
  it('instantiates gateway with provider list', () => {
    const gateway = new LLMGateway({ providers: ['gemini', 'groq'] });
    expect(gateway.getActiveProviders()).toEqual(['gemini', 'groq']);
  });
});
