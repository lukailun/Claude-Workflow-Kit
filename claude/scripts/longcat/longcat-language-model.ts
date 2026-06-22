import { getLongCatFromEnv } from '@/env/get-longcat-from-env';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

const env = getLongCatFromEnv();
const provider = createOpenAI({
    name: 'LongCat',
    baseURL: `${env.baseUrl}/openai`,
    apiKey: env.apiKey,
});

const longCatLanguageModel: LanguageModel = provider('LongCat-2.0-Preview')

export { longCatLanguageModel };