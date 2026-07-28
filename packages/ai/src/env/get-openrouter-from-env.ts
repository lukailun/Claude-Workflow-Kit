/**
 * 从环境变量读取 OpenRouter 配置
 */

import { optionalEnv } from '@cwkit/shared/env/require-env';

interface OpenRouterFromEnv {
  baseUrl: string | undefined;
  apiKey: string | undefined;
}

let _config: OpenRouterFromEnv | undefined;

export function getOpenRouterFromEnv(): OpenRouterFromEnv {
  if (!_config) {
    _config = {
      baseUrl: optionalEnv('OPENROUTER_BASE_URL'),
      apiKey: optionalEnv('OPENROUTER_API_KEY'),
    };
  }
  return _config;
}
