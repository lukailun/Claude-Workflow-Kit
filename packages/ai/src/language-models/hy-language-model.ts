import { createOpenAI } from '@ai-sdk/openai';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';
import { getHyFromEnv } from '../env/get-hy-from-env';

const env = getHyFromEnv();
const provider = createOpenAI({
  name: '腾讯混元',
  baseURL: `${env.baseUrl}/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const hyLanguageModel: LanguageModel = provider.chat('hy3');
