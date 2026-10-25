import { describe, expect, it } from 'vitest';
import { generateComplaintPdf, getAppTitle, verifyClaim } from './index.js';

describe('@greenclaim/web Application Suite', () => {
  it('returns valid app branding', () => {
    expect(getAppTitle()).toBe('GreenClaim Lens');
  });

  describe('Claim Verification Workflow', () => {
    it('evaluates misleading absolute claim with high risk score and recommendations', async () => {
      const claim = '100% natural organic ingredients with zero emission';
      const result = await verifyClaim(claim);

      expect(result.claimText).toBe(claim);
      expect(result.report.verdict).toBe('LIKELY_MISLEADING');
      expect(result.report.riskScore.score).toBeGreaterThanOrEqual(60);
      expect(result.report.riskScore.level).toBe('high');
      expect(result.report.explanation).toContain('does not appear to meet guidelines');
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.retrievedChunks.length).toBeGreaterThan(0);
      expect(result.report.citations.length).toBeGreaterThan(0);
    });

    it('evaluates vague unqualified claim with medium risk score', async () => {
      const claim = 'Eco-friendly everyday cleaning solution';
      const result = await verifyClaim(claim);

      expect(result.claimText).toBe(claim);
      expect(result.report.verdict).toBe('VAGUE');
      expect(result.report.riskScore.score).toBeGreaterThanOrEqual(35);
      expect(result.report.explanation).toContain(
        'does not appear to meet specificity requirements',
      );
    });

    it('evaluates credible qualified claim with low risk score', async () => {
      const claim =
        'Eco-friendly bottle made with 50% post-consumer recycled PET (certificate: ISO-14021)';
      const result = await verifyClaim(claim);

      expect(result.claimText).toBe(claim);
      expect(result.report.verdict).toBe('CREDIBLE');
      expect(result.report.riskScore.score).toBeLessThanOrEqual(30);
      expect(result.report.riskScore.level).toBe('low');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('throws error for empty claim input', async () => {
      await expect(verifyClaim('   ')).rejects.toThrow('Claim text cannot be empty');
    });
  });

  describe('Client-Side PDF Grievance Generator', () => {
    it('generates valid PDF document bytes with cited provisions', async () => {
      const result = await verifyClaim('100% natural organic ingredients');
      const pdfBytes = await generateComplaintPdf(result, {
        brandName: 'Test Brand Ltd',
        productName: 'Eco Cream',
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);

      // Verify PDF magic header bytes: %PDF-
      const headerString = new TextDecoder().decode(pdfBytes.slice(0, 5));
      expect(headerString).toBe('%PDF-');
    });
  });
});
