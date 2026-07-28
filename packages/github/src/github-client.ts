import { Octokit } from '@octokit/rest';
import { getGithubFromEnv } from '@lukailun/dev-kit/env/get-github-from-env';

const env = getGithubFromEnv()
const githubClient: InstanceType<typeof Octokit> = new Octokit({
  baseUrl: env.baseUrl,
  auth: env.token,
});

export { githubClient };
