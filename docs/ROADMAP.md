# Roadmap

Phases are ordered by dependency, not by date. A phase ends when its exit criteria are met.

## Phase 0: Foundations
- Monorepo (pnpm + Turborepo), TypeScript strict, lint/format, CI skeleton
- `.env.example`, contribution guide, issue/PR templates
- **Exit:** `pnpm test` and CI pass on an empty-but-wired repo

## Phase 1: Rule engine and evaluation (core value)
- Gather official source texts; build `data/rules` (draft → reviewed)
- `packages/core`: types, rule runner, verdict aggregation, risk score
- Golden dataset v0 (50+ items) and eval runner
- **Exit:** rules-only baseline metrics recorded; every rule has tests and a source clause

## Phase 2: Retrieval and LLM gateway
- Chunking with stable IDs, hybrid search
- Gateway with at least two providers, failover, caching
- Citation validation and abstention logic
- Prompt-injection red-team tests
- **Exit:** citation validity 100% on golden set; graceful degradation verified by killing providers

## Phase 3: Web app MVP
- Next.js app: text claim → verdict → explanation → "what would help"
- Complaint draft PDF (client-side)
- English UI; accessibility pass
- **Exit:** Playwright E2E green; usable on a mid-range Android phone

## Phase 4: Capture and reach
- In-browser OCR, barcode scan with public product data
- Hindi UI, PWA/offline shell
- **Exit:** photo-to-verdict flow works with weak connectivity; Hindi E2E green

## Phase 5: Experience polish
- 3D results visualisation (lazy-loaded, 2D fallback)
- Motion and micro-interactions, performance budget enforced
- **Exit:** performance budget met on target device; reduced-motion respected

## Phase 6: Platform
- Public API, API keys, rate limits, docs, SDK
- Browser extension (MV3) prototype
- **Exit:** SDK published, API docs live, extension flags claims on a sample shopping page

## Phase 7: Launch hardening
- Complete pre-launch checklist in [SECURITY_PRIVACY.md](SECURITY_PRIVACY.md)
- Legal/consumer-rights review, privacy policy, `SECURITY.md`
- Published `EVAL_RESULTS.md`, demo video, case studies
- **Exit:** public release candidate

## Later ideas
- Community-submitted claims with moderation
- Additional jurisdictions via pluggable rule packs
- Brand-side "pre-publication check" workflow
- Offline on-device model for rule-assist
