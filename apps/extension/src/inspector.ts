/**
 * GreenClaim Lens - Page Claim Inspector Core Logic
 * Inspects DOM elements for commercial environmental marketing claims and applies non-accusatory highlights.
 */

import {
  DEFAULT_RULES,
  type RuleHit,
  type Verdict,
  aggregateVerdict,
  runRules,
} from '@greenclaim/core';

export interface InspectedClaim {
  text: string;
  element: HTMLElement;
  verdict: Verdict;
  riskScore: number;
  explanation: string;
  flaggedRules: string[];
  recommendations: string[];
}

export interface InspectionSummary {
  totalInspected: number;
  claimsFound: number;
  byVerdict: {
    CREDIBLE: number;
    VAGUE: number;
    LIKELY_MISLEADING: number;
    INSUFFICIENT_EVIDENCE: number;
  };
  claims: InspectedClaim[];
}

const GREEN_CLAIM_TRIGGER_REGEX =
  /(eco[-\s]?friendly|green|natural|organic|carbon|emission|net[-\s]?zero|recycled|biodegradable|compostable|sustainable|chemical[-\s]?free|zero[-\s]?waste|पर्यावरण|प्राकृतिक|बायोडिग्रेडेबल)/i;

/**
 * Checks whether an element contains text that warrants rule evaluation.
 */
export function isCandidateElement(el: HTMLElement): boolean {
  if (!el || !el.textContent) return false;
  const tag = el.tagName.toLowerCase();
  if (['script', 'style', 'noscript', 'textarea', 'input', 'code', 'svg', 'mark'].includes(tag)) {
    return false;
  }
  if (el.classList.contains('gcl-claim') || el.classList.contains('gcl-tooltip')) {
    return false;
  }

  const text = el.textContent.trim();
  if (text.length < 4 || text.length > 500) {
    return false;
  }

  return GREEN_CLAIM_TRIGGER_REGEX.test(text);
}

/**
 * Evaluates a single candidate element and applies highlight if applicable.
 */
export function inspectElement(element: HTMLElement): InspectedClaim | null {
  const text = element.textContent?.trim() ?? '';
  if (!text) return null;

  const hits = runRules(text, DEFAULT_RULES);
  const applicableHits = hits.filter((h: RuleHit) => h.outcome !== 'n/a');

  if (applicableHits.length === 0) {
    return null;
  }

  const verdictResult = aggregateVerdict(hits);
  const flaggedRules = hits
    .filter((h: RuleHit) => h.outcome === 'flag')
    .map((h: RuleHit) => h.rule_id);

  // Apply highlight styles
  element.classList.add('gcl-inspected');
  element.setAttribute('data-gcl-verdict', verdictResult.verdict);
  element.setAttribute('data-gcl-score', verdictResult.riskScore.toString());
  element.setAttribute('data-gcl-explanation', verdictResult.explanation);

  return {
    text,
    element,
    verdict: verdictResult.verdict,
    riskScore: verdictResult.riskScore,
    explanation: verdictResult.explanation,
    flaggedRules,
    recommendations: verdictResult.whatWouldHelp,
  };
}

/**
 * Scans a container or document root for environmental claims and returns inspection summary.
 */
export function scanDocument(root: HTMLElement | Document = document): InspectionSummary {
  const summary: InspectionSummary = {
    totalInspected: 0,
    claimsFound: 0,
    byVerdict: {
      CREDIBLE: 0,
      VAGUE: 0,
      LIKELY_MISLEADING: 0,
      INSUFFICIENT_EVIDENCE: 0,
    },
    claims: [],
  };

  const selectors =
    'h1, h2, h3, h4, p, li, span, strong, em, b, [data-claim], .product-title, .badge';
  const candidates = root.querySelectorAll<HTMLElement>(selectors);

  for (const el of candidates) {
    summary.totalInspected++;
    if (isCandidateElement(el)) {
      const inspected = inspectElement(el);
      if (inspected) {
        summary.claimsFound++;
        summary.byVerdict[inspected.verdict]++;
        summary.claims.push(inspected);
      }
    }
  }

  return summary;
}
