import type { AIProvider } from '@/ai/types';

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

async function getAIProvider(ai?: AI): Promise<AIProvider> {
  switch (ai ?? DEFAULT_AI) {
    case 'anthropic': {
      const { anthropicProvider } = await import('@/anthropic/anthropic-provider');
      return anthropicProvider;
    }
    case 'bigmodel': {
      const { bigModelProvider } = await import('@/bigmodel/bigmodel-provider');
      return bigModelProvider;
    }
    case 'minimax': {
      const { miniMaxProvider } = await import('@/minimax/minimax-provider');
      return miniMaxProvider;
    }
    case 'mimo': {
      const { xiaomiMimoProvider } = await import('@/xiaomi-mimo/xiaomi-mimo-provider');
      return xiaomiMimoProvider;
    }
    case 'deepseek': {
      const { deepSeekProvider } = await import('@/deepseek/deepseek-provider');
      return deepSeekProvider;
    }
    case 'longcat': {
      const { longCatProvider } = await import('@/longcat/longcat-provider');
      return longCatProvider;
    }
  }
}

export { getAIProvider };
