/**
 * 从环境变量读取 OpenRouter 配置
 */

import { optionalEnv } from '@/env/require-env';

interface OpenRouterFromEnv {
  apiKey: string | undefined;
}

let _config: OpenRouterFromEnv | undefined;

export function getOpenRouterFromEnv(): OpenRouterFromEnv {
  if (!_config) {
    _config = {
      apiKey: optionalEnv('OPENROUTER_API_KEY'),
    };
  }
  return _config;
}
