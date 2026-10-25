import type React from 'react';
import type { Translations } from '../lib/i18n.js';

interface RecommendationsCardProps {
  recommendations: string[];
  t?: Translations;
}

export function RecommendationsCard({
  recommendations,
  t,
}: RecommendationsCardProps): React.JSX.Element {
  if (recommendations.length === 0) {
    return <></>;
  }

  const title = t?.whatWouldHelpTitle ?? 'What Would Make This Credible?';
  const subtitle =
    t?.whatWouldHelpSubtitle ??
    'Under CCPA 2024 guidelines, environmental assertions can achieve compliance through specific disclosures and verifiable substantiation:';

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="glass-panel"
      style={{ padding: '1.75rem', marginBottom: '2rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <h3
          id="recommendations-heading"
          style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}
        >
          {title}
        </h3>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {subtitle}
      </p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {recommendations.map((rec) => (
          <li
            key={rec}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
            }}
          >
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>&rarr;</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
