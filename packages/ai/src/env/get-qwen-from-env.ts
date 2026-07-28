import { requireEnv } from '@cwkit/shared/env/require-env';

interface QwenFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: QwenFromEnv | undefined;

export function getQwenFromEnv(): QwenFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('QWEN_BASE_URL'),
      apiKey: requireEnv('QWEN_API_KEY'),
    };
  }
  return _config;
}
