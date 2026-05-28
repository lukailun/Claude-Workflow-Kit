import { env } from 'process';
import envPath from './env-path';

interface DeepSeekFromEnv {
  baseUrl: string;
  apiKey: string;
}

const baseUrl = env.DEEP_SEEK_BASE_URL;
const apiKey = env.DEEP_SEEK_API_KEY;

if (!baseUrl) {
  console.error('[错误]: 未配置 DEEP_SEEK_BASE_URL 环境变量');
  console.error(`请在 ${envPath} 文件中配置 DEEP_SEEK_BASE_URL`);
  process.exit(1);
}

if (!apiKey) {
  console.error('[错误]: 未配置 DEEP_SEEK_API_KEY 环境变量');
  console.error(`请在 ${envPath} 文件中配置 DEEP_SEEK_API_KEY`);
  process.exit(1);
}

const deepSeekFromEnv = {
  baseUrl,
  apiKey,
} satisfies DeepSeekFromEnv;

export default deepSeekFromEnv;
