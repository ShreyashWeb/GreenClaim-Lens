# Evaluation Results (Rule-Base v0.1.0)

**Status:** completed | **Cases Evaluated:** 52

## Headline Metrics

| Metric | Value | Gate Threshold | Status |
|---|---|---|---|
| Verdict Macro-F1 | 97.0% | >= 70.0% | PASS |
| Overall Accuracy | 98.1% | >= 70.0% | PASS |
| False-Accusation Rate | 0.0% | <= 5.0% | PASS |
| Citation Validity | 100.0% | = 100% | PASS |
| Rule-Only Resolution Rate | 88.5% | Baseline | RECORDED |

## Per-Class Breakdown

| Verdict Class | Precision | Recall | F1 Score | Support |
|---|---|---|---|---|
| `CREDIBLE` | 100.0% | 100.0% | 100.0% | 9 |
| `VAGUE` | 100.0% | 94.4% | 97.1% | 18 |
| `LIKELY_MISLEADING` | 100.0% | 100.0% | 100.0% | 20 |
| `INSUFFICIENT_EVIDENCE` | 83.3% | 100.0% | 90.9% | 5 |

## Confusion Matrix

| Expected \ Predicted | CREDIBLE | VAGUE | LIKELY_MISLEADING | INSUFFICIENT_EVIDENCE |
|---|---|---|---|---|
| **CREDIBLE** | 9 | 0 | 0 | 0 |
| **VAGUE** | 0 | 17 | 0 | 1 |
| **LIKELY_MISLEADING** | 0 | 0 | 20 | 0 |
| **INSUFFICIENT_EVIDENCE** | 0 | 0 | 0 | 5 |