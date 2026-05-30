import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';
import { deepSeekProviderInfo } from '@/deepseek/deepseek-provider-info';
import { getDeepSeekFromEnv } from '@/env/get-deepseek-from-env';

const env = getDeepSeekFromEnv();
const deepSeekProvider = new OpenAICompatibleProvider({
  info: deepSeekProviderInfo,
  baseUrl: env.baseUrl,
  apiKey: env.apiKey,
});

export { deepSeekProvider };
