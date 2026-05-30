import { getLongCatFromEnv } from '@/env/get-longcat-from-env';
import { longCatProviderInfo } from '@/longcat/longcat-provider-info';
import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';

const env = getLongCatFromEnv();
const longCatProvider = new OpenAICompatibleProvider({
  info: longCatProviderInfo,
  baseUrl: `${env.baseUrl}/openai`,
  apiKey: env.apiKey,
});

export { longCatProvider };