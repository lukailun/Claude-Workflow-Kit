import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIProviderInfo, AIRequestParams, AIResponse } from '@/ai/types';

/**
 * Anthropic 兼容 API 的通用 Provider 基类
 *
 */
export class AnthropicCompatibleProvider implements AIProvider {
  readonly info: AIProviderInfo;
  private client: Anthropic;
  private systemPrompt: string | undefined

  constructor(options: {
    info: AIProviderInfo;
    baseUrl: string;
    apiKey?: string;
    authToken?: string;
    systemPrompt?: string
  }) {
    this.info = options.info;
    this.client = new Anthropic({
      baseURL: options.baseUrl,
      apiKey:  (options.apiKey ?? '').length > 0 ? options.apiKey : undefined,
      authToken: (options.authToken ?? '').length > 0 ? options.authToken : undefined,
    });
    this.systemPrompt = this.systemPrompt;
  }

  async generate(params: AIRequestParams): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: this.info.model,
      system: this.systemPrompt,
      max_tokens: params.maxTokens,
      messages: params.messages,
      stream: false,
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '';

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
