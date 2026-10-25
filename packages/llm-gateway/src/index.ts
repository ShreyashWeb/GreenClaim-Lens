/**
 * GreenClaim Lens - LLM Gateway
 * Provider abstraction, circuit breaker, failover, response caching.
 */

export interface LLMGatewayConfig {
  providers: string[];
}

export class LLMGateway {
  private providers: string[];

  constructor(config: LLMGatewayConfig) {
    this.providers = [...config.providers];
  }

  getActiveProviders(): string[] {
    return [...this.providers];
  }
}
