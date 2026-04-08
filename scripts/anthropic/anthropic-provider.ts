import anthropicClient from './anthropic-client';
import {
  AIProvider,
  AIRequestParams,
  AIResponse,
} from '../ai/types/ai-provider';

class AnthropicProvider implements AIProvider {
  async generate(params: AIRequestParams): Promise<AIResponse> {
    const response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: params.maxTokens,
      messages: params.messages,
    });

    const text =
      response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : '';
    return { text };
  }
}

export default new AnthropicProvider();
