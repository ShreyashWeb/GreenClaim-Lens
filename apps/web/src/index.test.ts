import { describe, expect, it } from 'vitest';
import {
  TRANSLATIONS,
  generateComplaintPdf,
  getAppTitle,
  lookupProductByBarcode,
  performOcr,
  preprocessImageForOcr,
  verifyClaim,
} from './index.js';

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

    it('evaluates Hindi vernacular environmental claims (GCL-008)', async () => {
      const hindiClaim = 'प्राकृतिक और पर्यावरण-अनुकूल सामग्री';
      const result = await verifyClaim(hindiClaim);

      expect(result.claimText).toBe(hindiClaim);
      // GCL-008 triggers on vernacular terms requiring substantiation
      expect(['VAGUE', 'LIKELY_MISLEADING']).toContain(result.report.verdict);
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

      const headerString = new TextDecoder().decode(pdfBytes.slice(0, 5));
      expect(headerString).toBe('%PDF-');
    });
  });

  describe('Barcode Scanning & Product Lookup', () => {
    it('resolves offline registered product with packaging claims', async () => {
      const product = await lookupProductByBarcode('8901030382345');

      expect(product.found).toBe(true);
      expect(product.name).toBe('Eco-Care Bamboo Toothbrush');
      expect(product.packagingClaims).toContain('100% biodegradable handle');
      expect(product.certifications).toContain('FSC Certified Bamboo');
    });

    it('handles unregistered barcode gracefully without crashing', async () => {
      const product = await lookupProductByBarcode('0000000000000');

      expect(product.found).toBe(false);
      expect(product.packagingClaims).toEqual([]);
    });

    it('throws error on empty barcode', async () => {
      await expect(lookupProductByBarcode('')).rejects.toThrow('Barcode cannot be empty');
    });
  });

  describe('In-Browser OCR & Vision Fallback', () => {
    it('handles image preprocessing without errors', () => {
      // Mock canvas-like object
      const fakeCanvas = {
        width: 10,
        height: 10,
        getContext: () => ({
          getImageData: () => ({
            data: new Uint8ClampedArray(400),
          }),
          putImageData: () => {},
        }),
      } as unknown as HTMLCanvasElement;

      const preprocessed = preprocessImageForOcr(fakeCanvas);
      expect(preprocessed).toBe(fakeCanvas);
    });

    it('engages vision model fallback when provided and OCR returns low confidence', async () => {
      const fallbackResult = await performOcr('fake-low-confidence-image-src', {
        visionFallback: async () => '100% Organic Cotton certified by GOTS',
      });

      expect(fallbackResult.text).toBe('100% Organic Cotton certified by GOTS');
      expect(fallbackResult.confidence).toBeGreaterThanOrEqual(85);
      expect(fallbackResult.lowConfidence).toBe(false);
    });
  });

  describe('Bilingual Localization (EN / HI Parity)', () => {
    it('has complete translation parity between English and Hindi dictionaries', () => {
      const enKeys = Object.keys(TRANSLATIONS.en).sort();
      const hiKeys = Object.keys(TRANSLATIONS.hi).sort();

      expect(enKeys).toEqual(hiKeys);
      expect(TRANSLATIONS.hi.appName).toContain('ग्रीनक्लेम लेंस');
      expect(TRANSLATIONS.hi.sampleClaims.length).toBeGreaterThan(0);
      expect(TRANSLATIONS.hi.verdictThemes.misleading.title).toBe(
        'दिशानिर्देशों के अनुरूप प्रतीत नहीं होता',
      );
    });
  });
});
