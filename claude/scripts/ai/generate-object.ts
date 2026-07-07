import { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import { GoogleLanguageModelOptions } from '@ai-sdk/google';
import { OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai';
import { generateText } from 'ai';

type GenerateTextParams = Parameters<typeof generateText>[0];
type GenerateObjectParams = GenerateTextParams & {
  output: NonNullable<GenerateTextParams['output']>;
  thinking?: boolean;
};

const THINKING_PROVIDER_OPTIONS = {
  openai: {
    reasoningEffort: 'high',
    reasoningSummary: 'detailed',
  } satisfies OpenAILanguageModelResponsesOptions,
  anthropic: {
    thinking: { type: 'enabled', budgetTokens: 16384 },
    effort: 'high',
  } satisfies AnthropicLanguageModelOptions,
  google: {
    thinkingConfig: {
      includeThoughts: true,
      thinkingLevel: 'high',
    },
  } satisfies GoogleLanguageModelOptions,
} satisfies GenerateTextParams['providerOptions'];

export async function generateObject(
  params: GenerateObjectParams
): ReturnType<typeof generateText> {
  const { thinking, ...rest } = params;

  return generateText({
    ...(thinking && { providerOptions: THINKING_PROVIDER_OPTIONS }),
    ...rest,
  });
}
