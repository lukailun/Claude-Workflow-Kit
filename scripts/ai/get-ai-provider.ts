import AIProvider from './types/ai-provider';

export type AI = 'anthropic' | 'ark' | 'minimax' | 'zai';

export const DEFAULT_AI: AI = 'ark';

async function getAIProvider(ai?: AI): Promise<AIProvider> {
  switch (ai ?? DEFAULT_AI) {
    case 'anthropic': {
      const { default: provider } = await import(
        '../anthropic/anthropic-provider'
      );
      return provider;
    }
    case 'zai': {
      const { default: provider } = await import('../z-ai/z-ai-provider');
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
  }
}

export default getAIProvider;
