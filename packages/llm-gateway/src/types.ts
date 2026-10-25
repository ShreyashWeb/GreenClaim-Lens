import { z } from 'zod';

export const LLMJudgmentSchema = z.object({
  outcome: z.enum(['pass', 'flag', 'n/a', 'unsure']),
  reasoning: z.string().min(1),
  citations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
export type LLMJudgment = z.infer<typeof LLMJudgmentSchema>;

export interface RetrievedChunkRef {
  id: string;
  document: string;
  clause: string;
  text: string;
}

export interface GenerateStructuredParams {
  claimText: string;
  ruleId: string;
  retrievedChunks: RetrievedChunkRef[];
}

export interface GatewayResult {
  judgment: LLMJudgment;
  providerId: string;
  model: string;
  fromCache: boolean;
}

export interface LLMProviderAdapter {
  readonly id: string;
  readonly model: string;
  generateStructured(params: GenerateStructuredParams): Promise<LLMJudgment>;
}
