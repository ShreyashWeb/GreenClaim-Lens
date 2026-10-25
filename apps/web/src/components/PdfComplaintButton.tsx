'use client';

import type React from 'react';
import { useState } from 'react';
import { generateComplaintPdf } from '../lib/pdf-generator.js';
import type { VerificationResult } from '../lib/verifier.js';

interface PdfModalProps {
  result: VerificationResult;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfModal({ result, isOpen, onClose }: PdfModalProps): React.JSX.Element {
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return <></>;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await generateComplaintPdf(result, {
        productName: productName.trim() || undefined,
        brandName: brandName.trim() || undefined,
      });

      // Browser download trigger
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GreenClaim-Notice-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <dialog
      open
      aria-labelledby="pdf-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        border: 'none',
        zIndex: 1000,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3
          id="pdf-modal-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
          }}
        >
          Export Formal Grievance Notice
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Generate a pre-formatted inquiry letter citing CCPA 2024 provisions and identifying claim
          compliance discrepancies for corporate or statutory inquiry.
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="brand-name-input"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '0.35rem',
            }}
          >
            Brand / Manufacturer Name (Optional)
          </label>
          <input
            id="brand-name-input"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Acme Wellness Foods Pvt Ltd"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label
            htmlFor="product-name-input"
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              marginBottom: '0.35rem',
            }}
          >
            Product / Service Name (Optional)
          </label>
          <input
            id="product-name-input"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. 100% Eco Bamboo Toothbrush"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="button"
            id="download-pdf-confirm-button"
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
