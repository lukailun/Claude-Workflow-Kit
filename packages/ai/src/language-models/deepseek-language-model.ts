import { createAnthropic } from '@ai-sdk/anthropic';
import { getDeepSeekFromEnv } from '@cwkit/shared/env/get-deepseek-from-env';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';

const env = getDeepSeekFromEnv();
const provider = createAnthropic({
  name: 'DeepSeek',
  baseURL: `${env.baseUrl}/anthropic`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const deepSeekLanguageModel: LanguageModel =
  provider.chat('deepseek-v4-flash');
