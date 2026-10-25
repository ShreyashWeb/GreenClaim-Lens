/**
 * Performance Budget and Device Capability Detector for GreenClaim Lens.
 * Enforces reduced-motion compliance and decides whether to load 3D or 2D visualizations.
 */

export interface PerformanceBudgetConfig {
  maxInitialRenderMs: number;
  maxInteractionLatencyMs: number;
  maxMemoryMb?: number | undefined;
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudgetConfig = {
  maxInitialRenderMs: 100, // Budget for mid-range Android
  maxInteractionLatencyMs: 50,
  maxMemoryMb: 50,
};

/**
 * Checks if the user has requested reduced motion via OS or browser settings.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Checks whether WebGL / WebGL2 context is available and functional in the client.
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Determines whether 3D visualization should be rendered or if 2D fallback is required.
 * Returns false if:
 * 1. User prefers reduced motion (accessibility requirement).
 * 2. WebGL is unsupported.
 * 3. Low-end device detected (CPU concurrency <= 2).
 */
export function shouldUse3DVisualization(override?: {
  forceReducedMotion?: boolean | undefined;
  forceNoWebGL?: boolean | undefined;
}): boolean {
  if (override?.forceReducedMotion || prefersReducedMotion()) {
    return false;
  }

  if (override?.forceNoWebGL || !supportsWebGL()) {
    return false;
  }

  // Check hardware concurrency for low-end device fallback
  if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency <= 2) {
      return false; // Fall back to 2D on dual-core low-end devices
    }
  }

  return true;
}

/**
 * Validates measured performance against defined latency/memory budgets.
 */
export function evaluatePerformanceBudget(
  actualMs: number,
  budgetMs: number = DEFAULT_PERFORMANCE_BUDGET.maxInitialRenderMs,
): { met: boolean; delta: number; ratio: number } {
  const delta = budgetMs - actualMs;
  return {
    met: actualMs <= budgetMs,
    delta,
    ratio: Number((actualMs / budgetMs).toFixed(3)),
  };
}
