import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VERDICTS, type Verdict } from './schemas.js';

interface GoldenRecord {
  id: string;
  text: string;
  lang: string;
  category: string;
  expected_verdict: Verdict;
  expected_rules: string[];
  expected_citations: string[];
  difficulty: string;
}

describe('Golden Dataset v0 schema & balance', () => {
  const filePath = resolve(process.cwd(), '../../data/golden/golden_v0.json');
  const content = readFileSync(filePath, 'utf-8');
  const dataset = JSON.parse(content) as GoldenRecord[];

  it('contains at least 50 items (target: 50+)', () => {
    expect(dataset.length).toBeGreaterThanOrEqual(50);
  });

  it('contains all 4 verdict classes with positive counts', () => {
    const verdictCounts: Record<string, number> = {};
    for (const item of dataset) {
      verdictCounts[item.expected_verdict] = (verdictCounts[item.expected_verdict] ?? 0) + 1;
    }

    for (const verdict of VERDICTS) {
      expect(verdictCounts[verdict]).toBeGreaterThan(0);
    }
  });

  it('has valid structure and unique IDs for all items', () => {
    const ids = new Set<string>();
    for (const item of dataset) {
      expect(item.id).toMatch(/^gc-[0-9]{4}$/);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(item.text.trim().length).toBeGreaterThan(0);
      expect(VERDICTS.includes(item.expected_verdict)).toBe(true);
    }
  });
});
