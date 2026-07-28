import { requireEnv } from '@cwkit/shared/env/require-env';

interface GithubFromEnv {
  baseUrl: string;
  token: string;
}

let _config: GithubFromEnv | undefined;

export function getGithubFromEnv(): GithubFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('GITHUB_BASE_URL'),
      token: requireEnv('GITHUB_TOKEN'),
    };
  }
  return _config;
}
