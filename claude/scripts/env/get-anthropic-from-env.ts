import { requireEnv, optionalEnv } from '@/env/require-env';

interface AnthropicFromEnv {
  baseUrl: string;
  apiKey: string | undefined;
  authToken: string | undefined;
}

let _config: AnthropicFromEnv | undefined;

export function getAnthropicFromEnv(): AnthropicFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('ANTHROPIC_BASE_URL'),
      apiKey: optionalEnv('ANTHROPIC_API_KEY'),
      authToken: optionalEnv('ANTHROPIC_AUTH_TOKEN'),
    };
    if (!_config.apiKey && !_config.authToken) {
      throw new Error(
        '[错误]: 未配置 ANTHROPIC_API_KEY 或 ANTHROPIC_AUTH_TOKEN 环境变量'
      );
    }
  }
  return _config;
}
