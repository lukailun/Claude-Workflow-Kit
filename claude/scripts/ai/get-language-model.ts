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
         const { bigModelLanguageModel } = await import('@/bigmodel/bigmodel-language-model');
      return bigModelLanguageModel;
    }
    case 'minimax': {
        const { miniMaxLanguageModel } = await import('@/minimax/minimax-language-model');
      return miniMaxLanguageModel;
    }
    case 'mimo': {
      const { xiaomiMimoLanguageModel } = await import('@/xiaomi-mimo/xiaomi-mimo-language-model');
      return xiaomiMimoLanguageModel;
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
