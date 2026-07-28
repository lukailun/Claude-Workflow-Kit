import { requireEnv } from './require-env';

interface MiniMaxFromEnv {
  baseUrl: string;
  apiKey: string;
}

let _config: MiniMaxFromEnv | undefined;

export function getMiniMaxFromEnv(): MiniMaxFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('MINIMAX_BASE_URL'),
      apiKey: requireEnv('MINIMAX_API_KEY'),
    };
  }
  return _config;
}
