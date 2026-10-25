# Progress Tracking

This document tracks progress against the phases outlined in [docs/ROADMAP.md](docs/ROADMAP.md) and user directives.

Rule: Tick tasks with a one-line note on how you verified them.

## Phase 0: Foundations
- [x] Task 0.1: Monorepo workspace configuration (`pnpm-workspace.yaml`, root `package.json`, `turbo.json`) — Verified via `pnpm install` and Turborepo pipeline configuration.
- [x] Task 0.2: Root TypeScript strict configuration (`tsconfig.base.json`, root `tsconfig.json`) and Biome linter/formatter (`biome.json`) — Verified via `pnpm lint` and `tsc --noEmit`.
- [x] Task 0.3: Wire `packages/core` skeleton with strict TS and unit test runner (Vitest) — Verified via `vitest run` passing 3 unit tests in `packages/core`.
- [x] Task 0.4: Wire `packages/eval` skeleton and root `pnpm eval` script — Verified via `pnpm eval` running baseline golden evaluation.
- [x] Task 0.5: Monorepo verification scripts (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm eval`) — Verified via clean execution of all 4 scripts with exit code 0.
- [x] Task 0.6: GitHub Actions CI workflow skeleton (`.github/workflows/ci.yml`) — Verified via YAML linting and validation of step definitions.
- [x] Task 0.7: GitHub issue and PR templates (`.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`) — Verified template files presence and checklist alignment.
- [x] Task 0.8: Phase 0 exit criteria verification (all commands pass cleanly on empty-but-wired repo) — Verified via chained run `pnpm lint ; pnpm typecheck ; pnpm test ; pnpm eval` returning 0.

### Phase 0 Summary & Exit Criteria
Phase 0 Foundations are complete: The Turborepo monorepo with pnpm workspaces is initialized, strict TypeScript and Biome configs are active, pure `@greenclaim/core` and `@greenclaim/eval` are wired with test-first unit suites, root scripts (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm eval`) run and pass 100% green, and CI / template skeletons are deployed. Exit criteria met.

## Phase 1: Rule Engine and Evaluation (Core Value)
- [x] Task 1.1: Core Types & Schemas in `packages/core` (Claim, Rule, RuleHit, Verdict, RiskScore) — Verified via 6 Zod schema test suites and full typecheck across workspace.
- [x] Task 1.2: Deterministic Rule Runner in `packages/core` (lexicon, regex, qualifiers, evidence spans) — Verified via 5 rule runner unit tests covering flags, passes, n/a, multi-rule, and unicode normalization.
- [x] Task 1.3: Verdict Aggregation & Risk Scoring in `packages/core` (4-state verdicts, risk score 0-100) — Verified via 6 verdict unit tests enforcing 'does not appear to meet' wording, cite-or-abstain, and bounded risk scoring.
- [x] Task 1.4: Rule definitions in `data/rules/` with tests & source clauses (logging unverified clauses to `NEEDS_HUMAN.md`) — Verified via 33 test cases across 8 rules in `packages/core/src/default-rules.test.ts` and logged 8 unverified clause entries in `NEEDS_HUMAN.md`.
- [ ] Task 1.5: Golden Dataset v0 in `data/golden/` (50+ labelled items across categories and verdicts)
- [ ] Task 1.6: Evaluation harness in `packages/eval` (Macro-F1, per-class metrics, false-accusation rate)
- [ ] Task 1.7: `pnpm eval` benchmark reporting baseline rules-only metrics
- [ ] Task 1.8: Phase 1 exit criteria verification & summary

## Phase 2: Retrieval and LLM Gateway
- [ ] Guidelines chunking and indexing in `packages/retrieval`
- [ ] Hybrid search (BM25 + vector ranking)
- [ ] Provider-agnostic LLM gateway in `packages/llm-gateway`
- [ ] Gateway failover, circuit breaker, caching
- [ ] Citation validation & abstention logic
- [ ] Red-team prompt injection tests

## Phase 3: Web App MVP
- [ ] Next.js app in `apps/web` with App Router, Tailwind, TypeScript strict
- [ ] Text claim input -> verdict -> explanation -> "what would make this credible"
- [ ] Client-side complaint draft PDF generator (`pdf-lib`)
- [ ] Accessible UI (WCAG 2.2 AA compliant, reduced-motion)

## Phase 4: Capture and Reach
- [ ] In-browser OCR (Tesseract.js) with vision-LLM fallback
- [ ] Barcode scanning with public product lookup
- [ ] Hindi localization (en/hi toggle with full parity)
- [ ] PWA & offline shell

## Phase 5: Experience Polish
- [ ] Interactive results visualization (with 2D fallback for low-end / reduced-motion)
- [ ] Smooth micro-interactions & performance budget

## Phase 6: Platform & API
- [ ] Hono API on Cloudflare Workers in `apps/api`
- [ ] OpenAPI 3.1 specification & typed SDK in `packages/sdk`
- [ ] API key rate limiting & Turnstile protection
- [ ] Browser extension prototype (MV3)

## Phase 7: Launch Hardening
- [ ] Security audit & `SECURITY.md`
- [ ] Evaluation gate passing thresholds
- [ ] Documentation and release candidate readiness
