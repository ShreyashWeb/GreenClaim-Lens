/**
 * GreenClaim Lens - Health Route
 */

import { CORE_VERSION, DEFAULT_RULES } from '@greenclaim/core';
import { Hono } from 'hono';

const serverStartTime = Date.now();

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  const uptimeSeconds = Math.round((Date.now() - serverStartTime) / 1000);

  return c.json({
    status: 'ok',
    version: 'v1',
    coreVersion: CORE_VERSION,
    timestamp: new Date().toISOString(),
    rulesLoaded: DEFAULT_RULES.length,
    uptime: uptimeSeconds,
  });
});
