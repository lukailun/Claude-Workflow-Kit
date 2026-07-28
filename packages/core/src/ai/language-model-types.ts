export const AI_PROVIDERS = [
  'claude',
  'qwen',
  'deepseek',
  'gemini',
  'glm',
  'longcat',
  'mimo',
  'minimax',
  'openrouter',
  'hy',
] as const;
export type AI = (typeof AI_PROVIDERS)[number];

export const DEFAULT_AI: AI = 'mimo';

export interface LanguageModelInfo {
  provider: string;
  modelId: string;
}

export function getLanguageModelInfo(model: unknown): LanguageModelInfo {
  const m = model as { provider?: string; modelId?: string };
  return {
    provider: m.provider ?? DEFAULT_AI,
    modelId: m.modelId ?? DEFAULT_AI,
  };
}
