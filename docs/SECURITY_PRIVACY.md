# Security, Privacy & Legal

## 1. Legal positioning

- GreenClaim Lens provides an **automated risk indicator**. It is **not legal advice**, a certification, or a regulatory finding.
- Language in the UI and API avoids asserting that a brand "lied". Preferred phrasing: "This claim does not appear to meet <rule> because ...".
- No public brand rankings, "wall of shame", or aggregate accusations in v1.
- Obtain review from a qualified lawyer or consumer-rights organisation before public launch, particularly for the rule base and complaint templates.
- Respect third-party content: store only claim text and a source link; do not redistribute copyrighted images.

## 2. Privacy principles

- **Anonymous by default.** Accounts optional.
- **Images are processed in the browser** where possible and not uploaded or stored by default. If a vision-LLM fallback needs the image, ask for consent first and state which provider receives it.
- **Free AI tiers may use inputs to improve their models.** Therefore send only claim text and retrieved public clauses; never send names, contact info, or personal photos.
- Log minimally: request ID, timings, verdict class, versions. No IP retention beyond rate-limit windows.
- Provide data deletion for any account-linked history.
- Publish a plain-language privacy policy and cookie/analytics notice (analytics opt-out).

## 3. Threat model (summary)

| Threat | Control |
|---|---|
| Prompt injection via claim text or OCR text | Treat all input as data; strict schemas; no tool access for the LLM; ignore instructions in input; red-team tests in CI |
| Hallucinated citations | Server validates citations against retrieved chunk IDs; otherwise abstain |
| Quota exhaustion / abuse | Turnstile, per-IP and per-key limits, caching, request size limits |
| Secret leakage | Secrets only in platform secret stores; `.env*` git-ignored; secret scanning in CI |
| XSS / injection | Strict output encoding, CSP, Zod validation on all inputs |
| Dependency compromise | Pin versions, lockfile review, avoid very new package releases where practical, audit in CI |
| Malicious file uploads | Type and size checks, process client-side, no server execution of uploads |
| Data scraping of API | API keys, rate limits, caching headers |

## 4. Secure development

- TypeScript strict mode, ESLint/Biome, no `any` in core.
- Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
- Dependabot/Renovate + `pnpm audit` in CI.
- Responsible disclosure: `SECURITY.md` with a contact address (to be added before public release).

## 5. Accessibility and inclusion

- WCAG 2.2 AA target; keyboard and screen-reader support.
- Hindi parity with English for all core flows.
- Reduced-motion and low-end-device fallbacks for 3D.

## 6. Pre-launch checklist

- [ ] Rule base verified against official texts and reviewed
- [ ] Legal/consumer-rights review of disclaimers and complaint template
- [ ] Privacy policy and terms published
- [ ] Eval hard gates passing (citation validity 100%, false-accusation ceiling met)
- [ ] Abuse controls and rate limits tested
- [ ] Incident contact and `SECURITY.md` in place
