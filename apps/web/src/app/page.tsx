'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { BarcodeModal } from '../components/BarcodeModal.js';
import { CaptureModal } from '../components/CaptureModal.js';
import { ClaimInput } from '../components/ClaimInput.js';
import { EvidenceList } from '../components/EvidenceList.js';
import { Header } from '../components/Header.js';
import { PdfModal } from '../components/PdfComplaintButton.js';
import { RecommendationsCard } from '../components/RecommendationsCard.js';
import { VerdictCard } from '../components/VerdictCard.js';
import { type Language, TRANSLATIONS } from '../lib/i18n.js';
import { type VerificationResult, verifyClaim } from '../lib/verifier.js';

export default function HomePage(): React.JSX.Element {
  const [lang, setLang] = useState<Language>('en');
  const [claimText, setClaimText] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  // Register PWA service worker on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('PWA ServiceWorker registration failed:', err);
        });
      });
    }
  }, []);

  const handleVerify = async (text: string) => {
    setClaimText(text);
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyClaim(text);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextExtractedFromOcr = (extracted: string) => {
    setClaimText(extracted);
    handleVerify(extracted);
  };

  const handleClaimSelectedFromBarcode = (selectedClaim: string) => {
    setClaimText(selectedClaim);
    handleVerify(selectedClaim);
  };

  return (
    <main className="container">
      <Header lang={lang} onToggleLang={setLang} />

      <ClaimInput
        onVerify={handleVerify}
        isLoading={isLoading}
        t={t}
        onOpenCapture={() => setIsCaptureModalOpen(true)}
        onOpenBarcode={() => setIsBarcodeModalOpen(true)}
        claimValue={claimText}
      />

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
          <VerdictCard result={result} onOpenPdfModal={() => setIsPdfModalOpen(true)} t={t} />

          <RecommendationsCard recommendations={result.recommendations} t={t} />

          <EvidenceList result={result} />

          <PdfModal
            result={result}
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
            t={t}
          />
        </>
      )}

      {/* OCR Capture Modal */}
      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onTextExtracted={handleTextExtractedFromOcr}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onClaimSelected={handleClaimSelectedFromBarcode}
      />

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
        <p>
          {t.appName} &middot; {t.appTagline}
        </p>
        <p style={{ marginTop: '0.25rem' }}>{t.disclaimer}</p>
      </footer>
    </main>
  );
}
