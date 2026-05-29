import AIProvider from '@/ai/types/ai-provider';

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
      const { default: provider } = await import(
        '../anthropic/anthropic-provider'
      );
      return provider;
    }
    case 'bigmodel': {
      const { default: provider } = await import(
        '../bigmodel/bigmodel-provider'
      );
      return provider;
    }
    case 'minimax': {
      const { default: provider } = await import(
        '../minimax/mini-max-provider'
      );
      return provider;
    }
    case 'ark': {
      const { default: provider } = await import(
        '../ark-coding-plan/ark-coding-plan-provider'
      );
      return provider;
    }
    case 'mimo': {
      const { default: provider } = await import(
        '../xiaomi-mimo/xiaomi-mimo-provider'
      );
      return provider;
    }
    case 'deepseek': {
      const { default: provider } = await import(
        '../deepseek/deepseek-provider'
      );
      return provider;
    }
    case 'longcat': {
      const { default: provider } = await import(
        '../longcat/longcat-provider'
      );
      return provider;
    }
  }
}

export default getAIProvider;
