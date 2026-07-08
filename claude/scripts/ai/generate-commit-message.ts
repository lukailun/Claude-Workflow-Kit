/**
 * 使用 AI 生成 commit message
 */

import { LanguageModelUsage, Output, LanguageModel } from 'ai';
import z from 'zod';
import { generateObject } from '@/ai/generate-object';
import { getCommitMessagePrompt } from '@/ai/prompts/get-commit-message-prompt';
import { CommitType, commitTypes } from '@/git/commit-type';
import { retry } from '@/utils/retry';

interface GenerateCommitMessageParams {
  model: LanguageModel;
  diffStat: string;
  diffContent: string;
  branchName: string;
}

export interface CommitMessageResult {
  type: CommitType;
  subject: string;
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

  try {
    const { output, usage } = await retry(
      async () => {
        return await generateObject({
          model: params.model,
          prompt,
          maxOutputTokens: 2048,
          output: Output.object({
            schema: z.object({
              type: z.enum(commitTypes),
              subject: z.string(),
            }),
          }),
        });
      },
      { behavior: { type: 'immediate', maxCount: 3 } }
    );
    return {
      ...output,
      usage,
    } satisfies CommitMessageResult;
  } catch (error) {
    throw error;
  }
}
