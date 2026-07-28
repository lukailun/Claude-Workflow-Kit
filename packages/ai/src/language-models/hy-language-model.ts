import { createOpenAI } from '@ai-sdk/openai';
import { getHyFromEnv } from '@cwkit/shared/env/get-hy-from-env';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';

const env = getHyFromEnv();
const provider = createOpenAI({
  name: '腾讯混元',
  baseURL: `${env.baseUrl}/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const hyLanguageModel: LanguageModel = provider.chat('hy3');
