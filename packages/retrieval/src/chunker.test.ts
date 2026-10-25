import { describe, expect, it } from 'vitest';
import {
  type DocumentSection,
  chunkDocument,
  createStableChunkId,
  formatCitation,
} from './chunker.js';

describe('Guidelines Chunker in @greenclaim/retrieval', () => {
  it('creates deterministic stable chunk IDs', () => {
    const id1 = createStableChunkId('CCPA_2024', 'Clause 4(1)');
    const id2 = createStableChunkId('CCPA_2024', 'Clause 4(1)');
    expect(id1).toBe(id2);
    expect(id1).toBe('ch_ccpa_2024_clause_4_1');
  });

  it('formats citations correctly', () => {
    const chunk = {
      id: 'ch_ccpa_2024_clause_4_1',
      document: 'CCPA_2024',
      clause: 'Clause 4(1)',
      url: '<TODO: verify against official text>',
      version: '1.0',
      title: 'General Broad Terms',
      text: 'No person shall make generic environmental claims...',
      tokens: ['generic', 'environmental', 'claims'],
    };
    expect(formatCitation(chunk)).toBe('CCPA_2024#Clause 4(1)');
  });

  it('chunks document sections into structured chunks with tokenized keywords', () => {
    const sections: DocumentSection[] = [
      {
        clause: 'Clause 4(1)',
        title: 'Broad Terms',
        text: 'Generic environmental terms such as eco-friendly must be substantiated with reliable evidence and appropriate qualification.',
      },
      {
        clause: 'Clause 5(2)',
        title: 'Comparative Claims',
        text: 'Comparative claims shall clearly explain the basis of comparison and reference verifiable baselines.',
      },
    ];

    const chunks = chunkDocument({
      document: 'CCPA_2024',
      url: '<TODO: verify against official text>',
      version: '2024.1',
      sections,
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.id).toBe('ch_ccpa_2024_clause_4_1');
    expect(chunks[0]?.tokens).toContain('eco-friendly');
    expect(chunks[0]?.tokens).toContain('substantiated');
    expect(chunks[1]?.id).toBe('ch_ccpa_2024_clause_5_2');
    expect(chunks[1]?.tokens).toContain('comparative');
  });
});
