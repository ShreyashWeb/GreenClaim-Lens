/**
 * GreenClaim Lens - API Server (Hono / Edge runtime)
 */

export interface ApiStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
}

export function getApiStatus(): ApiStatus {
  return {
    status: 'ok',
    version: 'v1',
  };
}
