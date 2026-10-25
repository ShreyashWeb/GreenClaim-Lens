/**
 * GreenClaim Lens - Rules Route
 */

import { DEFAULT_RULES } from '@greenclaim/core';
import { Hono } from 'hono';

export const rulesRouter = new Hono();

rulesRouter.get('/', (c) => {
  const sanitizedRules = DEFAULT_RULES.map((rule) => ({
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    status: rule.status,
    source: rule.source,
    explain: rule.explain,
    remediation: rule.remediation,
  }));

  return c.json({
    total: sanitizedRules.length,
    rules: sanitizedRules,
  });
});

rulesRouter.get('/:id', (c) => {
  const ruleId = c.req.param('id');
  const rule = DEFAULT_RULES.find((r) => r.id.toLowerCase() === ruleId.toLowerCase());

  if (!rule) {
    return c.json({ error: 'NotFound', message: `Rule '${ruleId}' was not found.` }, 404);
  }

  return c.json({
    id: rule.id,
    title: rule.title,
    severity: rule.severity,
    status: rule.status,
    source: rule.source,
    explain: rule.explain,
    remediation: rule.remediation,
  });
});
