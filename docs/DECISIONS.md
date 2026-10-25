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

## ADR-007: Client-Side Grievance Notice Generation & Web UI Architecture
- **Context:** Consumers encountering potentially misleading environmental claims need accessible ways to document and petition brands without requiring server-side rendering or backend PDF printing pipelines.
- **Decision:** Use `pdf-lib` entirely in the client browser to generate formal PDF grievance notices citing CCPA 2024 provisions. Style the Next.js App Router application with modern, responsive Vanilla CSS using custom HSL design tokens, glassmorphism, semantic HTML5, and strict WCAG 2.2 AA accessibility (including `prefers-reduced-motion` support).

## ADR-008: Multi-Modal Capture, Offline Product Registry, and Bilingual Parity
- **Context:** Users on mobile devices and supermarket aisles need to capture packaging text via camera and barcodes quickly, often under degraded or offline connectivity conditions.
- **Decision:** Implement Tesseract.js client-side OCR with canvas contrast pre-processing and vision model fallback. Provide barcode scanning with Open Food Facts and built-in offline registry fallback. Implement complete English/Hindi localization with full dictionary parity and PWA service worker caching for offline evaluation.

## ADR-009: Interactive Risk Visualizer, 2D Fallback, and Performance Budget
- **Context:** High-fidelity data visualizations provide clarity into environmental compliance risks, but heavy 3D bundles can degrade performance on low-end mobile hardware or violate WCAG accessibility guidelines for users with vestibular disorders.
- **Decision:** Implement a lightweight 3D rotating compliance wireframe sphere with Three.js-style mathematics and canvas rendering. Couple it with a performance budget validator that detects device concurrency, WebGL support, and `prefers-reduced-motion` settings to automatically fall back to an accessible 2D SVG radial gauge with instant rendering and zero motion artifacts.

## ADR-010: Edge API Architecture, Typed Client SDK, and Manifest V3 Extension
- **Context:** Third-party developers, researchers, and consumers browsing e-commerce platforms need direct programmatic and in-browser access to claim verification without manually copy-pasting into the web app.
- **Decision:** Implement an Edge-ready Hono API (`apps/api`) with OpenAPI 3.1 specifications, interactive Swagger/Scalar documentation, API key authentication, and sliding-window rate limiting. Provide a standalone `@greenclaim/sdk` client with custom error taxonomy and typed methods. Build a Manifest V3 browser extension (`apps/extension`) with content scripts that inspect product pages, apply non-accusatory highlights and badges citing CCPA 2024 guidelines, and surface aggregate statistics in a popup.

