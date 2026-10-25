# Product Requirements Document

## 1. Problem

Consumers cannot verify environmental marketing claims. Regulators have published rules, but nobody translates them into a check a shopper can run in seconds. Complaints, when made, are often vague and unsupported.

## 2. Vision

Anyone in India can check an environmental claim in under 10 seconds, understand why it passes or fails, and act on it.

## 3. Target users

| Persona | Need |
|---|---|
| Everyday shopper | Quick, plain-language check on a product claim |
| Student / journalist | Cited analysis they can reference |
| Small brand / D2C founder | Pre-publication check that their own claims are defensible |
| Developer | API to embed claim checking elsewhere |

## 4. Goals

- G1: Explainable verdicts that always cite the rule or evidence used.
- G2: Run entirely on free tiers at modest scale, with graceful degradation.
- G3: Measurable quality via a public golden dataset and CI-gated metrics.
- G4: Privacy-first: no image storage by default, no required account.
- G5: Usable on mid-range Android phones with poor connectivity.

## 5. Non-goals

- Not a legal opinion or a certification body.
- Not a brand-ranking or public shaming platform.
- Not a general ESG scoring tool for investors (v1).
- No monetisation features in v1.

## 6. Core user stories

1. As a shopper, I paste "100% eco-friendly packaging" and see a verdict with the reason in plain language.
2. As a shopper, I photograph a label and the claims are extracted automatically.
3. As a shopper, I scan a barcode and see public product data alongside the claim check.
4. As a shopper, I generate a complaint draft I can review and submit myself.
5. As a brand founder, I check my draft copy before publishing.
6. As a developer, I call `/v1/verify-claim` with an API key.
7. As a Hindi speaker, I use the full app in Hindi.

## 7. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Text claim input and structured claim extraction | P0 |
| FR-2 | Deterministic rule evaluation with rule IDs | P0 |
| FR-3 | Retrieval of relevant guideline clauses with citations | P0 |
| FR-4 | LLM judgment limited to retrieved context; must cite or abstain | P0 |
| FR-5 | Four-state verdict incl. `INSUFFICIENT_EVIDENCE` | P0 |
| FR-6 | Result page with explanation, risk score, "what would make this credible" | P0 |
| FR-7 | Complaint draft PDF generated client-side | P1 |
| FR-8 | Image OCR in browser, vision-LLM fallback | P1 |
| FR-9 | Barcode scan and public product data enrichment | P1 |
| FR-10 | English + Hindi UI | P1 |
| FR-11 | PWA / offline shell and cached history | P2 |
| FR-12 | Public API with keys and rate limits | P1 |
| FR-13 | 3D results visualisation with 2D fallback | P2 |
| FR-14 | Browser extension | P3 |

## 8. Non-functional requirements

- **Explainability:** every verdict traceable to rule IDs and source clauses.
- **Reliability:** if all LLM providers fail, rule-engine-only verdicts still return, clearly marked as partial.
- **Performance:** p75 time-to-verdict target under 5 s for rule-only, under 12 s with LLM (to be validated).
- **Accessibility:** WCAG 2.2 AA target, reduced-motion respected.
- **Cost:** runs within free tiers; cache by normalised claim hash.
- **Auditability:** each result records rule-base version and model identifiers.

## 9. Success metrics

- Macro-F1 and clause-citation accuracy on the golden dataset (thresholds set after baseline, see EVALUATION.md).
- False-accusation rate (claims wrongly marked `LIKELY_MISLEADING`) kept at the lowest priority-weighted level.
- Share of requests answered without an LLM call.
- Task completion: claim to verdict without error.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Defamation / false accusation | Risk-indicator language, cite rules, abstain, no brand leaderboards |
| Free-tier quota loss | Gateway failover, caching, rule-first design |
| Misreading the guidelines | Rule base reviewed against official text; versioned; legal review before public launch |
| LLM hallucinated citations | Citations must match retrieved chunk IDs; validated server-side |
| Abuse / scraping | Turnstile, rate limits, API keys |
| Privacy | No image storage by default, minimal logging |

## 11. Open questions

- Which official texts are authoritative for each rule (to be linked in `data/rules`)?
- Is a lawyer or consumer-rights group available to review the rule base?
- Which complaint channels and formats are currently accepted?
