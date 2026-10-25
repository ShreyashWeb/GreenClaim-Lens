import type { RuleHit, Verdict } from './schemas.js';

export interface AggregationResult {
  verdict: Verdict;
  riskScore: number;
  explanation: string;
  whatWouldHelp: string[];
}

/**
 * Calculates a normalized risk score (0-100) based on verdict and flags.
 */
export function calculateRiskScore(
  verdict: Verdict,
  flagCount: number,
  passCount: number,
  highSeverityFlags = 0,
): number {
  switch (verdict) {
    case 'CREDIBLE': {
      const base = 15;
      const reduction = Math.min(passCount * 5, 15);
      return Math.max(0, base - reduction);
    }
    case 'VAGUE': {
      const base = 48;
      const addition = Math.min(flagCount * 8, 20);
      return Math.min(68, base + addition);
    }
    case 'LIKELY_MISLEADING': {
      const base = 75;
      const addition = Math.min(highSeverityFlags * 10 + flagCount * 4, 25);
      return Math.min(100, base + addition);
    }
    default:
      return 35;
  }
}

/**
 * Aggregates deterministic rule hits into an overall verdict, risk score, and explanation.
 * Enforces the "cite or abstain" rule and non-accusatory terminology ("does not appear to meet").
 */
export function aggregateVerdict(
  hits: readonly RuleHit[],
  hasUnresolvedUnsure = false,
): AggregationResult {
  const applicableHits = hits.filter((h) => h.outcome !== 'n/a');

  // Hard rule: Cite or abstain. If no rule applies, abstain.
  if (applicableHits.length === 0) {
    return {
      verdict: 'INSUFFICIENT_EVIDENCE',
      riskScore: 30,
      explanation:
        'This claim does not trigger standard environmental claim rules; insufficient evidence is available to assess credibility.',
      whatWouldHelp: [
        'Provide specific environmental claims or metrics to enable structured verification.',
      ],
    };
  }

  // Hard rule: Any unsure outcome forces abstention
  const hasUnsure = hasUnresolvedUnsure || applicableHits.some((h) => h.outcome === 'unsure');
  if (hasUnsure) {
    return {
      verdict: 'INSUFFICIENT_EVIDENCE',
      riskScore: calculateRiskScore('INSUFFICIENT_EVIDENCE', 0, 0),
      explanation:
        'The available evidence is inconclusive; the claim cannot be reliably verified without additional regulatory context or expert review.',
      whatWouldHelp: [
        'Add verifiable third-party certification or link to a publicly accessible technical report.',
      ],
    };
  }

  const flags = applicableHits.filter((h) => h.outcome === 'flag');
  const passes = applicableHits.filter((h) => h.outcome === 'pass');
  const highFlags = flags.filter((h) => h.severity === 'high');

  let verdict: Verdict;
  let explanation: string;
  const whatWouldHelp: string[] = [];

  if (highFlags.length > 0) {
    verdict = 'LIKELY_MISLEADING';
    const flaggedRuleIds = highFlags.map((f) => f.rule_id).join(', ');
    const reasons = highFlags.map((f) => f.reason).filter(Boolean);
    explanation = `This claim does not appear to meet guidelines (rules: ${flaggedRuleIds}). ${reasons[0] ?? 'High severity compliance discrepancy identified.'}`;

    whatWouldHelp.push(
      'Remove broad or absolute assertions unless verifiable across the complete product lifecycle.',
      'Provide third-party audit reports or accredited laboratory verification.',
    );
  } else if (flags.length > 0) {
    verdict = 'VAGUE';
    const flaggedRuleIds = flags.map((f) => f.rule_id).join(', ');
    explanation = `This claim does not appear to meet specificity requirements under rule ${flaggedRuleIds} because it uses broad environmental terms without sufficient qualifying context.`;

    whatWouldHelp.push(
      'State specific attributes and percentages (e.g., "made with 40% post-consumer recycled plastic").',
      'Cite the applicable standard, license number, or certificate scheme.',
    );
  } else if (passes.length > 0) {
    verdict = 'CREDIBLE';
    const passedRuleIds = passes.map((p) => p.rule_id).join(', ');
    explanation = `This claim appears to meet guidelines under rules ${passedRuleIds} with clear qualifiers and verifiable substantiation.`;

    whatWouldHelp.push('Maintain accessible public records for ongoing verification.');
  } else {
    verdict = 'INSUFFICIENT_EVIDENCE';
    explanation = 'Insufficient evidence is available to substantiate this claim.';
    whatWouldHelp.push('Provide verifiable certification reference.');
  }

  const riskScore = calculateRiskScore(verdict, flags.length, passes.length, highFlags.length);

  return {
    verdict,
    riskScore,
    explanation,
    whatWouldHelp,
  };
}
