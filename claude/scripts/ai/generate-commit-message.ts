/**
 * 使用 AI 生成 commit message
 */

import { getCommitMessagePrompt } from '@/ai/prompts/commit-message-prompts';
import type { AIProvider } from '@/ai/types';
import type { TokenUsage } from '@/ai/types/token-usage';

interface GenerateCommitMessageParams {
  aiProvider: AIProvider;
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

  const response = await params.aiProvider.generate({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 2048,
  });

  return {
    message: response.text?.trim() || '',
    tokenUsage: response.tokenUsage,
  };
}

export { generateCommitMessage };
