import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getHyFromEnv } from '@lukailun/dev-kit/env/get-hy-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getHyFromEnv();
const provider = createOpenAI({
  name: '腾讯混元',
  baseURL: `${env.baseUrl}/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const hyLanguageModel: LanguageModel = provider.chat('hy3');
