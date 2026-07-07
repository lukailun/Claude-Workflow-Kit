import { requireEnv } from '@/env/require-env';

interface SentryFromEnv {
  apiKey: string;
  baseUrl: string;
  organization: string;
  project: string;
}

let _config: SentryFromEnv | undefined;

export function getSentryFromEnv(): SentryFromEnv {
  if (!_config) {
    _config = {
      apiKey: requireEnv('SENTRY_API_KEY'),
      baseUrl: requireEnv('SENTRY_BASE_URL'),
      organization: requireEnv('SENTRY_ORGANIZATION'),
      project: requireEnv('SENTRY_PROJECT'),
    };
  }
  return _config;
}
