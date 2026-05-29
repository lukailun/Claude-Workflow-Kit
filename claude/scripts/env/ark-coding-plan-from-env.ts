import { env } from 'process';
import { envPath } from '@/env';

interface ArkCodingPlanFromEnv {
  baseUrl: string;
  apiKey: string;
}

const baseUrl = env.ARK_CODING_PLAN_BASE_URL;
const apiKey = env.ARK_CODING_PLAN_API_KEY;

if (!baseUrl) {
  console.error('[错误]: 未配置 ARK_CODING_PLAN_BASE_URL 环境变量');
  console.error(`请在 ${envPath} 文件中配置 ARK_CODING_PLAN_BASE_URL`);
  process.exit(1);
}

if (!apiKey) {
  console.error('[错误]: 未配置 ARK_CODING_PLAN_API_KEY 环境变量');
  console.error(`请在 ${envPath} 文件中配置 ARK_CODING_PLAN_API_KEY`);
  process.exit(1);
}

const arkCodingPlanFromEnv = {
  baseUrl,
  apiKey,
} satisfies ArkCodingPlanFromEnv;

export { arkCodingPlanFromEnv };
