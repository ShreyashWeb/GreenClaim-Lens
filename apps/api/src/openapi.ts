/**
 * GreenClaim Lens - OpenAPI 3.1 Specification & Interactive Docs UI
 */

export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'GreenClaim Lens Public API',
    version: '1.0.0',
    description:
      'Deterministic environmental claim verification against Indian consumer protection guidelines (CCPA 2024 & ASCI 2024). Strictly non-accusatory, cite-or-abstain architecture.',
    contact: {
      name: 'GreenClaim Lens Engineering',
      url: 'https://github.com/ShreyashWeb/GreenClaim-Lens',
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
  },
  servers: [
    {
      url: 'https://api.greenclaimlens.org',
      description: 'Production Edge Gateway',
    },
    {
      url: 'http://localhost:8787',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/v1/health': {
      get: {
        summary: 'System Health & Version',
        description: 'Returns operational status, uptime, and active rule engine version.',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'API operational status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    version: { type: 'string', example: 'v1' },
                    timestamp: { type: 'string', format: 'date-time' },
                    rulesLoaded: { type: 'integer', example: 8 },
                    uptime: { type: 'number', example: 124.5 },
                  },
                  required: ['status', 'version', 'timestamp', 'rulesLoaded'],
                },
              },
            },
          },
        },
      },
    },
    '/v1/rules': {
      get: {
        summary: 'List Environmental Guidelines Rules',
        description:
          'Retrieves active deterministic rules codified from CCPA 2024 and ASCI guidelines with statutory citations.',
        operationId: 'listRules',
        responses: {
          '200': {
            description: 'List of active codified rules',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 8 },
                    rules: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'GCL-001' },
                          name: { type: 'string', example: 'Unsubstantiated Generic Eco Claims' },
                          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                          sourceClause: {
                            type: 'object',
                            properties: {
                              document: { type: 'string' },
                              clause: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/v1/verify-claim': {
      post: {
        summary: 'Verify Environmental Marketing Claim',
        description:
          'Evaluates a commercial environmental claim against codified rules and guidelines. Returns non-accusatory verdict, risk score (0-100), rule hits, and actionable improvement recommendations.',
        operationId: 'verifyClaim',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  claim: {
                    type: 'string',
                    description: 'Commercial claim text to verify (English or Hindi)',
                    example: '100% eco-friendly and green product',
                    minLength: 2,
                    maxLength: 2000,
                  },
                  lang: {
                    type: 'string',
                    enum: ['en', 'hi'],
                    default: 'en',
                  },
                  productCategory: {
                    type: 'string',
                    description: 'Optional FMCG or product category',
                    example: 'Personal Care',
                  },
                  brandName: {
                    type: 'string',
                    description: 'Optional brand name for contextual evaluation',
                    example: 'EcoNaturals',
                  },
                  turnstileToken: {
                    type: 'string',
                    description:
                      'Cloudflare Turnstile token for public client rate abuse prevention',
                  },
                },
                required: ['claim'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Verification outcome with non-accusatory compliance verdict',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    claim: { type: 'string' },
                    claimHash: { type: 'string' },
                    verdict: {
                      type: 'string',
                      enum: ['CREDIBLE', 'VAGUE', 'LIKELY_MISLEADING', 'INSUFFICIENT_EVIDENCE'],
                    },
                    riskScore: { type: 'number', minimum: 0, maximum: 100 },
                    explanation: { type: 'string' },
                    whatWouldHelp: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    ruleHits: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          ruleId: { type: 'string' },
                          ruleName: { type: 'string' },
                          outcome: { type: 'string', enum: ['flag', 'pass', 'n/a'] },
                          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                          evidence: { type: 'string' },
                        },
                      },
                    },
                    cached: { type: 'boolean' },
                  },
                  required: [
                    'claim',
                    'claimHash',
                    'verdict',
                    'riskScore',
                    'explanation',
                    'whatWouldHelp',
                  ],
                },
              },
            },
          },
          '400': {
            description: 'Invalid claim text or malformed JSON payload',
          },
          '429': {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'GreenClaim Lens API Key for programmatic access',
      },
    },
  },
};

/**
 * Generates interactive HTML documentation using Scalar API reference
 */
export function renderApiDocsHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GreenClaim Lens — API Documentation</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" />
    <style>
      body { margin: 0; background: #061511; color: #ecfdf5; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <script id="api-reference" data-url="/v1/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
