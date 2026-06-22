/**
 * 使用 AI 生成 commit message
 */

import { LanguageModelUsage, Output } from 'ai';
import { generateText, LanguageModel } from 'ai';
import { getCommitMessagePrompt } from '@/ai/prompts/get-commit-message-prompt';
import type { TokenUsage } from '@/ai/types/token-usage';
import z from 'zod';

interface GenerateCommitMessageParams {
  model: LanguageModel;
  diffStat: string;
  diffContent: string;
  branchName: string;
}

export interface CommitMessageResult {
  message: string;
  tokenUsage?: TokenUsage;
}

export type CommitMessageType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'perf';

export interface CommitMessageResult {
  type: CommitMessageType;
  message: string;
  usage?: LanguageModelUsage;
}

export async function generateCommitMessage(
  params: GenerateCommitMessageParams
): Promise<CommitMessageResult> {
  const prompt = getCommitMessagePrompt({
    diffStat: params.diffStat,
    diffContent: params.diffContent,
    branchName: params.branchName,
  });

  const {output, totalUsage} = await generateText({
     model: params.model,
     prompt,
    maxOutputTokens: 2048,
        output: Output.object({
          schema: z.object({
            type: z.enum(['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf']),
            message: z.string(),
          })
        }),
  });

  return {
    ...output,
    usage: totalUsage,
  } satisfies CommitMessageResult;
}
