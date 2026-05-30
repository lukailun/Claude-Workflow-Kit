import { Octokit } from '@octokit/rest';
import { getGithubFromEnv } from '@/env/get-github-from-env';

const env = getGithubFromEnv()
const githubClient = new Octokit({
  // baseUrl: env.baseUrl,
  auth: env.token,
});

export { githubClient };
