import { requireEnv } from '@/env/require-env';

interface LongCatFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: LongCatFromEnv | undefined;

export function getLongCatFromEnv(): LongCatFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('LONGCAT_BASE_URL'),
      apiKey: requireEnv('LONGCAT_API_KEY'),
    };
  }
  return _config;
}
