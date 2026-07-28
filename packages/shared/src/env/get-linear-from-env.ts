import { requireEnv } from './require-env';

interface LinearFromEnv {
  apiKey: string;
}

let _config: LinearFromEnv | undefined;

export function getLinearFromEnv(): LinearFromEnv {
  if (!_config) {
    _config = {
      apiKey: requireEnv('LINEAR_API_KEY'),
    };
  }
  return _config;
}
