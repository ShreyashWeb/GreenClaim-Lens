# Contributing

Thanks for helping make environmental claims easier to verify.

## Ground rules

- Be respectful. See the Code of Conduct (to be added).
- Never add rules from memory: **every rule must cite an official clause**.
- Never commit secrets, personal data, or images of people.
- Do not add content that names a brand as dishonest without a rule-based, cited reason.

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Requires Node (current LTS) and pnpm.

## Workflow

1. Open an issue or comment on an existing one.
2. Branch: `feat/...`, `fix/...`, `docs/...`, `rule/...`.
3. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
4. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm eval` before opening a PR.
5. Fill in the PR template; attach the eval report if rules, prompts, or retrieval changed.

## Contributing rules (`data/rules`)

Each PR needs: source clause and URL, at least two positive and two negative test cases (English; Hindi if applicable), and an eval report showing no regression. See [docs/RULE_ENGINE.md](docs/RULE_ENGINE.md).

## Contributing golden data (`data/golden`)

Include source URL, capture date, expected verdict, expected rules, and notes. Two reviewers must agree on the label.

## Code standards

- TypeScript strict; no `any` in `packages/core`.
- `packages/core` stays free of I/O.
- Every new route has an OpenAPI schema and tests.
- UI changes: keyboard accessible, reduced-motion respected, checked on a small mobile viewport.

## Reporting security issues

Do not open a public issue. See `SECURITY.md` (to be added before public release).
