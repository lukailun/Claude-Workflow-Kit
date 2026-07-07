import { Gitlab } from '@gitbeaker/rest';
import { getGitlabFromEnv } from '@/env/get-gitlab-from-env';

const env = getGitlabFromEnv();
const gitlabClient = new Gitlab({
  host: env.baseUrl,
  token: env.token,
});

export { gitlabClient };
