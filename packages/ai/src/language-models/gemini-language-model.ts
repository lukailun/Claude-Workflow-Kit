import { createGoogle } from '@ai-sdk/google';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';
import { getGeminiFromEnv } from '../env/get-gemini-from-env';

const env = getGeminiFromEnv();
const provider = createGoogle({
  name: 'Gemini',
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const geminiLanguageModel: LanguageModel =
  provider.chat('gemini-3.5-flash');
