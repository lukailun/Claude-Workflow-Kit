import type { ModelPricing } from '../ai/types/model-pricing';

const deepSeekPricing: ModelPricing[] = [
  {
    model: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
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
    model: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
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
];

export default deepSeekPricing;
