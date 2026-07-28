import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getDeepSeekFromEnv } from '@lukailun/dev-kit/env/get-deepseek-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getDeepSeekFromEnv();
const provider = createAnthropic({
  name: 'DeepSeek',
  baseURL: `${env.baseUrl}/anthropic`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const deepSeekLanguageModel: LanguageModel =
  provider.chat('deepseek-v4-flash');
