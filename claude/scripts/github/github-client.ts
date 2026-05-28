import githubFromEnv from '../env/github-from-env';
import { Octokit } from '@octokit/rest';

const githubClient = new Octokit({
  auth: githubFromEnv.token,
});

export default githubClient;
