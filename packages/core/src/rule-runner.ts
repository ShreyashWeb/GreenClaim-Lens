import type { RuleDefinition, RuleHit } from './schemas.js';

/**
 * Normalizes claim text by trimming, collapsing spaces, and Unicode NFKC normalization.
 */
export function normalizeClaimText(text: string): string {
  return text.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

/**
 * Generic qualification and substantiation heuristics when rule does not override.
 */
const DEFAULT_QUALIFIER_REGEX =
  /(\b\d+(\.\d+)?%\b|\brecycled\b|\bpost-consumer\b|\bcertified organic\b|\bcompostable in\b|\bfsc\b|\bgots\b)/i;

const DEFAULT_SUBSTANTIATION_REGEX =
  /(\bcertificate\b|\bcertified by\b|\biso[-\s]?\d+\b|\bbis\b|\bstandard\b|\blicense\b|\breport\b|\btested by\b|\bverification\b|\bhttps?:\/\/)/i;

/**
 * Executes a list of deterministic rules against normalized claim text.
 * Pure function: no I/O, no network, no environment access.
 */
export function runRules(
  claimText: string,
  rules: readonly RuleDefinition[],
  _lang = 'en',
): RuleHit[] {
  const normalized = normalizeClaimText(claimText);
  const lower = normalized.toLowerCase();

  const results: RuleHit[] = [];

  for (const rule of rules) {
    if (rule.status === 'retired') {
      results.push({
        rule_id: rule.id,
        outcome: 'n/a',
        severity: rule.severity,
        reason: 'Rule is retired',
      });
      continue;
    }

    let matchedTerm: string | undefined;

    if (rule.detect.type === 'lexicon' && rule.detect.terms) {
      for (const term of rule.detect.terms) {
        const lowerTerm = term.toLowerCase();
        if (lower.includes(lowerTerm)) {
          matchedTerm = term;
          break;
        }
      }
    } else if (rule.detect.type === 'regex' && rule.detect.pattern) {
      const re = new RegExp(rule.detect.pattern, 'i');
      const match = re.exec(normalized);
      if (match) {
        matchedTerm = match[0];
      }
    } else if (rule.detect.type === 'llm-assisted') {
      results.push({
        rule_id: rule.id,
        outcome: 'unsure',
        severity: rule.severity,
        reason: 'Requires LLM assistance and retrieval context',
      });
      continue;
    }

    if (!matchedTerm) {
      results.push({
        rule_id: rule.id,
        outcome: 'n/a',
        severity: rule.severity,
      });
      continue;
    }

    // Check requirements
    const requires = rule.requires ?? [];
    let missingRequirement: string | null = null;

    for (const req of requires) {
      if (req === 'qualifier') {
        const hasRuleQualifier = rule.detect.qualifier_terms?.some((q) =>
          lower.includes(q.toLowerCase()),
        );
        const hasDefaultQualifier = DEFAULT_QUALIFIER_REGEX.test(normalized);

        if (!hasRuleQualifier && !hasDefaultQualifier) {
          missingRequirement = 'Missing qualifying context or specific scope';
          break;
        }
      }

      if (req === 'substantiation_reference') {
        const hasRuleSubstantiation = rule.detect.substantiation_patterns?.some((p) =>
          lower.includes(p.toLowerCase()),
        );
        const hasDefaultSubstantiation = DEFAULT_SUBSTANTIATION_REGEX.test(normalized);

        if (!hasRuleSubstantiation && !hasDefaultSubstantiation) {
          missingRequirement = 'Missing verifiable substantiation or reference';
          break;
        }
      }
    }

    if (missingRequirement) {
      results.push({
        rule_id: rule.id,
        outcome: rule.outcome_if_missing,
        evidence: matchedTerm,
        severity: rule.severity,
        reason: `${rule.explain.en ?? 'Requirement not met'}: ${missingRequirement}`,
      });
    } else {
      results.push({
        rule_id: rule.id,
        outcome: 'pass',
        evidence: matchedTerm,
        severity: rule.severity,
      });
    }
  }

  return results;
}
