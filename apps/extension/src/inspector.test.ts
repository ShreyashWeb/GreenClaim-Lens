// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { runInspection } from './content.js';
import { inspectElement, isCandidateElement, scanDocument } from './inspector.js';
import { updatePopupUI } from './popup.js';

describe('@greenclaim/extension - In-Page Claim Inspector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('filters candidate elements based on green claim triggers', () => {
    const greenEl = document.createElement('p');
    greenEl.textContent = '100% natural organic ingredients with zero chemicals';
    expect(isCandidateElement(greenEl)).toBe(true);

    const normalEl = document.createElement('p');
    normalEl.textContent = 'Net weight 500 grams. Store in a cool dry place.';
    expect(isCandidateElement(normalEl)).toBe(false);

    const scriptEl = document.createElement('script');
    scriptEl.textContent = 'const ecoFriendly = true;';
    expect(isCandidateElement(scriptEl as unknown as HTMLElement)).toBe(false);
  });

  it('inspects element and populates non-accusatory metadata attributes', () => {
    const titleEl = document.createElement('h1');
    titleEl.textContent = 'EcoClean 100% natural organic Dish Liquid';
    document.body.appendChild(titleEl);

    const result = inspectElement(titleEl);
    expect(result).not.toBeNull();
    expect(result?.verdict).toBe('LIKELY_MISLEADING');
    expect(result?.riskScore).toBeGreaterThanOrEqual(70);
    expect(result?.explanation).toContain('does not appear to meet guidelines');

    // Attributes on DOM element
    expect(titleEl.classList.contains('gcl-inspected')).toBe(true);
    expect(titleEl.getAttribute('data-gcl-verdict')).toBe('LIKELY_MISLEADING');
    expect(titleEl.getAttribute('data-gcl-score')).toBeDefined();
    expect(titleEl.getAttribute('data-gcl-explanation')).toContain(
      'does not appear to meet guidelines',
    );
  });

  it('scans a sample shopping page DOM and flags all environmental claims', () => {
    document.body.innerHTML = `
      <div id="product-page">
        <h1 class="product-title">EcoClean 100% natural organic Dish Liquid</h1>
        <p class="brand">By NatureCare Labs</p>
        <div class="product-description">
          <p>Our eco-friendly and green dishwashing formula makes cleaning delightful while protecting waterways.</p>
        </div>
        <ul class="feature-bullets">
          <li>Cuts tough grease instantly with citrus enzymes.</li>
          <li>Eco-friendly bottle made with 70% post-consumer recycled plastic (certified: ISO 14021).</li>
          <li>Net volume: 500 ml. Made in India.</li>
          <li>Committed to becoming completely carbon neutral by 2030 without interim roadmap.</li>
        </ul>
      </div>
    `;

    const summary = scanDocument(document.body);

    expect(summary.claimsFound).toBeGreaterThanOrEqual(3);
    expect(summary.byVerdict.LIKELY_MISLEADING).toBeGreaterThanOrEqual(1);
    expect(summary.byVerdict.VAGUE).toBeGreaterThanOrEqual(1);
    expect(summary.byVerdict.CREDIBLE).toBeGreaterThanOrEqual(1);

    // Verify non-green bullet "Cuts tough grease..." was not flagged as claim
    const greaseBullet = Array.from(document.querySelectorAll('li')).find((li) =>
      li.textContent?.includes('Cuts tough grease'),
    );
    expect(greaseBullet?.classList.contains('gcl-inspected')).toBe(false);
  });

  it('attaches visual badge pills during runInspection()', () => {
    document.body.innerHTML = `
      <div class="product">
        <h2 id="claim1">100% natural organic botanical serum</h2>
        <p id="claim2">Eco-friendly bottle made with 70% post-consumer recycled plastic (certified: ISO 14021)</p>
      </div>
    `;

    const summary = runInspection();
    expect(summary.claimsFound).toBe(2);

    const badges = document.querySelectorAll('.gcl-badge-pill');
    expect(badges.length).toBe(2);

    const misleadingBadge = document.querySelector('.gcl-badge-misleading');
    expect(misleadingBadge).not.toBeNull();
    expect(misleadingBadge?.textContent).toContain('Risk');

    const credibleBadge = document.querySelector('.gcl-badge-credible');
    expect(credibleBadge).not.toBeNull();
    expect(credibleBadge?.textContent).toContain('Credible');
  });

  it('updates popup UI with counts and claim cards', () => {
    document.body.innerHTML = `
      <div id="stat-misleading"></div>
      <div id="stat-vague"></div>
      <div id="stat-credible"></div>
      <div id="claims-container"></div>
    `;

    updatePopupUI({
      success: true,
      total: 2,
      byVerdict: {
        CREDIBLE: 1,
        VAGUE: 0,
        LIKELY_MISLEADING: 1,
        INSUFFICIENT_EVIDENCE: 0,
      },
      claims: [
        {
          text: '100% eco formula',
          verdict: 'LIKELY_MISLEADING',
          riskScore: 85,
          explanation: 'Claim does not appear to meet regulatory standards.',
        },
        {
          text: 'Bottle made with 50% post-consumer recycled PET',
          verdict: 'CREDIBLE',
          riskScore: 10,
          explanation: 'Claim appears to meet guidelines with specific qualifiers.',
        },
      ],
    });

    expect(document.getElementById('stat-misleading')?.textContent).toBe('1');
    expect(document.getElementById('stat-credible')?.textContent).toBe('1');

    const cards = document.querySelectorAll('.claim-item');
    expect(cards.length).toBe(2);
    expect(cards[0]?.textContent).toContain('100% eco formula');
    expect(cards[1]?.textContent).toContain('50% post-consumer recycled');
  });
});
