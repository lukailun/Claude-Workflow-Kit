import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';
import { getLongCatFromEnv } from '@/env/get-longcat-from-env';
import { longCatProviderInfo } from '@/longcat/longcat-provider-info';

const env = getLongCatFromEnv();
const longCatProvider = new OpenAICompatibleProvider({
  info: longCatProviderInfo,
  baseUrl: `${env.baseUrl}/openai`,
  apiKey: env.apiKey,
});

export { longCatProvider };