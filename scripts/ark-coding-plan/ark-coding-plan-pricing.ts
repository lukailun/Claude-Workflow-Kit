import type { ModelPricing } from '../ai/types/model-pricing';

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
];

export default arkCodingPlanPricing;
