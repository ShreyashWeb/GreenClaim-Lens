import { describe, expect, it } from 'vitest';
import { DEFAULT_RULES } from './default-rules.js';
import { runRules } from './rule-runner.js';
import { RuleDefinitionSchema } from './schemas.js';

describe('DEFAULT_RULES validation & embedded test cases', () => {
  it('contains at least 8 foundational rules', () => {
    expect(DEFAULT_RULES.length).toBeGreaterThanOrEqual(8);
  });

  for (const rule of DEFAULT_RULES) {
    describe(`Rule ${rule.id}: ${rule.title}`, () => {
      it('validates against RuleDefinitionSchema', () => {
        expect(() => RuleDefinitionSchema.parse(rule)).not.toThrow();
      });

      it('has a defined source document and clause reference', () => {
        expect(rule.source.document).toBeDefined();
        expect(rule.source.clause).toBeDefined();
      });

      for (const testCase of rule.tests) {
        it(`evaluates test: "${testCase.input}" -> ${testCase.expect}`, () => {
          const hits = runRules(testCase.input, [rule], rule.detect.languages[0]);
          const hit = hits.find((h) => h.rule_id === rule.id);
          expect(hit).toBeDefined();
          expect(hit?.outcome).toBe(testCase.expect);
        });
      }
    });
  }
});
