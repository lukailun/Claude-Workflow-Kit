/**
 * AI Model 工厂
 *
 * 根据名称返回对应的 LanguageModel
 */
import { LanguageModel } from 'ai';
import {
  AI_PROVIDERS,
  DEFAULT_AI,
  type AI,
  type LanguageModelInfo,
} from '@lukailun/dev-kit/ai/language-model-types';

export { AI_PROVIDERS, DEFAULT_AI, type AI, type LanguageModelInfo };

export async function getLanguageModel(ai?: AI): Promise<LanguageModel> {
  switch (ai ?? DEFAULT_AI) {
    case 'claude': {
      const { claudeLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/anthropic-language-model'
      );
      return claudeLanguageModel;
    }
    case 'gemini': {
      const { geminiLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/gemini-language-model'
      );
      return geminiLanguageModel;
    }
    case 'glm': {
      const { glmLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/glm-language-model'
      );
      return glmLanguageModel;
    }
    case 'hy': {
      const { hyLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/hy-language-model'
      );
      return hyLanguageModel;
    }
    case 'minimax': {
      const { miniMaxLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/minimax-language-model'
      );
      return miniMaxLanguageModel;
    }
    case 'mimo': {
      const { mimoLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/mimo-language-model'
      );
      return mimoLanguageModel;
    }
    case 'deepseek': {
      const { deepSeekLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/deepseek-language-model'
      );
      return deepSeekLanguageModel;
    }
    case 'qwen': {
      const { qwenLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/qwen-language-model'
      );
      return qwenLanguageModel;
    }
    case 'longcat': {
      const { longCatLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/longcat-language-model'
      );
      return longCatLanguageModel;
    }
    case 'openrouter': {
      const { openRouterLanguageModel } = await import(
        '@lukailun/dev-kit-language-models/openrouter-language-model'
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
