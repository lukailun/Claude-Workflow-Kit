import { createAnthropic } from '@ai-sdk/anthropic';
import { getLongCatFromEnv } from '@cwkit/shared/env/get-longcat-from-env';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';

const env = getLongCatFromEnv();
const provider = createAnthropic({
  name: 'LongCat',
  baseURL: `${env.baseUrl}/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
  headers: { Authorization: `Bearer ${env.apiKey}` },
});

export const longCatLanguageModel: LanguageModel = provider.chat('LongCat-2.0');
