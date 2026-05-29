import { Octokit } from '@octokit/rest';
import { githubFromEnv } from '@/env';

const githubClient = new Octokit({
  auth: githubFromEnv.token,
});

export { githubClient };
