import { requireEnv } from '@/env/require-env';

interface HyFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: HyFromEnv | undefined;

export function getHyFromEnv(): HyFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('HY_BASE_URL'),
      apiKey: requireEnv('HY_API_KEY'),
    };
  }
  return _config;
}
