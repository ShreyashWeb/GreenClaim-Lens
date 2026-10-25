# Rule Engine

The rule engine is the heart of GreenClaim Lens. It turns published guidance into small, testable, versioned checks.

> **Important:** Rule definitions must be derived from the **official published texts** (CCPA greenwashing guidelines, Ecomark Rules, and any other cited instrument). Do not write rules from memory or secondary summaries. Each rule stores a `source` pointing to the exact clause so reviewers can verify it.

## 1. Rule anatomy

```yaml
id: GCL-001
title: Unqualified broad environmental term
status: draft            # draft | reviewed | active | retired
severity: medium         # low | medium | high
source:
  document: "<official document name>"
  clause: "<clause reference>"      # fill from official text
  url: "<official URL>"
  retrieved_on: "<date>"
detect:
  type: lexicon          # lexicon | regex | structured | llm-assisted
  terms: ["eco-friendly", "green", "natural", "planet-friendly"]
  languages: [en, hi]
requires:                # what a defensible claim should show nearby
  - qualifier
  - substantiation_reference
outcome_if_missing: flag
explain:
  en: "Broad terms need a qualifier and supporting evidence."
  hi: "..."
remediation:
  en: "State the specific attribute (e.g. 'made with X% recycled material') and link evidence."
tests:
  - input: "100% eco-friendly packaging"
    expect: flag
  - input: "Made with 40% post-consumer recycled plastic (certificate: ...)"
    expect: pass
```

## 2. Rule families (planned)

| Family | Examples of what is checked |
|---|---|
| Broad / absolute terms | "eco-friendly", "green", "100% natural" without qualifiers |
| Substantiation | Claim stated without visible evidence or reference |
| Comparative claims | "greener than before" with no baseline |
| Future / aspirational | "net zero by 2030" without plan or interim targets |
| Offsetting claims | "carbon neutral" relying on offsets without disclosure |
| Certification / labels | Eco-label use without a verifiable scheme |
| Lifecycle scope | Claim about part of a product presented as the whole |
| Disclosure placement | Qualifier hidden or unreadable vs headline claim |

Rule IDs and text are **ours**; each must map to an official clause before reaching `active` status.

## 3. Evaluation outcomes

Each rule returns one of:

- `pass`: requirement met (with evidence span)
- `flag`: requirement missing (with evidence span and reason)
- `n/a`: rule not applicable
- `unsure`: needs retrieval + LLM judgment

## 4. Verdict aggregation

1. Any `high` severity `flag` → `LIKELY_MISLEADING` (unless overridden by strong contrary evidence).
2. `medium` flags only → `VAGUE`.
3. All applicable rules `pass` → `CREDIBLE`.
4. Any `unsure` unresolved after LLM step, or contradictory evidence → `INSUFFICIENT_EVIDENCE`.

The risk score (0-100) is a weighted function of flags, severity and evidence strength. Weights live in config and are tuned only against the golden dataset.

## 5. The LLM step

Only for `unsure` rules. Contract:

- Input: claim text, rule definition, retrieved chunks (with IDs).
- Output (strict schema): `outcome`, `reasoning` (short), `citations: chunkId[]`, `confidence`.
- Server validation: all `citations` must exist in the retrieved set; at least one citation required for `flag`; otherwise result becomes `unsure` → abstain.
- Prompts are versioned and stored in the repo; changes require an eval run.

## 6. Language handling

Rules support `en` and `hi` lexicons. Mixed-script and transliterated text (Hinglish) is a known hard case and is tracked in the golden dataset.

## 7. Governance

- Every rule change goes through PR with: source clause, tests, eval report.
- Rule base has a semantic version; results record it.
- A `reviewed` rule needs a second reviewer; `active` needs verification against official text.
- Retired rules stay in history so old verdicts remain explainable.
