# Public API (v1)

Base URL: `https://<your-domain>/v1` (placeholder). Spec is generated as OpenAPI 3.1 at `/v1/openapi.json`; the TypeScript SDK in `packages/sdk` is generated from it.

## Authentication

- Anonymous web usage is rate-limited by IP + Turnstile.
- API clients send `Authorization: Bearer <api_key>`. Keys are stored hashed.

## Rate limits

Returned in headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Exceeding returns `429`.

## Endpoints

### `POST /v1/verify-claim`

Request:
```json
{
  "text": "100% eco-friendly packaging",
  "lang": "en",
  "context": { "category": "packaging", "barcode": null }
}
```

Response `200`:
```json
{
  "id": "vrd_...",
  "verdict": "VAGUE",
  "risk_score": 62,
  "claims": [
    {
      "text": "100% eco-friendly packaging",
      "rule_hits": [
        { "rule_id": "GCL-001", "outcome": "flag", "evidence": "eco-friendly", "severity": "medium" }
      ],
      "citations": [
        { "chunk_id": "ch_...", "source": "<document>", "clause": "<ref>", "url": "..." }
      ]
    }
  ],
  "explanation": "Plain-language reason.",
  "what_would_help": ["Specify the attribute", "Link to certification or test report"],
  "meta": {
    "rule_base_version": "0.1.0",
    "path": "rules_only",
    "models": [],
    "partial": false,
    "disclaimer": "Automated risk indicator, not legal advice."
  }
}
```

`meta.partial = true` means the LLM step was unavailable and only rule results are returned.

### `GET /v1/rules` and `GET /v1/rules/{id}`
List and fetch active rules with source references and explanations.

### `POST /v1/complaint-draft`
Returns structured complaint content (not a PDF) for the client to render:
```json
{ "verdict_id": "vrd_...", "user_notes": "optional" }
```
The web app renders the PDF locally. No personal details are required by the API.

### `GET /v1/health`
Service and provider health (no secrets).

## Errors

```json
{ "error": { "code": "invalid_input", "message": "text is required", "request_id": "..." } }
```

| Status | Code |
|---|---|
| 400 | `invalid_input` |
| 401 | `unauthorized` |
| 413 | `payload_too_large` |
| 429 | `rate_limited` |
| 503 | `degraded` (all AI providers down; rules-only response still returned where possible) |

## Versioning

Breaking changes bump `/v2`. Rule-base and prompt versions appear in `meta` and do not break the API contract.
