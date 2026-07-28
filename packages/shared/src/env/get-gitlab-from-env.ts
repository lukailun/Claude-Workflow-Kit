import { requireEnv } from './require-env';

interface GitlabFromEnv {
  baseUrl: string;
  token: string;
}

let _config: GitlabFromEnv | undefined;

export function getGitlabFromEnv(): GitlabFromEnv {
  if (!_config) {
    _config = {
      baseUrl: requireEnv('GITLAB_BASE_URL'),
      token: requireEnv('GITLAB_TOKEN'),
    };
  }
  return _config;
}
