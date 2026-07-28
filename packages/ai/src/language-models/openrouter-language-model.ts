import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import { getOpenRouterFromEnv } from '../env/get-openrouter-from-env';

const env = getOpenRouterFromEnv();
const provider = createOpenRouter({
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const openRouterLanguageModel: LanguageModel =
  provider.chat('tencent/hy3:free');
// export const openRouterLanguageModel: LanguageModel = provider.chat('openrouter/free');
