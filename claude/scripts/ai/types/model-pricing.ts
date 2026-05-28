import Currency from '@/ai/types/currency';

export interface PricingPlan {
  /** 货币单位 */
  currency: Currency;
  /** 按输入 token 数分级的价格 */
  tiers: PriceTier[];
}

export interface PriceTier {
  /** 该档位的最大输入 token 数 */
  maxInputTokens: number;
  /** 输入（缓存命中）- 每 1M token */
  inputCacheHit: number;
  /** 输入（缓存未命中）- 每 1M token */
  inputCacheMiss: number;
  /** 输出 - 每 1M token */
  output: number;
  /** 缓存写入 - 每 1M token */
  cacheWrite: number;
}

export interface ModelPricing {
  /** 模型 ID（API 参数名） */
  model: string;
  /** 模型显示名称 */
  name: string;
  /** 价格 */
  price: PricingPlan;
}
