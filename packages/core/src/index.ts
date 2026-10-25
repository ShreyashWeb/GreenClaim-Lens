/**
 * GreenClaim Lens - Core domain types and utilities
 * Pure business logic with zero I/O and zero platform dependencies.
 */

export * from './schemas.js';
export * from './rule-runner.js';

export const CORE_VERSION = '0.1.0';

export function isVerdict(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return ['CREDIBLE', 'VAGUE', 'LIKELY_MISLEADING', 'INSUFFICIENT_EVIDENCE'].includes(value);
}
