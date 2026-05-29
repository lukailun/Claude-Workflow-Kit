import type { ModelPricing } from '@/ai/types/model-pricing';

const arkCodingPlanPricing: ModelPricing[] = [
  {
    model: 'doubao-seed-2-0-pro-260215',
    name: 'Doubao Seed 2.0 Pro',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 32_000,
          inputCacheMiss: 3.2,
          inputCacheHit: 0.64,
          output: 16,
          cacheWrite: 0.017,
        },
        {
          maxInputTokens: 128_000,
          inputCacheMiss: 4.8,
          inputCacheHit: 0.96,
          output: 24,
          cacheWrite: 0.017,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 9.6,
          inputCacheHit: 1.92,
          output: 48,
          cacheWrite: 0.017,
        },
      ],
    },
  },
  {
    model: 'doubao-seed-2-0-lite-260428',
    name: 'Doubao Seed 2.0 Lite',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 32_000,
          inputCacheMiss: 0.6,
          inputCacheHit: 0.12,
          output: 3.6,
          cacheWrite: 0.017,
        },
        {
          maxInputTokens: 128_000,
          inputCacheMiss: 0.9,
          inputCacheHit: 0.18,
          output: 5.4,
          cacheWrite: 0.017,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 1.8,
          inputCacheHit: 0.36,
          output: 10.8,
          cacheWrite: 0.017,
        },
      ],
    },
  },
  {
    model: 'doubao-seed-2-0-mini-260428',
    name: 'Doubao Seed 2.0 Mini',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: 32_000,
          inputCacheMiss: 0.2,
          inputCacheHit: 0.04,
          output: 2,
          cacheWrite: 0.017,
        },
        {
          maxInputTokens: 128_000,
          inputCacheMiss: 0.4,
          inputCacheHit: 0.08,
          output: 4,
          cacheWrite: 0.017,
        },
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 0.8,
          inputCacheHit: 0.16,
          output: 8,
          cacheWrite: 0.017,
        },
      ],
    },
  },
];

export { arkCodingPlanPricing };
