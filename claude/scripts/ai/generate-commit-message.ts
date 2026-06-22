/**
 * 使用 AI 生成 commit message
 */

import { generateText } from 'ai';
import type { ModelConfig } from '@/ai/models';
import { getCommitMessagePrompt } from '@/ai/prompts/commit-message-prompts';
import type { TokenUsage } from '@/ai/types/token-usage';

interface GenerateCommitMessageParams {
  model: ModelConfig;
  diffStat: string;
  diffContent: string;
  branchName: string;
}

export interface CommitMessageResult {
  message: string;
  tokenUsage?: TokenUsage;
}

async function generateCommitMessage(
  params: GenerateCommitMessageParams
): Promise<CommitMessageResult> {
  const prompt = getCommitMessagePrompt({
    diffStat: params.diffStat,
    diffContent: params.diffContent,
    branchName: params.branchName,
  });

  const result = await generateText({
    model: params.model.languageModel,
    messages: [{ role: 'user', content: prompt }],
    maxOutputTokens: 2048,
  });

  return {
    message: result.text?.trim() ?? '',
    tokenUsage: result.usage
      ? {
          input: result.usage.inputTokens ?? 0,
          output: result.usage.outputTokens ?? 0,
          cacheRead: result.usage.inputTokenDetails?.cacheReadTokens ?? 0,
          cacheWrite: result.usage.inputTokenDetails?.cacheWriteTokens ?? 0,
        }
      : undefined,
  };
}

export { generateCommitMessage };
