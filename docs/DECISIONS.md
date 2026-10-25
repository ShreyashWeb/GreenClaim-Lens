# Architecture & Design Decisions

This document records architectural, design, and implementation decisions that extend or specify details beyond the initial documentation.

## ADR-001: Monorepo Tooling & Package Manager
- **Context:** The project requires a monorepo containing frontend apps (`apps/web`), edge APIs (`apps/api`), and shared pure/isomorphic packages (`packages/core`, `packages/eval`, etc.).
- **Decision:** Use `pnpm` (>=9 or latest v12) with `pnpm-workspace.yaml` and `turborepo` for orchestrating task execution, caching, and dependency management.
- **Consequences:** Clean dependency isolation, fast installs, strict workspace boundary enforcement, and standardized commands (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm eval`).

## ADR-002: Verification & Test Discipline
- **Context:** User instruction mandates running `pnpm lint && pnpm typecheck && pnpm test (and pnpm eval once it exists)` after every task, with zero weakening or deletion of tests.
- **Decision:** Every package will maintain its own strict unit/integration tests alongside source code (`*.test.ts`) using Vitest. CI and root scripts will enforce complete passes across all packages.

## ADR-003: Pure Core Boundary
- **Context:** `packages/core` must remain 100% deterministic and free of network, storage, or environment access.
- **Decision:** Any legal claim parsing, rule matching, aggregation, and risk scoring logic will reside strictly in `packages/core` with zero platform dependencies. Any external data (retrieved clauses, LLM judgments) must be passed as typed arguments to pure functions.

## ADR-004: Boundary-Aware Lexicon Term Matching
- **Context:** Substring matching (`includes()`) causes false-positive collisions (e.g. `"100% eco"` falsely triggering inside `"100% eco-friendly packaging"`).
- **Decision:** Implement token-boundary regex matching `(^|[^a-zA-Z0-9_-])...([^a-zA-Z0-9_-]|$)` for Latin alphabets while preserving Unicode script compatibility for Devanagari (Hindi) terms.

## ADR-005: Server-Side Citation Enforcement & Abstention
- **Context:** LLMs can hallucinate regulatory clauses or return flags without evidence citations.
- **Decision:** Validate all LLM output citations against the retrieved chunk IDs before accepting a model output; any mismatch or missing citation on a flag forces the outcome to `unsure` and strips citations, ensuring 100% citation validity and strict adherence to the cite-or-abstain principle.

## ADR-006: LLM Gateway Resilience & Failover
- **Context:** Free-tier providers (Gemini, Groq) may encounter rate limits or temporary downtime.
- **Decision:** Implement an in-memory SHA-256 prompt response cache, consecutive failure tracking with circuit breakers, and an ordered priority failover. If all providers fail, the gateway gracefully returns an `unsure` judgment without throwing exceptions.

