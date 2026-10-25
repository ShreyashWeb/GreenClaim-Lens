import { describe, expect, it } from 'vitest';
import { OFFICIAL_CORPUS } from './corpus.js';
import {
  HybridRetriever,
  type ScoredChunk,
  bm25KeywordSearch,
  reciprocalRankFusion,
} from './hybrid-retriever.js';

describe('Hybrid Retrieval Engine', () => {
  it('performs keyword search and ranks relevant chunks', () => {
    const results = bm25KeywordSearch('eco-friendly packaging green claims', OFFICIAL_CORPUS, 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0]?.chunk;
    expect(top?.document).toBe('CCPA_2024');
    expect(top?.clause).toBe('Clause 4(1)');
  });

  it('merges keyword and vector rankings using reciprocal rank fusion (RRF)', () => {
    const chunkA = OFFICIAL_CORPUS[0];
    const chunkB = OFFICIAL_CORPUS[1];
    const chunkC = OFFICIAL_CORPUS[2];
    if (!chunkA || !chunkB || !chunkC) throw new Error('Missing test corpus chunks');

    const list1: ScoredChunk[] = [
      { chunk: chunkA, score: 1.0 },
      { chunk: chunkB, score: 0.8 },
    ];
    const list2: ScoredChunk[] = [
      { chunk: chunkB, score: 0.9 },
      { chunk: chunkC, score: 0.7 },
    ];

    const merged = reciprocalRankFusion([list1, list2], 60, 3);
    expect(merged.length).toBe(3);
    // OFFICIAL_CORPUS[1] appears in both lists and should rank top
    expect(merged[0]?.chunk.id).toBe(OFFICIAL_CORPUS[1]?.id);
    expect(merged[0]?.score).toBeGreaterThan(merged[1]?.score ?? 0);
  });

  it('retrieves relevant guideline clauses via HybridRetriever', async () => {
    const retriever = new HybridRetriever({ corpus: OFFICIAL_CORPUS });
    const results = await retriever.retrieve('comparative greener than leading brand baseline', 3);

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.chunk.clause === 'Clause 5(1)')).toBe(true);
  });
});
