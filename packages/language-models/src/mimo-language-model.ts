import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getMimoFromEnv } from '@lukailun/dev-kit/env/get-mimo-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getMimoFromEnv();
const provider = createAnthropic({
  name: 'Xiaomi Mimo',
  baseURL: `${env.baseUrl}/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const mimoLanguageModel: LanguageModel = provider.chat('mimo-v2.5');
