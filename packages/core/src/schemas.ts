import { z } from 'zod';

export const VERDICTS = [
  'CREDIBLE',
  'VAGUE',
  'LIKELY_MISLEADING',
  'INSUFFICIENT_EVIDENCE',
] as const;

export const VerdictSchema = z.enum(VERDICTS);
export type Verdict = z.infer<typeof VerdictSchema>;

export const RULE_OUTCOMES = ['pass', 'flag', 'n/a', 'unsure'] as const;
export const RuleOutcomeSchema = z.enum(RULE_OUTCOMES);
export type RuleOutcome = z.infer<typeof RuleOutcomeSchema>;

export const RULE_SEVERITIES = ['low', 'medium', 'high'] as const;
export const RuleSeveritySchema = z.enum(RULE_SEVERITIES);
export type RuleSeverity = z.infer<typeof RuleSeveritySchema>;

export const RULE_STATUSES = ['draft', 'reviewed', 'active', 'retired'] as const;
export const RuleStatusSchema = z.enum(RULE_STATUSES);
export type RuleStatus = z.infer<typeof RuleStatusSchema>;

export const ClaimInputSchema = z.object({
  text: z.string().trim().min(1, 'Claim text cannot be empty'),
  lang: z.enum(['en', 'hi', 'mixed']).default('en').optional(),
  context: z
    .object({
      category: z.string().optional(),
      barcode: z.string().nullable().optional(),
      brand: z.string().optional(),
    })
    .optional(),
});
export type ClaimInput = z.infer<typeof ClaimInputSchema>;

export const RuleSourceSchema = z.object({
  document: z.string().min(1),
  clause: z.string().min(1),
  url: z.string().min(1),
  retrieved_on: z.string().optional(),
});
export type RuleSource = z.infer<typeof RuleSourceSchema>;

export const RuleDetectSchema = z.object({
  type: z.enum(['lexicon', 'regex', 'structured', 'llm-assisted']),
  terms: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  languages: z.array(z.string()).default(['en']),
  qualifier_terms: z.array(z.string()).optional(),
  substantiation_patterns: z.array(z.string()).optional(),
});
export type RuleDetect = z.infer<typeof RuleDetectSchema>;

export const RuleTestCaseSchema = z.object({
  input: z.string().min(1),
  expect: RuleOutcomeSchema,
  notes: z.string().optional(),
});
export type RuleTestCase = z.infer<typeof RuleTestCaseSchema>;

export const RuleDefinitionSchema = z.object({
  id: z.string().regex(/^GCL-[0-9]{3}$/, 'Rule ID must follow GCL-XXX format'),
  title: z.string().min(1),
  status: RuleStatusSchema,
  severity: RuleSeveritySchema,
  source: RuleSourceSchema,
  detect: RuleDetectSchema,
  requires: z.array(z.string()).optional(),
  outcome_if_missing: RuleOutcomeSchema,
  explain: z.record(z.string(), z.string()),
  remediation: z.record(z.string(), z.string()).optional(),
  tests: z.array(RuleTestCaseSchema).min(1, 'Rule must have at least one test case'),
});
export type RuleDefinition = z.infer<typeof RuleDefinitionSchema>;

export const RuleHitSchema = z.object({
  rule_id: z.string(),
  outcome: RuleOutcomeSchema,
  evidence: z.string().optional(),
  severity: RuleSeveritySchema,
  reason: z.string().optional(),
});
export type RuleHit = z.infer<typeof RuleHitSchema>;

export const CitationSchema = z.object({
  chunk_id: z.string().optional(),
  source: z.string(),
  clause: z.string(),
  url: z.string().optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const VerificationResultSchema = z.object({
  id: z.string().min(1),
  claim: z.object({
    text: z.string(),
    lang: z.string().optional(),
    context: z.record(z.string(), z.unknown()).optional(),
  }),
  verdict: VerdictSchema,
  risk_score: z.number().min(0).max(100),
  rule_hits: z.array(RuleHitSchema),
  citations: z.array(CitationSchema),
  explanation: z.string(),
  what_would_help: z.array(z.string()),
  meta: z.object({
    rule_base_version: z.string(),
    path: z.enum(['rules_only', 'rules_and_retrieval', 'hybrid_llm']),
    models: z.array(z.string()),
    partial: z.boolean(),
    disclaimer: z.string(),
  }),
});
export type VerificationResult = z.infer<typeof VerificationResultSchema>;
