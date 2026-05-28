import type { ModelPricing } from '@/ai/types/model-pricing';

const anthropicPricing: ModelPricing[] = [
  {
    model: 'claude-opus-4-7',
    name: 'Claude Opus 4.7',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 5,
          inputCacheHit: 0.5,
          output: 25,
          cacheWrite: 6.25,
        },
      ],
    },
  },
  {
    model: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 5,
          inputCacheHit: 0.5,
          output: 25,
          cacheWrite: 6.25,
        },
      ],
    },
  },
  {
    model: 'claude-opus-4-5',
    name: 'Claude Opus 4.5',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 5,
          inputCacheHit: 0.5,
          output: 25,
          cacheWrite: 6.25,
        },
      ],
    },
  },
  {
    model: 'claude-opus-4-1',
    name: 'Claude Opus 4.1',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 15,
          inputCacheHit: 1.5,
          output: 75,
          cacheWrite: 18.75,
        },
      ],
    },
  },
  {
    model: 'claude-opus-4',
    name: 'Claude Opus 4',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 15,
          inputCacheHit: 1.5,
          output: 75,
          cacheWrite: 18.75,
        },
      ],
    },
  },
  {
    model: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 3,
          inputCacheHit: 0.3,
          output: 15,
          cacheWrite: 3.75,
        },
      ],
    },
  },
  {
    model: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 3,
          inputCacheHit: 0.3,
          output: 15,
          cacheWrite: 3.75,
        },
      ],
    },
  },
  {
    model: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 3,
          inputCacheHit: 0.3,
          output: 15,
          cacheWrite: 3.75,
        },
      ],
    },
  },
  {
    model: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 1,
          inputCacheHit: 0.1,
          output: 5,
          cacheWrite: 1.25,
        },
      ],
    },
  },
  {
    model: 'claude-haiku-3-5',
    name: 'Claude Haiku 3.5',
    price: {
      currency: 'USD',
      tiers: [
        {
          maxInputTokens: Infinity,
          inputCacheMiss: 0.8,
          inputCacheHit: 0.08,
          output: 4,
          cacheWrite: 1,
        },
      ],
    },
  },
];

export default anthropicPricing;
