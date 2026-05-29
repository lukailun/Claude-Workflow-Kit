import OpenAI from 'openai';
import type { AIProvider } from '@/ai/types';
import type { AIRequestParams } from '@/ai/types';
import type { AIResponse } from '@/ai/types';
import { deepSeekProviderInfo } from '@/deepseek/deepseek-provider-info';
import { deepSeekFromEnv } from '@/env';

class DeepSeekProvider implements AIProvider {
  info = deepSeekProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new OpenAI({
      baseURL: deepSeekFromEnv.baseUrl,
      apiKey: deepSeekFromEnv.apiKey,
    });
    const response = await client.chat.completions.create({
      model: this.info.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      stream: false,
    });

    const text = response.choices[0]?.message?.content?.trim() || '';
    return {
      text,
      tokenUsage: response.usage
        ? {
            input: response.usage.prompt_tokens,
            output: response.usage.completion_tokens,
            cacheRead: response.usage.prompt_tokens_details?.cached_tokens ?? 0,
            cacheWrite: 0,
          }
        : undefined,
    };
  }
}

export const deepSeekProvider = new DeepSeekProvider();
