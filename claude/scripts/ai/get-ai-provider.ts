/**
 * AI Model 工厂
 *
 * 根据名称返回对应的 LanguageModel
 */
import { LanguageModel } from 'ai';

export const AI_PROVIDERS = [
  'anthropic',
  'minimax',
  'bigmodel',
  'mimo',
  'deepseek',
  'longcat',
] as const;
export type AI = (typeof AI_PROVIDERS)[number];

export const DEFAULT_AI: AI = 'longcat';

async function getLanguageModel(ai?: AI): Promise<LanguageModel> {
  switch (ai ?? DEFAULT_AI) {
    case 'anthropic': {
        const { longCatLanguageModel } = await import('@/longcat/longcat-language-model');
      return longCatLanguageModel;
    }
    case 'bigmodel': {
         const { longCatLanguageModel } = await import('@/longcat/longcat-language-model');
      return longCatLanguageModel;
    }
    case 'minimax': {
        const { longCatLanguageModel } = await import('@/longcat/longcat-language-model');
      return longCatLanguageModel;
    }
    case 'mimo': {
          const { longCatLanguageModel } = await import('@/longcat/longcat-language-model');
      return longCatLanguageModel;
    }
    case 'deepseek': {
      const { longCatLanguageModel } = await import('@/longcat/longcat-language-model');
      return longCatLanguageModel;
    }
    case 'longcat': {
      const { longCatLanguageModel } = await import('@/longcat/longcat-language-model');
      return longCatLanguageModel;
    }
  }
}

export { getLanguageModel };
