import { requireEnv } from '@/env/require-env';

interface BigModelFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: BigModelFromEnv | undefined;

export function getBigModelFromEnv(): BigModelFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('BIGMODEL_BASE_URL'),
      apiKey: requireEnv('BIGMODEL_API_KEY'),
    };
  }
  return _config;
}
