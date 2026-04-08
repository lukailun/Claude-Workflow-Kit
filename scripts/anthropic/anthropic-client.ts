import Anthropic from '@anthropic-ai/sdk';
import anthropicFromEnv from '../env/anthropic-from-env';

const anthropicClient = new Anthropic({
  baseURL: anthropicFromEnv.baseUrl,
  apiKey:
    (anthropicFromEnv.apiKey ?? '').length > 0
      ? anthropicFromEnv.apiKey
      : undefined,
  authToken:
    (anthropicFromEnv.authToken ?? '').length > 0
      ? anthropicFromEnv.authToken
      : undefined,
});

export default anthropicClient;
