# AGENTS.md

Guidance for AI coding assistants working in this repository.

## Project in one paragraph
GreenClaim Lens checks environmental marketing claims against Indian greenwashing rules using a deterministic rule engine, retrieval over official clauses, and an LLM only for gray areas. Verdicts must always be cited and explainable.

## Hard rules
1. **Never invent legal text, clause numbers, or URLs.** If an official source is unavailable, write `<TODO: verify against official text>`.
2. **Cite or abstain.** Any verdict path that cannot cite a rule or retrieved chunk must return `INSUFFICIENT_EVIDENCE`.
3. Keep `packages/core` pure (no network, storage, or environment access).
4. Do not send personal data or images to third-party AI providers.
5. Do not add paid services or dependencies; free tiers only, and treat them as unreliable.
6. Any change to rules, prompts, or retrieval requires running `pnpm eval` and reporting the result.
7. Never commit secrets. Use `.env.example` with names only.
8. UI copy must say "does not appear to meet", never "is lying".

## Conventions
- TypeScript strict, Zod for all external input.
- Tests live beside code (`*.test.ts`); E2E in `apps/web/e2e`.
- Conventional Commits.
- Small, reviewable PRs.

## Useful commands
```bash
pnpm dev        # run apps
pnpm test       # unit + integration
pnpm eval       # golden dataset evaluation
pnpm lint && pnpm typecheck
```

## Where to look
- Product intent: `docs/PRD.md`
- Design: `docs/ARCHITECTURE.md`
- Rule format and governance: `docs/RULE_ENGINE.md`
- Quality bar: `docs/EVALUATION.md`
