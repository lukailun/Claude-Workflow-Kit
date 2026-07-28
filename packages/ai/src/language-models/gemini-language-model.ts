import { createGoogle } from '@ai-sdk/google';
import { getGeminiFromEnv } from '@cwkit/shared/env/get-gemini-from-env';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';

const env = getGeminiFromEnv();
const provider = createGoogle({
  name: 'Gemini',
  apiKey: env.apiKey,
  fetch: debugFetch,
});

export const geminiLanguageModel: LanguageModel =
  provider.chat('gemini-3.5-flash');
