import type { ModelPricing } from '@/ai/types/model-pricing';

const kimiPricing: ModelPricing[] = [
  {
    model: 'kimi-for-coding',
    name: 'Kimi for Coding',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 6.5,
          inputCacheHit: 1.1,
          output: 27,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'kimi-k2.6',
    name: 'Kimi K2.6',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 6.5,
          inputCacheHit: 1.1,
          output: 27,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'kimi-k2.5',
    name: 'Kimi K2.5',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 4,
          inputCacheHit: 0.7,
          output: 21,
          cacheWrite: 0,
        },
      ],
    },
  },
];

export { kimiPricing };
