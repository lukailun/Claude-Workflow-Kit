import { env } from 'process';
import envPath from './env-path';

interface AnthropicFromEnv {
  baseUrl: string;
  apiKey: string | undefined;
  authToken: string | undefined;
}

const baseUrl = env.ANTHROPIC_BASE_URL;
const apiKey = env.ANTHROPIC_API_KEY;
const authToken = env.ANTHROPIC_AUTH_TOKEN;

if (!baseUrl) {
  console.error('[错误]: 未配置 ANTHROPIC_BASE_URL 环境变量');
  console.error(`请在 ${envPath} 文件中配置 ANTHROPIC_BASE_URL`);
  process.exit(1);
}

if (!apiKey && !authToken) {
  console.error(
    '[错误]: 未配置 ANTHROPIC_API_KEY 或 ANTHROPIC_AUTH_TOKEN 环境变量'
  );
  console.error(
    `请在 ${envPath} 文件中配置 ANTHROPIC_API_KEY 或 ANTHROPIC_AUTH_TOKEN`
  );
  process.exit(1);
}

const anthropicFromEnv = {
  baseUrl,
  apiKey,
  authToken,
} satisfies AnthropicFromEnv;

export default anthropicFromEnv;
