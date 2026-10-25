import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { VerificationResult } from './verifier.js';

export interface ComplaintPdfOptions {
  productName?: string | undefined;
  brandName?: string | undefined;
  consumerName?: string | undefined;
}

/**
 * Generates a formal, printable PDF grievance draft adhering to CCPA 2024 guidelines.
 */
export async function generateComplaintPdf(
  result: VerificationResult,
  options: ComplaintPdfOptions = {},
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let cursorY = height - 50;
  const margin = 50;
  const contentWidth = width - margin * 2;

  // Header Title
  page.drawText('FORMAL NOTICE OF ENVIRONMENTAL CLAIM INCONSISTENCY', {
    x: margin,
    y: cursorY,
    size: 14,
    font: fontBold,
    color: rgb(0.06, 0.45, 0.35),
  });
  cursorY -= 18;

  page.drawText('Under the Consumer Protection Act, 2019 & CCPA Greenwashing Guidelines, 2024', {
    x: margin,
    y: cursorY,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.4),
  });
  cursorY -= 25;

  // Horizontal separator rule
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: width - margin, y: cursorY },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.85),
  });
  cursorY -= 20;

  // Metadata block
  const dateStr = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  page.drawText(`Date: ${dateStr}`, {
    x: margin,
    y: cursorY,
    size: 10,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });
  cursorY -= 15;

  if (options.brandName) {
    page.drawText(`To: Compliance Officer / Management, ${options.brandName}`, {
      x: margin,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= 15;
  }

  if (options.productName) {
    page.drawText(`Subject Product: ${options.productName}`, {
      x: margin,
      y: cursorY,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
    cursorY -= 20;
  } else {
    cursorY -= 10;
  }

  // Section 1: Subject Claim
  page.drawText('1. Commercial Claim Under Examination:', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.16),
  });
  cursorY -= 16;

  // Quote box
  page.drawRectangle({
    x: margin,
    y: cursorY - 25,
    width: contentWidth,
    height: 35,
    color: rgb(0.96, 0.98, 0.97),
    borderColor: rgb(0.8, 0.88, 0.84),
    borderWidth: 1,
  });

  const displayClaim =
    result.claimText.length > 85 ? `${result.claimText.slice(0, 82)}...` : result.claimText;

  page.drawText(`"${displayClaim}"`, {
    x: margin + 12,
    y: cursorY - 12,
    size: 10,
    font: fontOblique,
    color: rgb(0.1, 0.2, 0.15),
  });
  cursorY -= 45;

  // Section 2: Technical Assessment & Findings
  page.drawText('2. Regulatory Assessment & Identified Discrepancies:', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.16),
  });
  cursorY -= 16;

  page.drawText(
    `Initial Technical Finding: The claim does not appear to meet regulatory requirements (${result.report.verdict.replace(/_/g, ' ')}).`,
    {
      x: margin,
      y: cursorY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    },
  );
  cursorY -= 15;

  page.drawText(
    `Calculated Compliance Risk Index: ${result.report.riskScore.score} / 100 (${result.report.riskScore.level.toUpperCase()})`,
    {
      x: margin,
      y: cursorY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    },
  );
  cursorY -= 20;

  // Section 3: Governing Provisions & Citations
  page.drawText('3. Cited Regulatory Provisions:', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.16),
  });
  cursorY -= 16;

  const citations =
    result.report.citations.length > 0
      ? result.report.citations
      : ['CCPA Greenwashing Guidelines (2024) - Clause 4(1)'];

  for (const citation of citations.slice(0, 3)) {
    page.drawText(`• ${citation}`, {
      x: margin + 10,
      y: cursorY,
      size: 9,
      font: fontRegular,
      color: rgb(0.15, 0.2, 0.25),
    });
    cursorY -= 14;
  }
  cursorY -= 10;

  // Section 4: Recommended Corrective Actions
  page.drawText('4. Requested Action & Remediation:', {
    x: margin,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.16),
  });
  cursorY -= 16;

  for (const rec of result.recommendations.slice(0, 3)) {
    const wrapped = rec.length > 90 ? `${rec.slice(0, 87)}...` : rec;
    page.drawText(`• ${wrapped}`, {
      x: margin + 10,
      y: cursorY,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    cursorY -= 14;
  }
  cursorY -= 25;

  // Signoff
  page.drawText('Generated for consumer inquiry and voluntary pre-litigation compliance.', {
    x: margin,
    y: cursorY,
    size: 8,
    font: fontOblique,
    color: rgb(0.5, 0.5, 0.5),
  });
  cursorY -= 12;

  page.drawText('GreenClaim Lens — Open Environmental Claim Verification Engine', {
    x: margin,
    y: cursorY,
    size: 8,
    font: fontBold,
    color: rgb(0.06, 0.45, 0.35),
  });

  return pdfDoc.save();
}
