import type React from 'react';
import type { VerificationResult } from '../lib/verifier.js';

interface EvidenceListProps {
  result: VerificationResult;
}

export function EvidenceList({ result }: EvidenceListProps): React.JSX.Element {
  const { ruleHits } = result.report;
  const { retrievedChunks } = result;

  return (
    <section
      aria-labelledby="evidence-heading"
      className="glass-panel"
      style={{ padding: '1.75rem', marginBottom: '2rem' }}
    >
      <h3
        id="evidence-heading"
        style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
        }}
      >
        Detailed Rule Evaluation & Retrieved Clauses
      </h3>

      {/* Rules evaluation breakdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4
          style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
            marginBottom: '0.75rem',
          }}
        >
          Rule Checks ({ruleHits.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {ruleHits.map((hit) => {
            const isFlag = hit.outcome === 'flag';
            const isPass = hit.outcome === 'pass';
            const statusColor = isFlag
              ? 'var(--verdict-misleading)'
              : isPass
                ? 'var(--verdict-credible)'
                : 'var(--text-dim)';
            const statusText = isFlag ? 'FLAG' : isPass ? 'PASS' : 'N/A';

            return (
              <div
                key={hit.rule_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <span
                    style={{ fontWeight: 600, color: 'var(--text-main)', marginRight: '0.5rem' }}
                  >
                    {hit.rule_id}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{hit.reason}</span>
                  {hit.evidence && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--accent-teal)',
                        marginTop: '0.2rem',
                      }}
                    >
                      Evidence: {hit.evidence}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: `${statusColor}22`,
                    color: statusColor,
                    border: `1px solid ${statusColor}44`,
                  }}
                >
                  {statusText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retrieved Official Corpus Clauses */}
      {retrievedChunks.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-dim)',
              marginBottom: '0.75rem',
            }}
          >
            Retrieved Context Clauses (Hybrid BM25 + Vector)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {retrievedChunks.map(({ chunk, score }) => (
              <div
                key={chunk.id}
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span
                    style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)' }}
                  >
                    {chunk.document} &middot; {chunk.clause} &middot; {chunk.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    relevance {score.toFixed(2)}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {chunk.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
