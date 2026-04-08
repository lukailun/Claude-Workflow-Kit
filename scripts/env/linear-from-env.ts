import { env } from 'process';
import envPath from './env-path';

interface LinearFromEnv {
  apiKey: string;
}

const apiKey = env.LINEAR_API_KEY;
if (!apiKey) {
  console.error('[错误]: 未配置 LINEAR_API_KEY 环境变量');
  console.error(`请在 ${envPath} 文件中配置 LINEAR_API_KEY`);
  process.exit(1);
}

const linearFromEnv = {
  apiKey,
} satisfies LinearFromEnv;

export default linearFromEnv;
