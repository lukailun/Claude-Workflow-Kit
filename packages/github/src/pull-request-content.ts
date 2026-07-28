import type { TokenUsage } from '@cwkit/shared/types/token-usage';

export interface PullRequestContent {
  title: string;
  description: string;
  tokenUsage?: TokenUsage;
}
