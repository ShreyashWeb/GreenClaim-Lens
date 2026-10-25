/**
 * GreenClaim Lens - API Types and Environment Bindings
 */

export interface ApiBindings {
  ENVIRONMENT?: string | undefined;
  API_KEYS?: string | undefined; // Comma-separated allowed api keys or hashes
  TURNSTILE_SECRET?: string | undefined;
}

export interface VerifyClaimRequest {
  claim: string;
  lang?: 'en' | 'hi' | undefined;
  productCategory?: string | undefined;
  brandName?: string | undefined;
  turnstileToken?: string | undefined;
}

export interface VerifyClaimResponse {
  claim: string;
  claimHash: string;
  verdict: 'CREDIBLE' | 'VAGUE' | 'LIKELY_MISLEADING' | 'INSUFFICIENT_EVIDENCE';
  riskScore: number;
  explanation: string;
  whatWouldHelp: string[];
  ruleHits: Array<{
    ruleId: string;
    ruleName: string;
    outcome: 'flag' | 'pass' | 'n/a';
    severity: 'high' | 'medium' | 'low';
    evidence?: string | undefined;
  }>;
  cached: boolean;
  evaluatedAt: string;
}
