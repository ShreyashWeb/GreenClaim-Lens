/**
 * GreenClaim Lens - Extension Popup Controller
 */

export interface PageClaimPayload {
  text: string;
  verdict: 'CREDIBLE' | 'VAGUE' | 'LIKELY_MISLEADING' | 'INSUFFICIENT_EVIDENCE';
  riskScore: number;
  explanation: string;
}

export interface PageSummaryResponse {
  success: boolean;
  total: number;
  byVerdict: {
    CREDIBLE: number;
    VAGUE: number;
    LIKELY_MISLEADING: number;
    INSUFFICIENT_EVIDENCE: number;
  };
  claims: PageClaimPayload[];
}

export function updatePopupUI(data: PageSummaryResponse): void {
  const statMisleading = document.getElementById('stat-misleading');
  const statVague = document.getElementById('stat-vague');
  const statCredible = document.getElementById('stat-credible');
  const container = document.getElementById('claims-container');

  if (statMisleading) statMisleading.textContent = data.byVerdict.LIKELY_MISLEADING.toString();
  if (statVague) statVague.textContent = data.byVerdict.VAGUE.toString();
  if (statCredible) statCredible.textContent = data.byVerdict.CREDIBLE.toString();

  if (!container) return;
  container.innerHTML = '';

  if (data.claims.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        No environmental marketing claims detected on this page.
      </div>
    `;
    return;
  }

  for (const claim of data.claims) {
    const card = document.createElement('div');
    card.className = 'claim-item';

    const color =
      claim.verdict === 'LIKELY_MISLEADING'
        ? '#f43f5e'
        : claim.verdict === 'VAGUE'
          ? '#f59e0b'
          : '#10b981';

    card.innerHTML = `
      <div class="claim-header">
        <span style="color: ${color}">${claim.verdict.replace('_', ' ')}</span>
        <span>Risk ${claim.riskScore}/100</span>
      </div>
      <div class="claim-text">"${claim.text}"</div>
      <div class="claim-exp">${claim.explanation}</div>
    `;
    container.appendChild(card);
  }
}

// Initialize popup query
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: Array<{ id?: number }>) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) return;

        chrome.tabs.sendMessage(
          activeTab.id,
          { action: 'GET_PAGE_SUMMARY' },
          (response?: PageSummaryResponse) => {
            if (response?.success) {
              updatePopupUI(response);
            } else {
              updatePopupUI({
                success: true,
                total: 0,
                byVerdict: {
                  CREDIBLE: 0,
                  VAGUE: 0,
                  LIKELY_MISLEADING: 0,
                  INSUFFICIENT_EVIDENCE: 0,
                },
                claims: [],
              });
            }
          },
        );
      });
    }
  });
}
