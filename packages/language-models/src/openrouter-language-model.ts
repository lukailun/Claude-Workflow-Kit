import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModel } from 'ai';
import { getOpenRouterFromEnv } from '@lukailun/dev-kit/env/get-openrouter-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getOpenRouterFromEnv();
const provider = createOpenRouter({
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const openRouterLanguageModel: LanguageModel =
  provider.chat('tencent/hy3:free');
// export const openRouterLanguageModel: LanguageModel = provider.chat('openrouter/free');
