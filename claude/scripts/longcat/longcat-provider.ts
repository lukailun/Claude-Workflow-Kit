<<<<<<< HEAD
=======
import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';
>>>>>>> 0aaa448 (update)
import { getLongCatFromEnv } from '@/env/get-longcat-from-env';
import { longCatProviderInfo } from '@/longcat/longcat-provider-info';
import { OpenAICompatibleProvider } from '@/ai/openai-compatible-provider';

const env = getLongCatFromEnv();
const longCatProvider = new OpenAICompatibleProvider({
  info: longCatProviderInfo,
<<<<<<< HEAD
  baseUrl: `${env.baseUrl}/openai`,
=======
  baseUrl: env.baseUrl,
>>>>>>> 0aaa448 (update)
  apiKey: env.apiKey,
});

export { longCatProvider };
