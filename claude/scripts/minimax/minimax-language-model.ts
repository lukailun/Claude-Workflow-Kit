import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { getMiniMaxFromEnv } from '@/env/get-minimax-from-env';

const env = getMiniMaxFromEnv();
const provider = createOpenAI({
    name: 'MiniMax',
    baseURL: `${env.baseUrl}/v1`,
    apiKey: env.apiKey,
});

const miniMaxLanguageModel: LanguageModel = provider.chat('MiniMax-M2.7')

export { miniMaxLanguageModel };