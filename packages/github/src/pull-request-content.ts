import type { TokenUsage } from '@cwkit/ai/types/token-usage';

export interface PullRequestContent {
  title: string;
  description: string;
  tokenUsage?: TokenUsage;
}
