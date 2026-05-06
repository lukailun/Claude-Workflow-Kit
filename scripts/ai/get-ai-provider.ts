import AIProvider from './types/ai-provider';

export const AI_PROVIDERS = [
  'anthropic',
  'ark',
  'minimax',
  'bigmodel',
  'mimo',
  'deepseek',
] as const;
export type AI = (typeof AI_PROVIDERS)[number];

export const DEFAULT_AI: AI = 'ark';

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
        '../big-model/big-model-provider'
      );
      return provider;
    }
    case 'minimax': {
      const { default: provider } = await import(
        '../mini-max/mini-max-provider'
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
        '../deep-seek/deep-seek-provider'
      );
      return provider;
    }
  }
}

export default getAIProvider;
