import OpenAI from 'openai';
import type { AIProvider } from '@/ai/types';
import type { AIRequestParams } from '@/ai/types';
import type { AIResponse } from '@/ai/types';
import { longCatFromEnv } from '@/env';
import { longCatProviderInfo } from '@/longcat/longcat-provider-info';

class LongCatProvider implements AIProvider {
  info = longCatProviderInfo;

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const client = new OpenAI({
      baseURL: `${longCatFromEnv.baseUrl}/openai`,
      apiKey: longCatFromEnv.apiKey,
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

export const longCatProvider = new LongCatProvider();
