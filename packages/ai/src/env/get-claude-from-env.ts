import { optionalEnv, requireEnv, requireOneOfEnv } from '@cwkit/shared/env/require-env';

interface ClaudeFromEnv {
  baseUrl: string;
  apiKey: string | undefined;
  authToken: string | undefined;
}

let _config: ClaudeFromEnv | undefined;

export function getClaudeFromEnv(): ClaudeFromEnv {
  if (!_config) {
    requireOneOfEnv(['CLAUDE_API_KEY', 'CLAUDE_AUTH_TOKEN']);
    _config = {
      baseUrl: requireEnv('CLAUDE_BASE_URL'),
      apiKey: optionalEnv('CLAUDE_API_KEY'),
      authToken: optionalEnv('CLAUDE_AUTH_TOKEN'),
    };
  }
  return _config;
}
