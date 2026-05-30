import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';
import { getMiniMaxFromEnv } from '@/env/get-minimax-from-env';
import { miniMaxProviderInfo } from '@/minimax/minimax-provider-info';

const env = getMiniMaxFromEnv();
const miniMaxProvider = new OpenAICompatibleProvider({
  info: miniMaxProviderInfo,
  baseUrl: `${env.baseUrl}/v1`,
  apiKey: env.apiKey,
});

export { miniMaxProvider };
