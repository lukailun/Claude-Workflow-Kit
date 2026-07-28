import { Gitlab } from '@gitbeaker/rest';
import { getGitlabFromEnv } from './get-gitlab-from-env';

const env = getGitlabFromEnv();
export const gitlabClient = new Gitlab({
  host: env.baseUrl,
  token: env.token,
});
