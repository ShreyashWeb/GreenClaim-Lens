## Description

Brief summary of changes and user-facing impact.

## Type of Change

- [ ] `feat`: New feature or capability
- [ ] `fix`: Bug fix
- [ ] `rule`: New or updated greenwashing rule definition
- [ ] `docs`: Documentation updates
- [ ] `test`: Test suite or evaluation improvements
- [ ] `chore`: Build system, dependencies, or maintenance

## Verification & Hard Rules Checklist

- [ ] `pnpm lint` passed cleanly
- [ ] `pnpm typecheck` passed cleanly
- [ ] `pnpm test` passed without weakening or deleting tests
- [ ] `pnpm eval` passed (attach metrics diff if rules, prompts, or retrieval changed)
- [ ] No invented legal text, clause numbers, URLs, or statistics (unverified items logged in `NEEDS_HUMAN.md`)
- [ ] No secrets committed; free-tier constraints respected
- [ ] Core package remains pure (zero network/storage/environment I/O in `packages/core`)
- [ ] `PROGRESS.md` updated with verification note

## Eval Report (if applicable)

```
<paste pnpm eval output here>
```
