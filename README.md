# GreenClaim Lens 🌿🔍

> Point your phone at an "eco-friendly" claim. Get an explainable, cited verdict, and a ready-to-file complaint draft if the claim doesn't hold up.

GreenClaim Lens is an open-source, free-to-run tool that checks sustainability claims on products and ads against India's greenwashing rules. It combines a **deterministic rule engine**, **retrieval over the official guidelines**, and an **LLM used only for gray areas**, so every verdict is cited, testable, and cheap to produce.

**Status:** Pre-alpha. See [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Why this exists

Words like "eco-friendly", "natural", "biodegradable" and "carbon neutral" appear on packaging everywhere, and shoppers have no practical way to check them. India now has rules on misleading environmental claims (the CCPA's 2024 greenwashing guidelines and the Ecomark Rules), but the rules are written for regulators and companies, not for people standing in a shop aisle.

Existing Indian ESG/greenwashing projects we found mostly target **investors** analysing company filings. GreenClaim Lens targets **consumers**, and closes the loop with a complaint draft.

## What it does

1. **Capture**: paste a claim, upload a photo of packaging/ad, or scan a barcode.
2. **Extract**: OCR (in-browser first) and structured claim extraction.
3. **Check**: deterministic rules → retrieval of relevant clauses → LLM judgment only when needed.
4. **Explain**: verdict, risk score, the exact rule(s) involved, and what evidence would make the claim credible.
5. **Act**: generate a complaint draft (PDF, built in your browser) for the National Consumer Helpline.

## Verdicts

| Verdict | Meaning |
|---|---|
| `CREDIBLE` | Claim is specific, qualified, and substantiation is visible or referenced |
| `VAGUE` | Claim uses broad terms without qualification or substantiation |
| `LIKELY_MISLEADING` | Claim conflicts with one or more rules or with available evidence |
| `INSUFFICIENT_EVIDENCE` | The system abstains rather than guess |

> GreenClaim Lens is a **risk indicator, not a legal finding**. See [docs/SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md).

## Tech stack (all free-tier friendly)

- **Monorepo:** pnpm + Turborepo, TypeScript
- **Web:** Next.js (App Router), Tailwind, shadcn/ui, Motion, React Three Fiber (lazy-loaded)
- **Edge/API:** Cloudflare Workers + Hono, OpenAPI
- **Data:** Cloudflare D1, Vectorize, R2, KV
- **AI:** Vercel AI SDK with a provider-agnostic gateway (free-tier providers with failover), Zod structured output
- **OCR:** Tesseract.js (browser) with vision-LLM fallback
- **Quality:** Vitest, Playwright, LLM eval harness gated in CI
- **i18n/PWA:** English + Hindi, offline-capable

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Free-tier limits change often; verify current limits before relying on them.

## Repository layout

```
greenclaim-lens/
├─ apps/
│  ├─ web/            # Next.js app
│  └─ api/            # Hono on Cloudflare Workers
├─ packages/
│  ├─ core/           # rule engine, claim types, verdict logic (no I/O)
│  ├─ llm-gateway/    # provider abstraction, caching, failover
│  ├─ retrieval/      # chunking, embeddings, hybrid search
│  ├─ sdk/            # public API client
│  └─ eval/           # golden dataset + eval runner
├─ data/
│  ├─ rules/          # versioned rule definitions (YAML/JSON)
│  └─ golden/         # labelled claims for evaluation
└─ docs/
```

## Quick start

```bash
pnpm install
cp .env.example .env.local   # add free API keys (see docs/ARCHITECTURE.md)
pnpm dev
pnpm test
pnpm eval                    # run the golden-dataset evaluation
```

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Rule Engine](docs/RULE_ENGINE.md)
- [Evaluation](docs/EVALUATION.md)
- [Public API](docs/API.md)
- [Security, Privacy & Legal](docs/SECURITY_PRIVACY.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT (proposed; confirm before first release).

## Disclaimer

GreenClaim Lens is not legal advice and is not affiliated with any government body. Verdicts are automated assessments of whether a claim appears to meet published guidelines.

