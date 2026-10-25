/**
 * GreenClaim Lens - Public SDK Client
 */

export interface ClientConfig {
  baseUrl: string;
  apiKey?: string | undefined;
}

export class GreenClaimClient {
  private baseUrl: string;
  private apiKey?: string | undefined;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }
}
