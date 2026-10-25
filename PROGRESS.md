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
- [x] Task 3.1: Configure Next.js App Router, React, and modern Vanilla CSS design system in `apps/web` — Verified via successful Next.js 16 Turbopack production compilation and strict TypeScript resolution across workspace packages.
- [x] Task 3.2: Implement claim verification runner & evaluation logic in `apps/web` using `@greenclaim/core` — Verified via `verifyClaim` in `apps/web/src/index.test.ts` ensuring deterministic evaluation, risk scoring, and context retrieval.
- [x] Task 3.3: Build Claim Input UI and Verdict Card ("does not appear to meet", risk score gauge, "what would help" recommendations) — Verified component suite (`ClaimInput`, `VerdictCard`, `RecommendationsCard`, `EvidenceList`) enforcing non-accusatory copy and official CCPA citations.
- [x] Task 3.4: Implement client-side Complaint Draft PDF generator using `pdf-lib` with official clause citations — Verified via `generateComplaintPdf` unit test in `index.test.ts` confirming valid `%PDF-` document structure with embedded statutory notices.
- [x] Task 3.5: Accessibility and responsiveness pass (WCAG 2.2 AA compliant, mobile-first Android viewport, `prefers-reduced-motion`) — Verified semantic HTML5 (`<dialog>`, `<main>`, `<article>`), high-contrast HSL color system, visible focus rings, and reduced-motion media query overrides.
- [x] Task 3.6: Integration & unit test suite in `apps/web` verifying verification workflow, PDF generator, and accessibility — Verified 6 test suites in `apps/web/src/index.test.ts` covering misleading, vague, and credible claim workflows.
- [x] Task 3.7: Phase 3 exit criteria verification & summary — Verified full monorepo pipeline: `pnpm lint`, `pnpm typecheck`, `pnpm test` (87 tests passing), `pnpm eval`, and Next.js static production build.

### Phase 3 Summary & Exit Criteria
Phase 3 (Web App MVP) is complete: The client-side Next.js App Router web application in `apps/web` provides an accessible, responsive interface for commercial environmental claim verification. Users can input claims directly or test pre-configured examples to receive instant deterministic verdicts, compliance risk scores (0–100), cited CCPA 2024 provisions, and concrete "what would make this credible" guidance. Copy strictly adheres to the non-accusatory requirement ("does not appear to meet regulatory standards"). A client-side PDF generator powered by `pdf-lib` produces formal pre-litigation grievance notices citing statutory guidelines. All exit criteria met.

## Phase 4: Capture and Reach
- [x] Task 4.1: In-browser OCR engine (`apps/web/src/lib/ocr.ts`) with image preprocessing and vision fallback hook — Verified via unit test in `index.test.ts` testing canvas contrast enhancement and automatic vision model fallback for low-confidence scans.
- [x] Task 4.2: Barcode scanning & public product lookup service (`apps/web/src/lib/barcode.ts`) with Open Food Facts and offline fallback — Verified via 3 unit tests covering registered EAN barcodes, unregistered codes, and graceful offline catalog resolution.
- [x] Task 4.3: Bilingual Hindi localization (`apps/web/src/lib/i18n.ts`) with full UI parity and English/Hindi toggle — Verified via dictionary key parity test in `index.test.ts` and Hindi GCL-008 environmental claim evaluation.
- [x] Task 4.4: Capture UI components (`CaptureModal.tsx`, `BarcodeModal.tsx`, language toggle) — Verified responsive modal dialogs supporting camera viewfinder (`<video muted><track kind="captions" /></video>`), drag-and-drop packaging photo uploads, and barcode searches.
- [x] Task 4.5: PWA manifest (`manifest.webmanifest`), offline service worker (`sw.js`), and offline verification shell — Verified PWA manifest configuration, stale-while-revalidate service worker caching, and client-side offline execution capability.
- [x] Task 4.6: Unit & integration test suite in `apps/web` covering OCR, barcode lookup, Hindi parity, and offline behavior — Verified 13 passing unit and integration tests in `apps/web/src/index.test.ts`.
- [x] Task 4.7: Phase 4 exit criteria verification & summary — Verified full monorepo pipeline: `pnpm lint`, `pnpm typecheck`, `pnpm test` (94 tests passing), `pnpm eval`, and Next.js static production build.

### Phase 4 Summary & Exit Criteria
Phase 4 (Capture and Reach) is complete: GreenClaim Lens now features full multi-modal capture and localization. In-browser OCR via Tesseract.js recognizes packaging text with client-side image preprocessing and vision fallback. Barcode lookup queries Open Food Facts with built-in offline registry fallback to instantly load packaging claims. A comprehensive bilingual Hindi localization system provides 100% UI translation parity across all screens and evaluates vernacular environmental claims. The PWA manifest and service worker enable offline shell caching so rule evaluations operate reliably even under weak or absent mobile connectivity. All exit criteria met.

## Phase 5: Experience Polish
- [x] Task 5.1: Performance budget & reduced-motion validator (`apps/web/src/lib/performance-budget.ts`) — Verified via unit tests confirming device concurrency thresholding, WebGL capability check, and latency budget evaluation.
- [x] Task 5.2: Interactive 3D results visualizer with dynamic loading and 2D canvas/SVG fallback (`ResultsVisualizer.tsx`) — Verified interactive 3D rotating compliance wireframe sphere with automatic 2D SVG radial gauge fallback when reduced motion or unsupported WebGL is detected.
- [x] Task 5.3: Micro-interactions, animated feedback, and accessibility transition polish — Verified keyframe animations (`fadeInSlide`), micro-interaction toast notifications (`<output className="toast">`), and `@media (prefers-reduced-motion: reduce)` overrides.
- [x] Task 5.4: Unit & integration test suite in `apps/web` verifying 2D/3D fallback, reduced motion, and performance budget — Verified 16 passing test suites in `apps/web/src/index.test.ts`.
- [x] Task 5.5: Phase 5 exit criteria verification & summary — Verified full monorepo pipeline: `pnpm lint`, `pnpm typecheck`, `pnpm test` (97 tests passing across monorepo), `pnpm eval`, and Next.js static production build.

### Phase 5 Summary & Exit Criteria
Phase 5 (Experience Polish) is complete: The results experience features an interactive compliance risk visualization with lightweight 3D wireframe spherical geometry and automatic 2D SVG radial gauge fallback. The performance budget module enforces latency limits and device capability checks. Strict accessibility compliance ensures `prefers-reduced-motion` is automatically honored by suppressing 3D animations and collapsing transition durations. Micro-interactions and toast status notifications provide immediate visual feedback. All exit criteria met.

## Phase 6: Platform & API
- [x] Task 6.1: Hono Edge API routes in `apps/api` (`/v1/health`, `/v1/verify-claim`, `/v1/rules`, `/v1/openapi.json`, Swagger/Scalar docs) — Verified via 12 integration tests in `apps/api/src/index.test.ts` testing endpoints, OpenAPI 3.1 specification, and claim verification.
- [x] Task 6.2: API key authentication, in-memory rate limiting, and Turnstile verification middleware in `apps/api` — Verified via integration tests confirming sliding window throttling (429), header generation, and API key validation.
- [ ] Task 6.3: Typed SDK in `packages/sdk` with `verifyClaim`, `listRules`, `checkHealth`, and comprehensive unit tests
- [ ] Task 6.4: Manifest V3 Browser Extension prototype in `apps/extension` with content script highlighting green claims and interactive popup
- [ ] Task 6.5: Phase 6 exit criteria verification & summary (all tests passing, SDK typed, API docs live, extension flags claims on sample shopping page)

## Phase 7: Launch Hardening
- [ ] Security audit & `SECURITY.md`
- [ ] Evaluation gate passing thresholds
- [ ] Documentation and release candidate readiness
