import {
  DEFAULT_RULES,
  type RuleHit,
  type Verdict,
  aggregateVerdict,
  runRules,
} from '@greenclaim/core';
import { HybridRetriever, OFFICIAL_CORPUS, type ScoredChunk } from '@greenclaim/retrieval';

export interface WebVerdictReport {
  verdict: Verdict;
  riskScore: {
    score: number;
    level: 'low' | 'medium' | 'high';
  };
  explanation: string;
  citations: string[];
  ruleHits: RuleHit[];
}

export interface VerificationResult {
  claimText: string;
  report: WebVerdictReport;
  retrievedChunks: ScoredChunk[];
  recommendations: string[];
}

const RULE_RECOMMENDATIONS: Record<string, string> = {
  'GCL-001':
    'Accompany generic claims like "green" or "eco-friendly" with specific, prominent qualifiers explaining the exact environmental benefit.',
  'GCL-002':
    'Substantiate absolute assertions ("100%", "zero emission") with accredited third-party lifecycle assessments and publicly accessible test data.',
  'GCL-003':
    'Specify the comparative baseline, predecessor formula, or competitor benchmark with exact percentage reductions and testing methods.',
  'GCL-004':
    'Publish concrete interim milestones, verifiable target dates, and an independently audited net-zero transition roadmap.',
  'GCL-005':
    'Explicitly distinguish direct emissions reductions from carbon credit offsets, citing the certification standard and registry serial numbers.',
  'GCL-006':
    'Display certification validity credentials from accredited statutory bodies (such as BIS or Ecomark) rather than self-declared seals.',
  'GCL-007':
    'Specify the certified composting environment (e.g. industrial composting facility at 58°C) and the verified timeline for complete biodegradation.',
  'GCL-008':
    'Ensure vernacular terms (e.g. प्राकृतिक, पर्यावरण-अनुकूल) are supported by equivalent technical substantiation.',
};

const retriever = new HybridRetriever({
  corpus: OFFICIAL_CORPUS,
});

/**
 * Runs instant, deterministic verification of a claim text against CCPA 2024 & Ecomark guidelines.
 */
export async function verifyClaim(text: string): Promise<VerificationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Claim text cannot be empty');
  }

  // 1. Run deterministic rule suite from core
  const ruleHits: RuleHit[] = runRules(trimmed, DEFAULT_RULES);

  // 2. Aggregate verdict and risk score
  const aggregation = aggregateVerdict(ruleHits);

  // 3. Retrieve relevant official guideline clauses
  const retrievedChunks = await retriever.retrieve(trimmed, 3);

  // 4. Extract citations from rules and chunks
  const ruleMap = new Map(DEFAULT_RULES.map((r) => [r.id, r]));
  const citations: string[] = [];

  for (const hit of ruleHits) {
    if (hit.outcome === 'flag' || hit.outcome === 'pass') {
      const def = ruleMap.get(hit.rule_id);
      if (def) {
        const cit = `CCPA Guidelines (2024) [${def.id}]`;
        if (!citations.includes(cit)) {
          citations.push(cit);
        }
      }
    }
  }

  for (const item of retrievedChunks) {
    const chunkCit = `${item.chunk.document}#${item.chunk.clause}`;
    if (!citations.includes(chunkCit)) {
      citations.push(chunkCit);
    }
  }

  // 5. Synthesize "what would make this credible" recommendations
  const recommendations: string[] = [...aggregation.whatWouldHelp];
  const flaggedRules = ruleHits.filter((h) => h.outcome === 'flag');

  for (const hit of flaggedRules) {
    const rec = RULE_RECOMMENDATIONS[hit.rule_id];
    if (rec && !recommendations.includes(rec)) {
      recommendations.push(rec);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Provide verifiable evidence from accredited testing laboratories or statutory bodies to substantiate environmental performance.',
    );
  }

  const score = aggregation.riskScore;
  const level: 'low' | 'medium' | 'high' = score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';

  const report: WebVerdictReport = {
    verdict: aggregation.verdict,
    riskScore: { score, level },
    explanation: aggregation.explanation,
    citations,
    ruleHits,
  };

  return {
    claimText: trimmed,
    report,
    retrievedChunks,
    recommendations,
  };
}
