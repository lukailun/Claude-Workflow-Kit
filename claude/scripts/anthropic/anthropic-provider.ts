import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from '@/ai/types';
import type { AIRequestParams } from '@/ai/types';
import type { AIResponse } from '@/ai/types';
import { anthropicProviderInfo } from '@/anthropic/anthropic-provider-info';
import { anthropicFromEnv } from '@/env';

class AnthropicProvider implements AIProvider {
  info = anthropicProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new Anthropic({
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
    const response = await client.messages.create({
      model: this.info.model,
      max_tokens: params.maxTokens,
      messages: params.messages,
      stream: false,
    });

    const text =
      response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : '';
    return {
      text,
      tokenUsage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cacheRead: response.usage.cache_read_input_tokens ?? 0,
        cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
      },
    };
  }
}

export const anthropicProvider = new AnthropicProvider();
