import { requireEnv } from '@/env/require-env';

interface XiaomiMimoFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: XiaomiMimoFromEnv | undefined;

export function getXiaomiMimoFromEnv(): XiaomiMimoFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('XIAOMI_MIMO_BASE_URL'),
      apiKey: requireEnv('XIAOMI_MIMO_API_KEY'),
    };
  }
  return _config;
}
