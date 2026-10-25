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
