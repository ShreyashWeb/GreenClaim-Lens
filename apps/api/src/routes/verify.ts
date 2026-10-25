/**
 * GreenClaim Lens - Verify Claim Route
 */

import { DEFAULT_RULES, type RuleHit, aggregateVerdict, runRules } from '@greenclaim/core';
import { Hono } from 'hono';
import { z } from 'zod';
import { verifyTurnstileToken } from '../middleware/turnstile.js';
import type { ApiBindings, VerifyClaimResponse } from '../types.js';

export const verifyRouter = new Hono<{ Bindings: ApiBindings }>();

// In-memory verification cache for identical claims
const verificationCache = new Map<string, VerifyClaimResponse>();

const VerifyClaimSchema = z.object({
  claim: z
    .string()
    .min(2, 'Claim must be at least 2 characters long')
    .max(2000, 'Claim exceeds maximum allowed length of 2000 characters'),
  lang: z.enum(['en', 'hi']).optional(),
  productCategory: z.string().max(100).optional(),
  brandName: z.string().max(100).optional(),
  turnstileToken: z.string().optional(),
});

/**
 * Computes deterministic SHA-256 hash string for claim text
 */
async function computeClaimHash(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase().normalize('NFKC');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates actionable recommendations based on rule hits
 */
function generateRecommendations(hits: RuleHit[]): string[] {
  const flags = hits.filter((h) => h.outcome === 'flag');
  if (flags.length === 0) {
    return [
      'Maintain independent third-party lab verification certificates readily accessible.',
      'Provide a direct QR code on packaging leading to the complete life-cycle assessment (LCA).',
    ];
  }

  const recommendations: string[] = [];
  for (const hit of flags) {
    switch (hit.rule_id) {
      case 'GCL-001':
      case 'GCL-008':
        recommendations.push(
          'Replace generic claims ("eco-friendly", "green") with specific, measurable attributes (e.g. "Bottle made with 70% post-consumer recycled PET").',
        );
        break;
      case 'GCL-002':
        recommendations.push(
          'Provide clear qualifying details clarifying whether "100%" applies to the entire formulation or only active ingredients.',
        );
        break;
      case 'GCL-003':
        recommendations.push(
          'Specify whether the packaging is industrially or home compostable with the applicable standard (e.g., ISO 17088 or IS 17088).',
        );
        break;
      case 'GCL-004':
        recommendations.push(
          'Disclose whether the carbon neutral claim relies on carbon offsets or direct emission reductions, citing the accredited carbon registry.',
        );
        break;
      case 'GCL-005':
        recommendations.push(
          'Avoid advertising the absence of harmful ingredients that are already prohibited by national law.',
        );
        break;
      case 'GCL-006':
        recommendations.push(
          'Clarify whether "eco-friendly" applies to the internal contents or exclusively the secondary shipping container.',
        );
        break;
      case 'GCL-007':
        recommendations.push(
          'State verifiable roadmap targets, baseline emission years, and third-party monitoring for future net-zero projections.',
        );
        break;
      default:
        recommendations.push(
          'Provide substantiating empirical evidence and regulatory documentation for all environmental assertions.',
        );
    }
  }

  return Array.from(new Set(recommendations));
}

verifyRouter.post('/', async (c) => {
  let bodyJson: unknown;
  try {
    bodyJson = await c.req.json();
  } catch {
    return c.json({ error: 'BadRequest', message: 'Invalid JSON payload' }, 400);
  }

  const parseResult = VerifyClaimSchema.safeParse(bodyJson);
  if (!parseResult.success) {
    return c.json(
      {
        error: 'ValidationError',
        message: 'Invalid request parameters',
        details: parseResult.error.format(),
      },
      400,
    );
  }

  const { claim, lang = 'en', turnstileToken } = parseResult.data;

  // Turnstile verification if secret is configured
  const env = (c.env ?? {}) as ApiBindings;
  const turnstileSecret = env.TURNSTILE_SECRET ?? process.env.TURNSTILE_SECRET;
  if (turnstileSecret && turnstileToken) {
    const clientIp =
      c.req.header('cf-connecting-ip') ??
      c.req.header('x-forwarded-for') ??
      c.req.header('x-real-ip');
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, turnstileSecret, clientIp);
    if (!turnstileCheck.success) {
      return c.json(
        {
          error: 'TurnstileVerificationFailed',
          message: turnstileCheck.error ?? 'Bot protection verification failed',
        },
        403,
      );
    }
  }

  const claimHash = await computeClaimHash(claim);

  // Check cache
  const cachedResponse = verificationCache.get(claimHash);
  if (cachedResponse) {
    return c.json({ ...cachedResponse, cached: true });
  }

  // Deterministic rule evaluation
  const ruleHits = runRules(claim, DEFAULT_RULES, lang);
  const verdictResult = aggregateVerdict(ruleHits);
  const recommendations = generateRecommendations(ruleHits);

  // Strictly non-accusatory explanation
  let explanation = '';
  if (verdictResult.verdict === 'CREDIBLE') {
    explanation =
      'The claim specifies verifiable, qualified environmental attributes that align with CCPA 2024 guidelines.';
  } else if (verdictResult.verdict === 'LIKELY_MISLEADING') {
    explanation =
      'The claim does not appear to meet regulatory standards due to high-severity unverified or absolute assertions without qualifying disclosures.';
  } else if (verdictResult.verdict === 'VAGUE') {
    explanation =
      'The claim contains broad terminology that does not appear to meet regulatory standards without supporting empirical data.';
  } else {
    explanation =
      'Insufficient verifiable data exists to establish compliance against regulatory guidelines.';
  }

  const responsePayload: VerifyClaimResponse = {
    claim,
    claimHash,
    verdict: verdictResult.verdict,
    riskScore: verdictResult.riskScore,
    explanation,
    whatWouldHelp: recommendations,
    ruleHits: ruleHits.map((h: RuleHit) => {
      const rule = DEFAULT_RULES.find((r) => r.id === h.rule_id);
      return {
        ruleId: h.rule_id,
        ruleName: rule?.title ?? h.rule_id,
        outcome: h.outcome === 'unsure' ? 'flag' : h.outcome,
        severity: h.severity,
        evidence: h.evidence,
      };
    }),
    cached: false,
    evaluatedAt: new Date().toISOString(),
  };

  // Cache up to 1,000 entries
  if (verificationCache.size >= 1000) {
    const firstKey = verificationCache.keys().next().value;
    if (firstKey) verificationCache.delete(firstKey);
  }
  verificationCache.set(claimHash, responsePayload);

  return c.json(responsePayload);
});
