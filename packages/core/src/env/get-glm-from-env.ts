import { requireEnv } from '@/env/require-env';

interface GlmFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: GlmFromEnv | undefined;

export function getGlmFromEnv(): GlmFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('GLM_BASE_URL'),
      apiKey: requireEnv('GLM_API_KEY'),
    };
  }
  return _config;
}
