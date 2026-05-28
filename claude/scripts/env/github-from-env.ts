import { env } from 'process';
import envPath from '@/env/env-path';

interface GithubFromEnv {
  token: string;
}

const token = env.GITHUB_TOKEN;
if (!token) {
  console.error('[错误]: 未配置 GITHUB_TOKEN 环境变量');
  console.error(`请在 ${envPath} 文件中配置 GITHUB_TOKEN`);
  process.exit(1);
}

const githubFromEnv = {
  token,
} satisfies GithubFromEnv;

export default githubFromEnv;
