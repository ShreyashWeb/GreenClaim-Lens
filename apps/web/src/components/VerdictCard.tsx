'use client';

import type React from 'react';
import type { Translations } from '../lib/i18n.js';
import type { VerificationResult } from '../lib/verifier.js';

interface VerdictCardProps {
  result: VerificationResult;
  onOpenPdfModal: () => void;
  t: Translations;
}

export function VerdictCard({ result, onOpenPdfModal, t }: VerdictCardProps): React.JSX.Element {
  const { verdict, riskScore, explanation, citations } = result.report;

  const getVerdictTheme = () => {
    switch (verdict) {
      case 'CREDIBLE':
        return {
          title: t.verdictThemes.credible.title,
          color: 'var(--verdict-credible)',
          bgColor: 'var(--verdict-credible-bg)',
          borderColor: 'var(--verdict-credible-border)',
          icon: '✓',
          badgeText: t.verdictThemes.credible.badge,
        };
      case 'VAGUE':
        return {
          title: t.verdictThemes.vague.title,
          color: 'var(--verdict-vague)',
          bgColor: 'var(--verdict-vague-bg)',
          borderColor: 'var(--verdict-vague-border)',
          icon: '⚠',
          badgeText: t.verdictThemes.vague.badge,
        };
      case 'LIKELY_MISLEADING':
        return {
          title: t.verdictThemes.misleading.title,
          color: 'var(--verdict-misleading)',
          bgColor: 'var(--verdict-misleading-bg)',
          borderColor: 'var(--verdict-misleading-border)',
          icon: '✕',
          badgeText: t.verdictThemes.misleading.badge,
        };
      default:
        return {
          title: t.verdictThemes.insufficient.title,
          color: 'var(--verdict-insufficient)',
          bgColor: 'var(--verdict-insufficient-bg)',
          borderColor: 'var(--verdict-insufficient-border)',
          icon: '?',
          badgeText: t.verdictThemes.insufficient.badge,
        };
    }
  };

  const theme = getVerdictTheme();
  const riskLabel = t.riskLevels[riskScore.level];

  return (
    <article
      id="verdict-result-card"
      aria-labelledby="verdict-title"
      className="glass-panel"
      style={{
        padding: '2rem',
        marginBottom: '2rem',
        borderLeft: `5px solid ${theme.color}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: theme.bgColor,
              border: `1px solid ${theme.borderColor}`,
              color: theme.color,
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span>{theme.icon}</span>
            <span>{theme.badgeText}</span>
          </div>
          <h2
            id="verdict-title"
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
            }}
          >
            {theme.title}
          </h2>
        </div>

        {/* Risk Score Gauge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            minWidth: '120px',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {t.riskIndex}
          </span>
          <span
            id="risk-score-value"
            style={{ fontSize: '2rem', fontWeight: 800, color: theme.color, lineHeight: 1.1 }}
          >
            {riskScore.score}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {riskLabel}
          </span>
        </div>
      </div>

      {/* Quoted Claim Text */}
      <blockquote
        style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderLeft: '3px solid var(--border-subtle)',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          marginBottom: '1.5rem',
          fontStyle: 'italic',
          color: 'var(--text-muted)',
        }}
      >
        &ldquo;{result.claimText}&rdquo;
      </blockquote>

      {/* Explanation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
            marginBottom: '0.5rem',
          }}
        >
          {t.assessmentTitle}
        </h3>
        <p
          id="verdict-explanation"
          style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-main)' }}
        >
          {explanation}
        </p>
      </div>

      {/* Regulatory Citations */}
      {citations.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <h3
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-dim)',
              marginBottom: '0.6rem',
            }}
          >
            {t.provisionsTitle}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {citations.map((citation) => (
              <span
                key={citation}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                📜 {citation}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.25rem',
        }}
      >
        <button
          type="button"
          id="generate-pdf-button"
          className="btn btn-secondary"
          onClick={onOpenPdfModal}
          style={{ fontSize: '0.875rem' }}
        >
          {t.exportNoticeButton}
        </button>
      </div>
    </article>
  );
}
