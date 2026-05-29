import type { AIProvider } from '@/ai/types';

export const AI_PROVIDERS = [
  'anthropic',
  'ark',
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
      const { anthropicProvider } = await import('@/anthropic');
      return anthropicProvider;
    }
    case 'bigmodel': {
      const { bigModelProvider } = await import('@/bigmodel');
      return bigModelProvider;
    }
    case 'minimax': {
      const { miniMaxProvider } = await import('@/minimax');
      return miniMaxProvider;
    }
    case 'ark': {
      const { arkCodingPlanProvider } = await import('@/ark-coding-plan');
      return arkCodingPlanProvider;
    }
    case 'mimo': {
      const { xiaomiMimoProvider } = await import('@/xiaomi-mimo');
      return xiaomiMimoProvider;
    }
    case 'deepseek': {
      const { deepSeekProvider } = await import('@/deepseek');
      return deepSeekProvider;
    }
    case 'longcat': {
      const { longCatProvider } = await import('@/longcat');
      return longCatProvider;
    }
  }
}

export { getAIProvider };
