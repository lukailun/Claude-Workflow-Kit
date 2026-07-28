import { createAnthropic } from '@ai-sdk/anthropic';
import { debugFetch } from '@cwkit/shared/utils/debug-fetch';
import type { LanguageModel } from 'ai';
import { getClaudeFromEnv } from '../env/get-claude-from-env';

const env = getClaudeFromEnv();
const provider = createAnthropic({
  name: 'Anthropic',
  baseURL: env.baseUrl,
  apiKey: env.apiKey,
  authToken: env.authToken,
  fetch: debugFetch,
});

export const claudeLanguageModel: LanguageModel =
  provider.chat('claude-sonnet-4-6');
