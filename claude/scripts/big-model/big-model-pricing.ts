import type { ModelPricing } from '@/ai/types/model-pricing';

const bigModelPricing: ModelPricing[] = [
  {
    model: 'glm-5.1',
    name: 'GLM-5.1',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 32_000,
          inputCacheMiss: 6,
          inputCacheHit: 1.3,
          output: 24,
          cacheWrite: 0,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 8,
          inputCacheHit: 2,
          output: 28,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'glm-5-turbo',
    name: 'GLM-5 Turbo',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 32_000,
          inputCacheMiss: 5,
          inputCacheHit: 1.2,
          output: 22,
          cacheWrite: 0,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 7,
          inputCacheHit: 1.8,
          output: 26,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'glm-5',
    name: 'GLM-5',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 32_000,
          inputCacheMiss: 4,
          inputCacheHit: 1,
          output: 18,
          cacheWrite: 0,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 6,
          inputCacheHit: 1.5,
          output: 22,
          cacheWrite: 0,
        },
      ],
    },
  },
];

export default bigModelPricing;
