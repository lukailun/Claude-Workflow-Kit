import { Octokit } from '@octokit/rest';
import githubFromEnv from '@/env/github-from-env';

const githubClient = new Octokit({
  auth: githubFromEnv.token,
});

export default githubClient;
