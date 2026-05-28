import type { TokenUsage } from '@/ai/types/token-usage';

export default interface PullRequestContent {
  title: string;
  description: string;
  tokenUsage?: TokenUsage;
}
