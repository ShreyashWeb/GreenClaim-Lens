/**
 * GreenClaim Lens - Core domain types and utilities
 * Pure business logic with zero I/O and zero platform dependencies.
 */

export const CORE_VERSION = '0.1.0';

export const VERDICTS = [
  'CREDIBLE',
  'VAGUE',
  'LIKELY_MISLEADING',
  'INSUFFICIENT_EVIDENCE',
] as const;

export type Verdict = (typeof VERDICTS)[number];

export function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && VERDICTS.includes(value as Verdict);
}

export const RULE_OUTCOMES = ['pass', 'flag', 'n/a', 'unsure'] as const;
export type RuleOutcome = (typeof RULE_OUTCOMES)[number];

export const RULE_SEVERITIES = ['low', 'medium', 'high'] as const;
export type RuleSeverity = (typeof RULE_SEVERITIES)[number];

export interface RuleSource {
  document: string;
  clause: string;
  url: string;
  retrieved_on?: string;
}

export interface RuleDefinition {
  id: string;
  title: string;
  status: 'draft' | 'reviewed' | 'active' | 'retired';
  severity: RuleSeverity;
  source: RuleSource;
  outcome_if_missing: RuleOutcome;
  explain: Record<string, string>;
  remediation?: Record<string, string>;
}
