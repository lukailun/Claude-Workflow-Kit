import type { TokenUsage } from '@/ai/types/token-usage';

export interface PullRequestContent {
  title: string;
  description: string;
  tokenUsage?: TokenUsage;
}
