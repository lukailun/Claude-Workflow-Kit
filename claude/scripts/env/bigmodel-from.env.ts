import { env } from 'process';
import { envPath } from '@/env';

interface BigModelFromEnv {
  baseUrl: string;
  apiKey: string;
}

const baseUrl = env.BIGMODEL_BASE_URL;
const apiKey = env.BIGMODEL_API_KEY;

if (!baseUrl) {
  console.error('[错误]: 未配置 BIGMODEL_BASE_URL 环境变量');
  console.error(`请在 ${envPath} 文件中配置 BIGMODEL_BASE_URL`);
  process.exit(1);
}

if (!apiKey) {
  console.error('[错误]: 未配置 BIGMODEL_API_KEY 环境变量');
  console.error(`请在 ${envPath} 文件中配置 BIGMODEL_API_KEY`);
  process.exit(1);
}

const bigModelFromEnv = {
  baseUrl,
  apiKey,
} satisfies BigModelFromEnv;

export { bigModelFromEnv };
