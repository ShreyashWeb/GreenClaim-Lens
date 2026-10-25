# Progress Tracking

This document tracks progress against the phases outlined in [docs/ROADMAP.md](docs/ROADMAP.md) and user directives.

Rule: Tick tasks with a one-line note on how you verified them.

## Phase 0: Foundations
- [ ] Monorepo structure (`pnpm` + Turborepo workspace)
- [ ] Root configuration: TypeScript strict, Biome/ESLint, Prettier
- [ ] Scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm eval` stub
- [ ] Environment templates (`.env.example`)
- [ ] CI skeleton (GitHub Actions workflow for lint, typecheck, test, eval)
- [ ] Issue & PR templates

## Phase 1: Rule Engine and Evaluation (Core Value)
- [ ] Rule schemas and types in `packages/core` (pure TS, zero I/O)
- [ ] Rule definitions in `data/rules/` derived from official sources or marked with `<TODO: verify against official text>`
- [ ] Rule execution engine & aggregation logic
- [ ] Risk scoring algorithm
- [ ] Golden dataset loader & runner in `packages/eval`
- [ ] Golden dataset initial cases in `data/golden/`
- [ ] `pnpm eval` benchmark reporting baseline metrics

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
