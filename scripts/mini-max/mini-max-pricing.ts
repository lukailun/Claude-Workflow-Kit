import type { ModelPricing } from '../ai/types/model-pricing';

const miniMaxPricing: ModelPricing[] = [
  {
    model: 'MiniMax-M2.7-highspeed',
    name: 'MiniMax M2.7 Highspeed',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 4.2,
          inputCacheHit: 0.42,
          output: 16.8,
          cacheWrite: 2.625,
        },
      ],
    },
  },
  {
    model: 'MiniMax-M2.7',
    name: 'MiniMax M2.7',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 2.1,
          inputCacheHit: 0.42,
          output: 8.4,
          cacheWrite: 2.625,
        },
      ],
    },
  },
  {
    model: 'MiniMax-M2.5-highspeed',
    name: 'MiniMax M2.5 Highspeed',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 4.2,
          inputCacheHit: 0.21,
          output: 16.8,
          cacheWrite: 2.625,
        },
      ],
    },
  },
  {
    model: 'MiniMax-M2.5',
    name: 'MiniMax M2.5',
    price: {
      currency: 'CNY',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 2.1,
          inputCacheHit: 0.21,
          output: 8.4,
          cacheWrite: 2.625,
        },
      ],
    },
  },
];

export default miniMaxPricing;
