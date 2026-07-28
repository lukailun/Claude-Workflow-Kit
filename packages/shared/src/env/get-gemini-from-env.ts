import { requireEnv } from './require-env';

interface GeminiFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: GeminiFromEnv | undefined;

export function getGeminiFromEnv(): GeminiFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('GEMINI_BASE_URL'),
      apiKey: requireEnv('GEMINI_API_KEY'),
    };
  }
  return _config;
}
