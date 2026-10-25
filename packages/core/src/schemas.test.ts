import { describe, expect, it } from 'vitest';
import {
  ClaimInputSchema,
  RuleDefinitionSchema,
  RuleHitSchema,
  VerdictSchema,
  VerificationResultSchema,
} from './schemas.js';

describe('Core Zod Schemas', () => {
  describe('ClaimInputSchema', () => {
    it('validates a valid claim input', () => {
      const input = {
        text: '100% eco-friendly packaging',
        lang: 'en',
        context: { category: 'packaging' },
      };
      const parsed = ClaimInputSchema.parse(input);
      expect(parsed.text).toBe('100% eco-friendly packaging');
      expect(parsed.lang).toBe('en');
    });

    it('rejects empty claim text', () => {
      expect(() => ClaimInputSchema.parse({ text: '   ' })).toThrow();
    });
  });

  describe('RuleDefinitionSchema', () => {
    it('validates a complete rule definition', () => {
      const rule = {
        id: 'GCL-001',
        title: 'Unqualified broad environmental term',
        status: 'draft',
        severity: 'medium',
        source: {
          document: 'CCPA 2024 Guidelines',
          clause: 'Clause 4(1)',
          url: 'https://consumeraffairs.nic.in/guidelines',
          retrieved_on: '2024-10-15',
        },
        detect: {
          type: 'lexicon',
          terms: ['eco-friendly', 'green', 'natural'],
          languages: ['en', 'hi'],
        },
        requires: ['qualifier', 'substantiation_reference'],
        outcome_if_missing: 'flag',
        explain: {
          en: 'Broad terms need a qualifier and supporting evidence.',
        },
        remediation: {
          en: 'State the specific attribute and link evidence.',
        },
        tests: [
          { input: '100% eco-friendly', expect: 'flag' },
          { input: 'Made with 40% recycled paper', expect: 'pass' },
        ],
      };
      const parsed = RuleDefinitionSchema.parse(rule);
      expect(parsed.id).toBe('GCL-001');
      expect(parsed.detect.type).toBe('lexicon');
    });
  });

  describe('RuleHitSchema & VerdictSchema', () => {
    it('accepts all 4 valid verdict outcomes', () => {
      expect(VerdictSchema.parse('CREDIBLE')).toBe('CREDIBLE');
      expect(VerdictSchema.parse('VAGUE')).toBe('VAGUE');
      expect(VerdictSchema.parse('LIKELY_MISLEADING')).toBe('LIKELY_MISLEADING');
      expect(VerdictSchema.parse('INSUFFICIENT_EVIDENCE')).toBe('INSUFFICIENT_EVIDENCE');
      expect(() => VerdictSchema.parse('UNKNOWN')).toThrow();
    });

    it('validates a rule hit', () => {
      const hit = {
        rule_id: 'GCL-001',
        outcome: 'flag',
        evidence: 'eco-friendly',
        severity: 'medium',
        reason: 'Unqualified broad term without evidence',
      };
      const parsed = RuleHitSchema.parse(hit);
      expect(parsed.outcome).toBe('flag');
    });
  });

  describe('VerificationResultSchema', () => {
    it('validates a full verification result', () => {
      const result = {
        id: 'vrd_12345678',
        claim: {
          text: '100% eco-friendly packaging',
        },
        verdict: 'VAGUE',
        risk_score: 60,
        rule_hits: [
          {
            rule_id: 'GCL-001',
            outcome: 'flag',
            evidence: 'eco-friendly',
            severity: 'medium',
          },
        ],
        citations: [
          {
            chunk_id: 'ch_01',
            source: 'CCPA Guidelines 2024',
            clause: 'Clause 4(1)',
          },
        ],
        explanation: 'The claim does not appear to meet guidance on broad environmental claims.',
        what_would_help: ['Provide specific material percentages'],
        meta: {
          rule_base_version: '0.1.0',
          path: 'rules_only',
          models: [],
          partial: false,
          disclaimer: 'Automated risk indicator, not legal advice.',
        },
      };
      const parsed = VerificationResultSchema.parse(result);
      expect(parsed.verdict).toBe('VAGUE');
      expect(parsed.risk_score).toBe(60);
    });
  });
});
