'use client';

import type React from 'react';
import { useState } from 'react';
import { ClaimInput } from '../components/ClaimInput.js';
import { EvidenceList } from '../components/EvidenceList.js';
import { Header } from '../components/Header.js';
import { PdfModal } from '../components/PdfComplaintButton.js';
import { RecommendationsCard } from '../components/RecommendationsCard.js';
import { VerdictCard } from '../components/VerdictCard.js';
import { type VerificationResult, verifyClaim } from '../lib/verifier.js';

export default function HomePage(): React.JSX.Element {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handleVerify = async (claimText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyClaim(claimText);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <Header />

      <ClaimInput onVerify={handleVerify} isLoading={isLoading} />

      {error && (
        <div
          role="alert"
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--verdict-misleading)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <>
          <VerdictCard result={result} onOpenPdfModal={() => setIsPdfModalOpen(true)} />

          <RecommendationsCard recommendations={result.recommendations} />

          <EvidenceList result={result} />

          <PdfModal
            result={result}
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
          />
        </>
      )}

      <footer
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          lineHeight: '1.6',
        }}
      >
        <p>GreenClaim Lens &middot; Open Environmental Claim Verification Engine.</p>
        <p style={{ marginTop: '0.25rem' }}>
          Assessments indicate technical compliance against CCPA 2024 Greenwashing Guidelines and
          Ecomark Rules. All findings strictly reflect evidentiary substantiation criteria and do
          not constitute legal rulings.
        </p>
      </footer>
    </main>
  );
}
