import type { GenerateStructuredParams, LLMJudgment, LLMProviderAdapter } from './types.js';

export interface MockProviderOptions {
  id: string;
  model: string;
  response?: LLMJudgment | undefined;
  shouldFail?: boolean | undefined;
  onCall?: ((params: GenerateStructuredParams) => void) | undefined;
}

export class MockProviderAdapter implements LLMProviderAdapter {
  readonly id: string;
  readonly model: string;
  private response: LLMJudgment;
  private shouldFail: boolean;
  private onCall?: ((params: GenerateStructuredParams) => void) | undefined;

  constructor(options: MockProviderOptions) {
    this.id = options.id;
    this.model = options.model;
    this.shouldFail = options.shouldFail ?? false;
    this.onCall = options.onCall;
    this.response = options.response ?? {
      outcome: 'unsure',
      reasoning: 'Default mock response',
      citations: [],
      confidence: 0.5,
    };
  }

  async generateStructured(params: GenerateStructuredParams): Promise<LLMJudgment> {
    if (this.onCall) {
      this.onCall(params);
    }
    if (this.shouldFail) {
      throw new Error(`Provider ${this.id} encountered simulated network error`);
    }
    return { ...this.response };
  }
}

export interface FreeTierProviderConfig {
  apiKey?: string | undefined;
  model?: string | undefined;
  timeoutMs?: number | undefined;
}

export class GeminiProviderAdapter implements LLMProviderAdapter {
  readonly id = 'gemini';
  readonly model: string;
  private apiKey?: string | undefined;
  private timeoutMs: number;

  constructor(config: FreeTierProviderConfig = {}) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? 'gemini-1.5-flash';
    this.timeoutMs = config.timeoutMs ?? 8000;
  }

  async generateStructured(params: GenerateStructuredParams): Promise<LLMJudgment> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const prompt = `Analyze this environmental marketing claim against guideline rule ${params.ruleId}.
Claim: "${params.claimText}"
Retrieved official clauses:
${params.retrievedChunks.map((c) => `[${c.id}] ${c.document} ${c.clause}: ${c.text}`).join('\n')}

Respond ONLY with JSON matching this format:
{"outcome": "pass" | "flag" | "n/a" | "unsure", "reasoning": "string", "citations": ["chunk_id"], "confidence": 0.0 to 1.0}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Gemini API returned status ${res.status}`);
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');

      return JSON.parse(text) as LLMJudgment;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class GroqProviderAdapter implements LLMProviderAdapter {
  readonly id = 'groq';
  readonly model: string;
  private apiKey?: string | undefined;
  private timeoutMs: number;

  constructor(config: FreeTierProviderConfig = {}) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? 'llama-3.1-8b-instant';
    this.timeoutMs = config.timeoutMs ?? 8000;
  }

  async generateStructured(params: GenerateStructuredParams): Promise<LLMJudgment> {
    if (!this.apiKey) {
      throw new Error('Groq API key is not configured');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const prompt = `Analyze this claim: "${params.claimText}" against rule ${params.ruleId}.
Chunks:
${params.retrievedChunks.map((c) => `[${c.id}] ${c.text}`).join('\n')}
Return JSON: {"outcome": "pass" | "flag" | "n/a" | "unsure", "reasoning": "...", "citations": ["chunk_id"], "confidence": 0.0-1.0}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Groq API returned status ${res.status}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

      return JSON.parse(content) as LLMJudgment;
    } finally {
      clearTimeout(timer);
    }
  }
}
