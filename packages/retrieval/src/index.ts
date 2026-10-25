/**
 * GreenClaim Lens - Retrieval
 * Hybrid search over official guidelines, BM25, vector search, chunking.
 */

export interface Chunk {
  id: string;
  document: string;
  clause: string;
  url: string;
  text: string;
}

export function formatCitation(chunk: Chunk): string {
  return `${chunk.document}#${chunk.clause}`;
}
