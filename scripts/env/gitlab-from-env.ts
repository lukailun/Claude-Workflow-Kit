import { env } from 'process';
import envPath from './env-path';

interface GitlabFromEnv {
  host: string;
  token: string;
}

const host = env.GITLAB_HOST;
if (!host) {
  console.error('[错误]: 未配置 GITLAB_HOST 环境变量');
  console.error(`请在 ${envPath} 文件中配置 GITLAB_HOST`);
  process.exit(1);
}
const token = env.GITLAB_TOKEN;
if (!token) {
  console.error('[错误]: 未配置 GITLAB_TOKEN 环境变量');
  console.error(`请在 ${envPath} 文件中配置 GITLAB_TOKEN`);
  process.exit(1);
}

const gitlabFromEnv = {
  host,
  token,
} satisfies GitlabFromEnv;

export default gitlabFromEnv;
