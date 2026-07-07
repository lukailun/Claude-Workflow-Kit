/**
 * AI Model 工厂
 *
 * 根据名称返回对应的 LanguageModel
 */
import { LanguageModel } from 'ai';

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

export async function getLanguageModel(ai?: AI): Promise<LanguageModel> {
  switch (ai ?? DEFAULT_AI) {
    case 'claude': {
      const { claudeLanguageModel } = await import(
        '@/language-models/claude/anthropic-language-model'
      );
      return claudeLanguageModel;
    }
    case 'gemini': {
      const { geminiLanguageModel } = await import(
        '@/language-models/gemini/gemini-language-model'
      );
      return geminiLanguageModel;
    }
    case 'glm': {
      const { glmLanguageModel } = await import(
        '@/language-models/glm/glm-language-model'
      );
      return glmLanguageModel;
    }
    case 'hy': {
      const { hyLanguageModel } = await import(
        '@/language-models/hy/hy-language-model'
      );
      return hyLanguageModel;
    }
    case 'minimax': {
      const { miniMaxLanguageModel } = await import(
        '@/language-models/minimax/minimax-language-model'
      );
      return miniMaxLanguageModel;
    }
    case 'mimo': {
      const { mimoLanguageModel } = await import(
        '@/language-models/mimo/mimo-language-model'
      );
      return mimoLanguageModel;
    }
    case 'deepseek': {
      const { deepSeekLanguageModel } = await import(
        '@/language-models/deepseek/deepseek-language-model'
      );
      return deepSeekLanguageModel;
    }
    case 'qwen': {
      const { qwenLanguageModel } = await import(
        '@/language-models/qwen/qwen-language-model'
      );
      return qwenLanguageModel;
    }
    case 'longcat': {
      const { longCatLanguageModel } = await import(
        '@/language-models/longcat/longcat-language-model'
      );
      return longCatLanguageModel;
    }
    case 'openrouter': {
      const { openRouterLanguageModel } = await import(
        '@/language-models/openrouter/openrouter-language-model'
      );
      return openRouterLanguageModel;
    }
  }
}

export function getLanguageModelInfo(model: LanguageModel): LanguageModelInfo {
  const languageModel = model as { provider?: string; modelId?: string };
  return {
    provider: languageModel.provider ?? DEFAULT_AI,
    modelId: languageModel.modelId ?? DEFAULT_AI,
  };
}
