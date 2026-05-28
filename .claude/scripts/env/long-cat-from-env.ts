import { env } from 'process';
import envPath from './env-path';

interface LongCatFromEnv {
  baseUrl: string;
  apiKey: string;
}

const baseUrl = env.LONG_CAT_BASE_URL;
const apiKey = env.LONG_CAT_API_KEY;

if (!baseUrl) {
  console.error('[错误]: 未配置 LONG_CAT_BASE_URL 环境变量');
  console.error(`请在 ${envPath} 文件中配置 LONG_CAT_BASE_URL`);
  process.exit(1);
}

if (!apiKey) {
  console.error('[错误]: 未配置 LONG_CAT_API_KEY 环境变量');
  console.error(`请在 ${envPath} 文件中配置 LONG_CAT_API_KEY`);
  process.exit(1);
}

const longCatFromEnv = {
  baseUrl,
  apiKey,
} satisfies LongCatFromEnv;

export default longCatFromEnv;
