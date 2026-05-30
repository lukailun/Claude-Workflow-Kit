import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';
import { bigModelProviderInfo } from '@/bigmodel/bigmodel-provider-info';
import { getBigModelFromEnv } from '@/env/get-bigmodel-from-env';

const env = getBigModelFromEnv();
const bigModelProvider =  new OpenAICompatibleProvider({
  info: bigModelProviderInfo,
  baseUrl: `${env.baseUrl}/api/paas/v4`,
  apiKey: env.apiKey,
});
export { bigModelProvider };
