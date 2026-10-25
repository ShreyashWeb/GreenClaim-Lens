export interface Chunk {
  id: string;
  document: string;
  clause: string;
  url: string;
  version: string;
  title: string;
  text: string;
  tokens: string[];
}

export interface DocumentSection {
  clause: string;
  title: string;
  text: string;
}

export interface DocumentInput {
  document: string;
  url: string;
  version: string;
  sections: DocumentSection[];
}

/**
 * Creates a deterministic, stable chunk identifier from document name and clause.
 */
export function createStableChunkId(document: string, clause: string, index?: number): string {
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const docSlug = sanitize(document);
  const clauseSlug = sanitize(clause);
  const suffix = typeof index === 'number' ? `_${index}` : '';

  return `ch_${docSlug}_${clauseSlug}${suffix}`;
}

export function formatCitation(chunk: Pick<Chunk, 'document' | 'clause'>): string {
  return `${chunk.document}#${chunk.clause}`;
}

/**
 * Tokenizes text into normalized lowercase keyword tokens (preserving hyphenated terms).
 */
export function tokenize(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);

  return Array.from(new Set(tokens));
}

/**
 * Transforms raw document sections into indexed Chunk objects with stable IDs and token sets.
 */
export function chunkDocument(input: DocumentInput): Chunk[] {
  return input.sections.map((section) => {
    const id = createStableChunkId(input.document, section.clause);
    const tokens = tokenize(`${section.title} ${section.text}`);

    return {
      id,
      document: input.document,
      clause: section.clause,
      url: input.url,
      version: input.version,
      title: section.title,
      text: section.text,
      tokens,
    };
  });
}
