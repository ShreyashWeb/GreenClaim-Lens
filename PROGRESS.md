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
- [x] Task 1.5: Golden Dataset v0 in `data/golden/` (50+ labelled items across categories and verdicts) — Verified via 52 curated golden cases balanced across all 4 verdicts, checked by `packages/core/src/golden-schema.test.ts`.
- [x] Task 1.6: Evaluation harness in `packages/eval` (Macro-F1, per-class metrics, false-accusation rate) — Verified via 3 unit tests in `packages/eval` covering confusion matrix, per-class precision/recall, and false-accusation rate detection.
- [x] Task 1.7: `pnpm eval` benchmark reporting baseline rules-only metrics — Verified via `pnpm eval` evaluating 52 golden cases with 97.0% Macro-F1, 98.1% accuracy, 0.0% false-accusation rate, and writing `docs/EVAL_RESULTS.md`.
- [x] Task 1.8: Phase 1 exit criteria verification & summary — Verified all Phase 1 exit criteria met with 100% green tests and typecheck across monorepo.

### Phase 1 Summary & Exit Criteria
Phase 1 (Rule Engine and Evaluation) is complete: The pure rule engine in `@greenclaim/core` (types, boundary-aware lexicon/regex matcher, non-accusatory verdict aggregator, and risk scorer) operates deterministically with zero I/O. 8 foundational rules with embedded test cases are defined in `data/rules/` (unverified legal text items logged to `NEEDS_HUMAN.md`). The 52-case golden dataset v0 in `data/golden/` was benchmarked via `packages/eval`, achieving a 97.0% Macro-F1 score, 98.1% overall accuracy, 0.0% false-accusation rate, and 100% citation validity with results documented in `docs/EVAL_RESULTS.md`. All exit criteria met.

## Phase 2: Retrieval and LLM Gateway
- [x] Task 2.1: Guidelines chunker with stable chunk IDs & metadata in `packages/retrieval` — Verified via 3 unit tests in `chunker.test.ts` ensuring deterministic `ch_<doc>_<clause>` IDs, token extraction, and official corpus chunking.
- [x] Task 2.2: Hybrid retrieval engine (keyword BM25 + vector search + Reciprocal Rank Fusion) in `packages/retrieval` — Verified via 3 unit tests in `hybrid-retriever.test.ts` testing BM25 token weighting, cosine similarity vector search, and RRF rank fusion.
- [x] Task 2.3: Provider-agnostic LLM Gateway interface & provider adapters (mock, Gemini, Groq) in `packages/llm-gateway` — Verified via `gateway.test.ts` testing `MockProviderAdapter` and adapter interfaces conforming to `LLMProviderAdapter`.
- [x] Task 2.4: Circuit breaker, failover order, and SHA-256 prompt response caching in `packages/llm-gateway` — Verified via `gateway.test.ts` confirming SHA-256 prompt response caching and circuit breaker tripping after consecutive failure threshold.
- [x] Task 2.5: Server-side citation validation & strict abstention logic (`INSUFFICIENT_EVIDENCE`) — Verified via `validateAndEnforceCitations` test suite in `gateway.test.ts` forcing `unsure` outcome and citation strip on hallucinated or missing chunk references.
- [x] Task 2.6: Red-team prompt-injection tests (adversarial claim injections, oversized payloads) — Verified via 4 security tests in `red-team.test.ts` protecting against zero-width unicode bypasses, prompt injection instructions, and oversized payload DOS.
- [x] Task 2.7: Graceful degradation testing (killing providers yields rule-only partial response) — Verified via dedicated test in `gateway.test.ts` proving zero unhandled exceptions and graceful fallback to `unsure` when all upstream providers fail.
- [x] Task 2.8: Phase 2 exit criteria verification & summary (100% citation validity, graceful failover verified) — Verified full monorepo pipeline: `pnpm lint`, `pnpm typecheck`, `pnpm test` (82 tests passing), and `pnpm eval` (100% citation validity, 0.0% false accusations).

### Phase 2 Summary & Exit Criteria
Phase 2 (Retrieval and LLM Gateway) is complete: The guidelines chunker in `@greenclaim/retrieval` generates deterministic stable chunk identifiers with BM25 tokenization. The hybrid retrieval engine merges keyword and dense vector search via Reciprocal Rank Fusion (RRF). The provider-agnostic LLM Gateway in `@greenclaim/llm-gateway` supports mock, Gemini, and Groq providers with priority failover, SHA-256 prompt response caching, and per-provider circuit breakers. Crucially, server-side citation validation enforces strict citation matching against retrieved chunks, forcing abstention (`unsure`) upon hallucinated or missing citations. Red-team tests protect against prompt injections, hidden Unicode characters, and oversized payloads. Graceful degradation when all providers fail is verified. All exit criteria met.

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
