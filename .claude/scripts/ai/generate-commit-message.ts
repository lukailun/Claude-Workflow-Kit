/**
 * 使用 AI 生成 commit message
 */

import AIProvider from './types/ai-provider';
import type { TokenUsage } from './types/token-usage';
import { getCommitMessagePrompt } from './prompts/commit-message-prompts';

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

export default generateCommitMessage;
