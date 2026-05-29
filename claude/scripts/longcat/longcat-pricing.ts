import type { ModelPricing } from '@/ai/types/model-pricing';

const longCatPricing: ModelPricing[] = [
  {
    model: 'LongCat-2.0-Preview',
    name: 'LongCat 2.0 Preview',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 0,
          inputCacheHit: 0,
          output: 0,
          cacheWrite: 0,
        },
      ],
    },
  },
];

export default longCatPricing;
