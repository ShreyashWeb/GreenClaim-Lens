import { describe, expect, it } from 'vitest';
import { runRules } from './rule-runner.js';
import type { RuleDefinition } from './schemas.js';

const sampleRule: RuleDefinition = {
  id: 'GCL-001',
  title: 'Unqualified broad environmental term',
  status: 'active',
  severity: 'medium',
  source: {
    document: 'CCPA 2024 Guidelines',
    clause: 'Clause 4(1)',
    url: 'https://consumeraffairs.nic.in/guidelines',
  },
  detect: {
    type: 'lexicon',
    terms: ['eco-friendly', 'green', 'natural', 'planet-friendly', 'environmentally friendly'],
    languages: ['en'],
    qualifier_terms: ['recycled', 'post-consumer', 'biodegradable within', 'organic certified'],
    substantiation_patterns: ['certificate', 'iso', 'tested by', 'license', 'standard'],
  },
  requires: ['qualifier', 'substantiation_reference'],
  outcome_if_missing: 'flag',
  explain: {
    en: 'Generic broad terms need specific qualification and supporting evidence.',
  },
  remediation: {
    en: 'Specify the exact environmental attribute and link verification certificate.',
  },
  tests: [
    { input: '100% eco-friendly packaging', expect: 'flag' },
    {
      input: 'Made with 40% post-consumer recycled plastic (certificate: ISO-14021)',
      expect: 'pass',
    },
  ],
};

const comparativeRule: RuleDefinition = {
  id: 'GCL-003',
  title: 'Comparative environmental claim without verifiable baseline',
  status: 'active',
  severity: 'high',
  source: {
    document: 'CCPA 2024 Guidelines',
    clause: 'Clause 5(2)',
    url: 'https://consumeraffairs.nic.in/guidelines',
  },
  detect: {
    type: 'lexicon',
    terms: [
      'greener than before',
      'more eco-friendly',
      'less plastic than before',
      'cleaner than previous',
    ],
    languages: ['en'],
    qualifier_terms: ['compared to 2022 baseline', 'vs 2023 formulation', 'baseline report'],
    substantiation_patterns: ['baseline audit', 'audit report', 'lca report'],
  },
  requires: ['qualifier', 'substantiation_reference'],
  outcome_if_missing: 'flag',
  explain: {
    en: 'Comparative claims require an explicit verifiable baseline and comparison methodology.',
  },
  tests: [{ input: 'Now 50% greener than before!', expect: 'flag' }],
};

describe('Rule Runner', () => {
  it('flags unqualified broad claims', () => {
    const hits = runRules('100% eco-friendly packaging', [sampleRule]);
    expect(hits).toHaveLength(1);
    const hit = hits[0];
    expect(hit?.rule_id).toBe('GCL-001');
    expect(hit?.outcome).toBe('flag');
    expect(hit?.evidence).toBe('eco-friendly');
    expect(hit?.severity).toBe('medium');
  });

  it('passes qualified claims with visible substantiation', () => {
    const hits = runRules(
      'Eco-friendly packaging: made with 40% post-consumer recycled plastic (certificate: ISO-14021)',
      [sampleRule],
    );
    expect(hits).toHaveLength(1);
    const hit = hits[0];
    expect(hit?.outcome).toBe('pass');
    expect(hit?.evidence).toBe('eco-friendly');
  });

  it('returns n/a when no detect terms match', () => {
    const hits = runRules('Standard cotton t-shirt with crew neck', [sampleRule]);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.outcome).toBe('n/a');
  });

  it('handles multiple rules in sequence', () => {
    const text = '50% greener than before with eco-friendly bottle';
    const hits = runRules(text, [sampleRule, comparativeRule]);
    expect(hits).toHaveLength(2);
    expect(hits.some((h) => h.rule_id === 'GCL-001' && h.outcome === 'flag')).toBe(true);
    expect(hits.some((h) => h.rule_id === 'GCL-003' && h.outcome === 'flag')).toBe(true);
  });

  it('is case-insensitive and normalizes unicode whitespace', () => {
    const hits = runRules('100%  ECO-FRIENDLY  bag', [sampleRule]);
    expect(hits[0]?.outcome).toBe('flag');
    expect(hits[0]?.evidence?.toLowerCase()).toBe('eco-friendly');
  });
});
