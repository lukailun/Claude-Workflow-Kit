import gitlabFromEnv from '../env/gitlab-from-env';
import { Gitlab } from '@gitbeaker/rest';

const gitlabClient = new Gitlab({
  host: gitlabFromEnv.host,
  token: gitlabFromEnv.token,
});

export default gitlabClient;
