'use client';

import type React from 'react';
import { useState } from 'react';
import { type ProductData, lookupProductByBarcode } from '../lib/barcode.js';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSelected: (claim: string) => void;
}

const SAMPLE_BARCODES = [
  { code: '8901030382345', label: 'Bamboo Toothbrush (Biodegradable)' },
  { code: '8901058852394', label: 'Herbal Cleanser (100% Natural)' },
  { code: '8902519001234', label: 'Recycled Paper Note Pad (ISO 14021)' },
];

export function BarcodeModal({
  isOpen,
  onClose,
  onClaimSelected,
}: BarcodeModalProps): React.JSX.Element {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [productResult, setProductResult] = useState<ProductData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return <></>;

  const handleLookup = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setErrorMessage('');
    setProductResult(null);

    try {
      const data = await lookupProductByBarcode(trimmed);
      if (data.found) {
        setProductResult(data);
      } else {
        setErrorMessage(`No public product data found for barcode ${trimmed}.`);
      }
    } catch {
      setErrorMessage('Failed to query product database.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectClaim = (claimText: string) => {
    onClaimSelected(claimText);
    onClose();
  };

  return (
    <dialog
      open
      aria-labelledby="barcode-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          maxWidth: '540px',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <h3
          id="barcode-modal-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
          }}
        >
          🏷️ Barcode Lookup & Environmental Registry
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Scan or enter an EAN-13/UPC product barcode to retrieve certified packaging claims from
          public registries.
        </p>

        {/* Input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input
            id="barcode-input-field"
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="e.g. 8901030382345"
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleLookup(barcodeInput)}
            disabled={!barcodeInput.trim() || isSearching}
          >
            {isSearching ? 'Looking up...' : 'Search'}
          </button>
        </div>

        {/* Sample chips */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}
          >
            Or test a registered sample barcode:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
            {SAMPLE_BARCODES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setBarcodeInput(item.code);
                  handleLookup(item.code);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.6rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              color: 'var(--verdict-misleading)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Results */}
        {productResult && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: 'var(--text-main)',
                fontSize: '1rem',
                marginBottom: '0.2rem',
              }}
            >
              {productResult.name || 'Product'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
              {productResult.brand} &middot; {productResult.category || 'General FMCG'}
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '0.4rem',
              }}
            >
              Packaging Claims on Record:
            </div>
            {productResult.packagingClaims.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {productResult.packagingClaims.map((claim) => (
                  <button
                    key={claim}
                    type="button"
                    onClick={() => handleSelectClaim(claim)}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    👉 &ldquo;{claim}&rdquo; &middot;{' '}
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      Verify this claim
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                No explicit environmental claims registered for this item.
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
