import OpenAI from 'openai';
import type { AIProvider, AIProviderInfo, AIRequestParams, AIResponse } from '@/ai/types';

/**
 * OpenAI 兼容 API 的通用 Provider 基类
 *
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly info: AIProviderInfo;
  private client: OpenAI;

    constructor(options: {
        info: AIProviderInfo;
        baseUrl: string;
        apiKey: string;
      }) {
    this.info = options.info;
    this.client = new OpenAI({ baseURL: options.baseUrl, apiKey: options.apiKey });
  }

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.info.model,
      messages: params.messages,
      max_completion_tokens: params.maxTokens,
      stream: false,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
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
