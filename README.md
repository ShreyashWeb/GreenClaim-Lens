# GreenClaim Lens 🌿🔍

[![CI](https://github.com/ShreyashWeb/GreenClaim-Lens/actions/workflows/ci.yml/badge.svg)](https://github.com/ShreyashWeb/GreenClaim-Lens/actions/workflows/ci.yml)
[![Accuracy](https://img.shields.io/badge/Evaluation%20Accuracy-98.1%25-10b981.svg)](docs/EVAL_RESULTS.md)
[![Citation Validity](https://img.shields.io/badge/Citation%20Validity-100%25-10b981.svg)](docs/EVAL_RESULTS.md)
[![False Accusation Rate](https://img.shields.io/badge/False%20Accusations-0.0%25-10b981.svg)](docs/EVAL_RESULTS.md)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.8-3178c6.svg)](tsconfig.base.json)

> Point your phone at an "eco-friendly" claim. Get an explainable, cited verdict, and a ready-to-file complaint draft if the claim doesn't hold up.

GreenClaim Lens is an open-source, privacy-first tool that checks sustainability marketing claims on consumer products and advertisements against India's greenwashing regulations (CCPA 2024 Guidelines & ASCI code).

It operates on a **"rules first, LLM last"** and **"cite or abstain"** architecture:
- **Deterministic rule engine** in pure TypeScript with zero I/O.
- **Hybrid retrieval** (BM25 + vector cosine similarity + Reciprocal Rank Fusion) over official statutory clauses.
- **Provider-agnostic LLM Gateway** with circuit breakers, failover, and strict server-side citation validation.
- **Non-accusatory framing:** System copy strictly asserts whether claims *"appear"* or *"do not appear to meet regulatory standards"*, eliminating defamatory liability.

---

## What It Does

1. **Capture:** Type or paste claims, upload packaging photos (with client-side contrast enhancement & in-browser Tesseract.js OCR), or scan barcodes via Open Food Facts.
2. **Deterministic Evaluation:** Fast token-boundary matching against 8 codified rules covering absolute claims, generic eco-buzzwords, carbon offsets, biodegradability, and Hindi terms.
3. **Hybrid Retrieval & Gateway:** Matches claims to official gazette clauses; server validates LLM output against retrieved chunk IDs, forcing abstention (`INSUFFICIENT_EVIDENCE`) upon missing citations.
4. **Explain & Guide:** Computes compliance risk score (0–100), provides clear regulatory rationale, and suggests actionable remediation ("what would make this credible").
5. **Act:** Generates client-side, formal pre-litigation grievance notice PDFs citing Section 2(28) Consumer Protection Act 2019 for the National Consumer Helpline.
6. **Platform & Extension:** Edge Hono API with OpenAPI 3.1 documentation, typed `@greenclaim/sdk`, and a Manifest V3 browser extension inspecting shopping pages in real-time.

---

## Verdict States

| Verdict | Meaning | Action / Output |
|---|---|---|
| `CREDIBLE` | Specific, qualified attribute with verifiable substantiation or standard | Risk Score 0–25; confirms compliance alignment |
| `VAGUE` | Uses broad terms ("eco-friendly", "green") without qualification or scope | Risk Score 35–65; prompts specific attribute percentage |
| `LIKELY_MISLEADING` | Absolute superlative, unqualified offset, or missing legal condition | Risk Score 70–100; generates grievance notice PDF |
| `INSUFFICIENT_EVIDENCE` | System abstains rather than hallucinate or guess | Cite-or-abstain principle enforced |

---

## Monorepo Architecture

```
greenclaim-lens/
├─ apps/
│  ├─ web/            # Next.js 16 (Turbopack), App Router, Vanilla CSS, 3D visualizer, PWA, i18n
│  ├─ api/            # Edge API on Hono, OpenAPI 3.1, rate limiting, Turnstile bot protection
│  └─ extension/      # Manifest V3 browser extension for live e-commerce DOM claim inspection
├─ packages/
│  ├─ core/           # Pure deterministic rule engine, schemas, verdict aggregation (zero I/O)
│  ├─ retrieval/      # Guidelines chunker, BM25 keyword search, dense vectors, Reciprocal Rank Fusion
│  ├─ llm-gateway/    # Multi-provider gateway (mock, Gemini, Groq), circuit breaker, citation validator
│  ├─ sdk/            # Typed public TypeScript client SDK with structured error taxonomy
│  └─ eval/           # Golden dataset harness, Macro-F1 benchmark, and hard CI quality gates
├─ data/
│  ├─ rules/          # Versioned rule definitions (GCL-001 through GCL-008)
│  └─ golden/         # Curated 52-case balanced golden evaluation dataset
└─ docs/              # Comprehensive architecture, decisions, case studies, and legal reviews
```

---

## Quick Start

### Prerequisites
- Node.js >= 20.x or 22.x
- `pnpm` >= 12.15.0

### Installation & Execution
```bash
# Install monorepo dependencies
pnpm install

# Copy environment template (keys optional for rules-only execution)
cp .env.example .env.local

# Run development servers (Web App on :3000, API on :8787)
pnpm dev

# Run full monorepo unit & integration test suites (120+ tests passing)
pnpm test

# Run evaluation benchmark against golden dataset
pnpm eval

# Run hard evaluation safety gate (enforces 100% citation validity, 0.0% false accusations)
pnpm eval:gate
```

---

## Key Documentation

- **[Product Requirements Document (PRD)](docs/PRD.md)**
- **[System Architecture](docs/ARCHITECTURE.md)**
- **[Interactive Walkthrough & Demo Guide](docs/DEMO.md)**
- **[Compliance Case Studies](docs/CASE_STUDIES.md)**
- **[Rule Engine Specifications](docs/RULE_ENGINE.md)**
- **[Evaluation Benchmark & Results](docs/EVAL_RESULTS.md)**
- **[API Reference & Endpoints](docs/API.md)**
- **[Architectural Decision Records (ADRs)](docs/DECISIONS.md)**
- **[Legal & Consumer Rights Review](docs/LEGAL_REVIEW.md)**
- **[Privacy Policy](docs/PRIVACY.md)**
- **[Terms of Service](docs/TERMS.md)**
- **[Security Policy & Disclosure](SECURITY.md)**
- **[Human Verification Backlog](NEEDS_HUMAN.md)**

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## Legal Disclaimer

*GreenClaim Lens provides automated compliance risk assessments for educational and research purposes. It is not legal counsel, a judicial finding, or an official government certification. All verdicts strictly reflect whether commercial claims appear to meet published statutory guidelines.*
