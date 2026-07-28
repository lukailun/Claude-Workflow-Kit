import { Gitlab } from '@gitbeaker/rest';
import { getGitlabFromEnv } from '@lukailun/dev-kit/env/get-gitlab-from-env';

const env = getGitlabFromEnv();
export const gitlabClient: InstanceType<typeof Gitlab> = new Gitlab({
  host: env.baseUrl,
  token: env.token,
});
