'use client';

import type React from 'react';
import { useState } from 'react';

interface ClaimInputProps {
  onVerify: (claimText: string) => void;
  isLoading: boolean;
}

const EXAMPLE_CLAIMS = [
  '100% eco-friendly packaging with zero waste',
  'Carbon neutral by 2030 with renewable energy transition',
  'Contains 30% recycled ocean plastic certified under ISO 14021',
  'प्राकृतिक और पर्यावरण-अनुकूल सामग्री',
];

export function ClaimInput({ onVerify, isLoading }: ClaimInputProps): React.JSX.Element {
  const [claim, setClaim] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claim.trim() && !isLoading) {
      onVerify(claim);
    }
  };

  const handleSelectExample = (text: string) => {
    setClaim(text);
    onVerify(text);
  };

  return (
    <section
      aria-labelledby="verify-heading"
      className="glass-panel"
      style={{ padding: '1.75rem', marginBottom: '2rem' }}
    >
      <h2
        id="verify-heading"
        style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
          color: 'var(--text-main)',
        }}
      >
        Verify an Environmental Claim
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Paste packaging copy, commercial tagline, or marketing statements to verify compliance with
        CCPA Greenwashing Guidelines 2024.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <textarea
            id="claim-text-input"
            aria-label="Environmental Claim Text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="e.g. 100% eco-friendly packaging, completely biodegradable in nature..."
            rows={3}
            maxLength={4000}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '1rem',
              lineHeight: '1.5',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              bottom: '0.75rem',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
            }}
          >
            {claim.length} / 4000
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="submit"
            id="verify-submit-button"
            className="btn btn-primary"
            disabled={!claim.trim() || isLoading}
          >
            {isLoading ? 'Analyzing Claim...' : 'Verify Claim'}
          </button>

          {claim && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setClaim('')}
              disabled={isLoading}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Clear Input
            </button>
          )}
        </div>
      </form>

      <div>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-dim)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Or try a sample claim:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {EXAMPLE_CLAIMS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleSelectExample(example)}
              disabled={isLoading}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              &ldquo;{example}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
