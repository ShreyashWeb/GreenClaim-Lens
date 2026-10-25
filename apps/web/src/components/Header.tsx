import type React from 'react';

export function Header(): React.JSX.Element {
  return (
    <header
      className="glass-panel"
      style={{
        padding: '1.25rem 1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            fontSize: '1.25rem',
          }}
        >
          🌿
        </div>
        <div>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
            }}
          >
            GreenClaim Lens
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Regulatory Verification Engine &middot; CCPA 2024 Standards
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--accent-emerald)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-emerald)',
              display: 'inline-block',
            }}
          />
          Deterministic Engine v1.0
        </span>
      </div>
    </header>
  );
}
