import { createAnthropic } from '@ai-sdk/anthropic';
import { getMiniMaxFromEnv } from '@cwkit/shared/env/get-minimax-from-env';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';

const env = getMiniMaxFromEnv();
const provider = createAnthropic({
  name: 'MiniMax',
  baseURL: `${env.baseUrl}/anthropic/v1`,
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const miniMaxLanguageModel: LanguageModel = provider.chat('MiniMax-M3');
