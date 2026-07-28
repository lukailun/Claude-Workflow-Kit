import { createAnthropic } from '@ai-sdk/anthropic';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';
import { getMimoFromEnv } from '../env/get-mimo-from-env';

const env = getMimoFromEnv();
const provider = createAnthropic({
  name: 'Xiaomi Mimo',
  baseURL: `${env.baseUrl}/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const mimoLanguageModel: LanguageModel = provider.chat('mimo-v2.5');
