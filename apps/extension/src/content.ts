/**
 * GreenClaim Lens - Browser Extension Content Script
 * Injected into active shopping pages to detect and highlight environmental claims.
 */

import { type InspectionSummary, scanDocument } from './inspector.js';

let latestSummary: InspectionSummary | null = null;

export function runInspection(): InspectionSummary {
  const summary = scanDocument(document);
  latestSummary = summary;

  // Append badge pills next to flagged elements
  for (const claim of summary.claims) {
    if (claim.element.querySelector('.gcl-badge-pill')) continue;

    const badge = document.createElement('span');
    badge.className = 'gcl-badge-pill';

    if (claim.verdict === 'LIKELY_MISLEADING') {
      badge.classList.add('gcl-badge-misleading');
      badge.textContent = `⚠️ Risk ${claim.riskScore}`;
      badge.title = `${claim.explanation} (CCPA 2024)`;
    } else if (claim.verdict === 'VAGUE') {
      badge.classList.add('gcl-badge-vague');
      badge.textContent = `ℹ️ Vague ${claim.riskScore}`;
      badge.title = claim.explanation;
    } else if (claim.verdict === 'CREDIBLE') {
      badge.classList.add('gcl-badge-credible');
      badge.textContent = '✓ Credible';
      badge.title = claim.explanation;
    }

    claim.element.appendChild(badge);
  }

  // Notify extension runtime if available
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage({
        type: 'GCL_CLAIMS_FOUND',
        summary: {
          total: summary.claimsFound,
          byVerdict: summary.byVerdict,
        },
      });
    } catch {
      // Ignored if runtime not listening
    }
  }

  return summary;
}

// Auto-run when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runInspection());
  } else {
    runInspection();
  }

  // Handle messages from popup
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener(
      (request: { action?: string }, _sender: unknown, sendResponse: (res: unknown) => void) => {
        if (request.action === 'GET_PAGE_SUMMARY') {
          const summary = latestSummary ?? runInspection();
          sendResponse({
            success: true,
            total: summary.claimsFound,
            byVerdict: summary.byVerdict,
            claims: summary.claims.map((c) => ({
              text: c.text,
              verdict: c.verdict,
              riskScore: c.riskScore,
              explanation: c.explanation,
            })),
          });
        }
        return true;
      },
    );
  }
}
