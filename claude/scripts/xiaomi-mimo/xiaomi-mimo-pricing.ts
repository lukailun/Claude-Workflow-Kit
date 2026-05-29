import type { ModelPricing } from '@/ai/types/model-pricing';

const xiaomiMimoPricing: ModelPricing[] = [
  {
    model: 'mimo-v2.5-pro',
    name: 'MiMo v2.5 Pro',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 3,
          inputCacheHit: 0.025,
          output: 6,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'mimo-v2.5',
    name: 'MiMo v2.5',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 1,
          inputCacheHit: 0.02,
          output: 2,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'mimo-v2-pro',
    name: 'MiMo v2 Pro',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 256_000,
          inputCacheMiss: 7,
          inputCacheHit: 1.4,
          output: 21,
          cacheWrite: 0,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 14,
          inputCacheHit: 2.8,
          output: 42,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'mimo-v2-omni',
    name: 'MiMo v2 Omni',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 256_000,
          inputCacheMiss: 2.8,
          inputCacheHit: 0.56,
          output: 14,
          cacheWrite: 0,
        },
      ],
    },
  },
  {
    model: 'mimo-v2-flash',
    name: 'MiMo v2 Flash',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 256_000,
          inputCacheMiss: 0.7,
          inputCacheHit: 0.07,
          output: 2.1,
          cacheWrite: 0,
        },
      ],
    },
  },
];

export { xiaomiMimoPricing };
