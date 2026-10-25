import { type Chunk, tokenize } from './chunker.js';

export interface ScoredChunk {
  chunk: Chunk;
  score: number;
}

export interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>;
}

/**
 * Computes cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dot += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * BM25-style keyword search over pre-tokenized chunks.
 */
export function bm25KeywordSearch(
  query: string,
  corpus: readonly Chunk[],
  limit = 5,
  k1 = 1.2,
  b = 0.75,
): ScoredChunk[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || corpus.length === 0) {
    return [];
  }

  const N = corpus.length;
  const docLengths = corpus.map((c) => c.tokens.length);
  const avgDl = docLengths.reduce((sum, len) => sum + len, 0) / N;

  // Compute document frequency for each query token
  const df: Record<string, number> = {};
  for (const token of queryTokens) {
    let count = 0;
    for (const chunk of corpus) {
      if (chunk.tokens.includes(token)) {
        count++;
      }
    }
    df[token] = count;
  }

  const scored: ScoredChunk[] = corpus.map((chunk, idx) => {
    let score = 0;
    const docLen = docLengths[idx] ?? avgDl;

    for (const token of queryTokens) {
      const docFreq = df[token] ?? 0;
      if (docFreq === 0) continue;

      // BM25 IDF
      const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));

      // Term frequency in chunk
      const tf = chunk.tokens.filter((t) => t === token).length;
      if (tf === 0) continue;

      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + (b * docLen) / avgDl);
      score += idf * (numerator / denominator);
    }

    return { chunk, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Reciprocal Rank Fusion (RRF) combines multiple ranked lists into a single consolidated ranking.
 */
export function reciprocalRankFusion(
  rankedLists: ScoredChunk[][],
  k = 60,
  limit = 5,
): ScoredChunk[] {
  const scoreMap = new Map<string, { chunk: Chunk; rrfScore: number }>();

  for (const list of rankedLists) {
    list.forEach((item, rank) => {
      const chunkId = item.chunk.id;
      const rrfIncrement = 1 / (k + (rank + 1));

      const existing = scoreMap.get(chunkId);
      if (existing) {
        existing.rrfScore += rrfIncrement;
      } else {
        scoreMap.set(chunkId, { chunk: item.chunk, rrfScore: rrfIncrement });
      }
    });
  }

  return Array.from(scoreMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, limit)
    .map((entry) => ({
      chunk: entry.chunk,
      score: entry.rrfScore,
    }));
}

export interface HybridRetrieverOptions {
  corpus: readonly Chunk[];
  embeddingProvider?: EmbeddingProvider | undefined;
  rrfK?: number | undefined;
}

/**
 * Hybrid Retriever combining keyword search and semantic vector search merged by RRF.
 */
export class HybridRetriever {
  private corpus: readonly Chunk[];
  private embeddingProvider?: EmbeddingProvider | undefined;
  private rrfK: number;

  constructor(options: HybridRetrieverOptions) {
    this.corpus = options.corpus;
    this.embeddingProvider = options.embeddingProvider;
    this.rrfK = options.rrfK ?? 60;
  }

  async retrieve(query: string, limit = 5): Promise<ScoredChunk[]> {
    const keywordResults = bm25KeywordSearch(query, this.corpus, limit * 2);

    if (!this.embeddingProvider) {
      return keywordResults.slice(0, limit);
    }

    // Vector retrieval if provider configured
    try {
      const queryVector = await this.embeddingProvider.embedText(query);
      const vectorResults: ScoredChunk[] = [];

      for (const chunk of this.corpus) {
        // Embed chunk text
        const chunkVector = await this.embeddingProvider.embedText(`${chunk.title}: ${chunk.text}`);
        const sim = cosineSimilarity(queryVector, chunkVector);
        vectorResults.push({ chunk, score: sim });
      }

      vectorResults.sort((a, b) => b.score - a.score);
      return reciprocalRankFusion(
        [keywordResults, vectorResults.slice(0, limit * 2)],
        this.rrfK,
        limit,
      );
    } catch {
      // Fallback gracefully to keyword search if vector provider fails
      return keywordResults.slice(0, limit);
    }
  }
}
