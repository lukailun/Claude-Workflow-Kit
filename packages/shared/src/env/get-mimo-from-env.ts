import { requireEnv } from './require-env';

interface MimoFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: MimoFromEnv | undefined;

export function getMimoFromEnv(): MimoFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('MIMO_BASE_URL'),
      apiKey: requireEnv('MIMO_API_KEY'),
    };
  }
  return _config;
}
