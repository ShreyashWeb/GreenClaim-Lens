# Evaluation

Quality is a feature. This project publishes its test data and results.

## 1. Golden dataset

Location: `data/golden/`. Each record:

```json
{
  "id": "gc-0001",
  "text": "100% eco-friendly packaging",
  "lang": "en",
  "source_url": "https://...",
  "captured_on": "YYYY-MM-DD",
  "category": "packaging",
  "expected_verdict": "VAGUE",
  "expected_rules": ["GCL-001"],
  "expected_citations": ["<source>#<clause>"],
  "difficulty": "easy",
  "notes": ""
}
```

### Target composition
- 100+ items at launch, growing over time.
- Balanced across the four verdicts, multiple product categories, English/Hindi/Hinglish.
- Includes **adversarial** cases: technically true but misleading wording, claims with the qualifier in tiny print, mixed claims, sarcastic or non-claim text.
- Includes **negative controls**: clearly credible claims that must not be flagged.

### Ethics and legality
- Use publicly visible claims; store claim text and source URL only.
- Do not store personal data or images of people.
- Labels are decided by documented guidelines, double-annotated, disagreements resolved and logged.
- Avoid publishing brand names next to "misleading" labels in public reports; anonymise unless the source is clearly public and the label is rule-based.

## 2. Metrics

| Metric | Why |
|---|---|
| Verdict macro-F1 | Overall classification quality |
| Per-class precision/recall | Find weak spots |
| **False-accusation rate** | Share of non-misleading claims labelled `LIKELY_MISLEADING`; the most important safety metric |
| Citation accuracy | Cited clause matches expected clause |
| Citation validity | Every citation exists in retrieved context (must be 100%) |
| Abstention rate and abstention quality | Abstaining on hard cases is good; abstaining on easy ones is not |
| Rule-only resolution rate | Cost and latency proxy |
| Latency p50/p75/p95 | UX |

## 3. CI gate

`pnpm eval` runs the full set against the current rule base and prompts.

- PRs touching `data/rules`, `packages/*`, or prompts must pass.
- Thresholds are set **after a first baseline run**, then ratcheted: metrics may not regress beyond tolerance.
- Hard gates (non-negotiable): citation validity = 100%, false-accusation rate under the agreed ceiling.
- Output: a markdown report attached to the PR with diffs per item.

## 4. Test pyramid

- **Unit:** each rule's embedded `tests`, normalisation, scoring.
- **Contract:** LLM gateway adapters against recorded fixtures (no live calls in CI by default).
- **Integration:** API routes with mocked providers.
- **E2E (Playwright):** paste claim → verdict → complaint PDF; image upload; Hindi UI; offline shell.
- **Prompt regression:** fixed prompts + fixtures; any change reruns the eval.
- **Red team:** prompt-injection in claim text ("ignore previous instructions"), oversized input, unicode tricks. Expected: ignored, safe output.

## 5. Human review

Periodic manual review of a random sample of production verdicts (opt-in logs only), feeding new golden items.

## 6. Reporting

Publish `docs/EVAL_RESULTS.md` per release with metrics, dataset size, rule-base version and known failure modes.
