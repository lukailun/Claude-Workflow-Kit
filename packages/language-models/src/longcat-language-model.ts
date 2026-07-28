import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getLongCatFromEnv } from '@lukailun/dev-kit/env/get-longcat-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getLongCatFromEnv();
const provider = createAnthropic({
  name: 'LongCat',
  baseURL: `${env.baseUrl}/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
  headers: { Authorization: `Bearer ${env.apiKey}` },
});

export const longCatLanguageModel: LanguageModel = provider.chat('LongCat-2.0');
