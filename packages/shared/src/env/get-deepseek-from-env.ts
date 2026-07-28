import { requireEnv } from './require-env';

interface DeepSeekFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: DeepSeekFromEnv | undefined;

export function getDeepSeekFromEnv(): DeepSeekFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('DEEPSEEK_BASE_URL'),
      apiKey: requireEnv('DEEPSEEK_API_KEY'),
    };
  }
  return _config;
}
