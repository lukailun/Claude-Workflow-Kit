import { createAnthropic } from '@ai-sdk/anthropic';
import type { LanguageModel } from 'ai';
import { getMiniMaxFromEnv } from '@lukailun/dev-kit/env/get-minimax-from-env';
import { debugFetch } from '@lukailun/dev-kit/utils/debug-fetch';

const env = getMiniMaxFromEnv();
const provider = createAnthropic({
  name: 'MiniMax',
  baseURL: `${env.baseUrl}/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const miniMaxLanguageModel: LanguageModel = provider.chat('MiniMax-M3');
