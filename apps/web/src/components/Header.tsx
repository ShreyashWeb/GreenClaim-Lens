import type React from 'react';
import type { Language } from '../lib/i18n.js';

interface HeaderProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

export function Header({ lang, onToggleLang }: HeaderProps): React.JSX.Element {
  const isHindi = lang === 'hi';

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
            {isHindi ? 'ग्रीनक्लेम लेंस (GreenClaim Lens)' : 'GreenClaim Lens'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isHindi
              ? 'नियामक सत्यापन इंजन · CCPA 2024 दिशानिर्देश'
              : 'Regulatory Verification Engine · CCPA 2024 Standards'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          {isHindi ? 'नियम-आधारित v1.0' : 'Deterministic v1.0'}
        </span>

        {/* English / Hindi Toggle */}
        <div
          style={{
            display: 'inline-flex',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '2px',
          }}
        >
          <button
            type="button"
            id="lang-toggle-en"
            onClick={() => onToggleLang('en')}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: !isHindi ? 'var(--accent-emerald)' : 'transparent',
              color: !isHindi ? '#042f1d' : 'var(--text-muted)',
              fontWeight: !isHindi ? 700 : 500,
              transition: 'var(--transition-smooth)',
            }}
          >
            EN
          </button>
          <button
            type="button"
            id="lang-toggle-hi"
            onClick={() => onToggleLang('hi')}
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isHindi ? 'var(--accent-emerald)' : 'transparent',
              color: isHindi ? '#042f1d' : 'var(--text-muted)',
              fontWeight: isHindi ? 700 : 500,
              transition: 'var(--transition-smooth)',
            }}
          >
            हिन्दी
          </button>
        </div>
      </div>
    </header>
  );
}
