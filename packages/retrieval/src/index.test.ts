import { describe, expect, it } from 'vitest';
import { type Chunk, formatCitation } from './index.js';

describe('@greenclaim/retrieval', () => {
  it('formats citations according to chunk metadata', () => {
    const chunk: Chunk = {
      id: 'ch_001',
      document: 'CCPA_2024',
      clause: 'Clause 4(1)',
      url: 'https://example.gov.in/guidelines',
      text: 'Sample official text chunk',
    };
    expect(formatCitation(chunk)).toBe('CCPA_2024#Clause 4(1)');
  });
});
