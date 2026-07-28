import type { TokenUsage } from '@lukailun/dev-kit/ai/types/token-usage';

export interface PullRequestContent {
  title: string;
  description: string;
  tokenUsage?: TokenUsage;
}
