import type { TokenUsage } from '../ai/types/token-usage';

export default interface MergeRequestContent {
  title: string;
  description: string;
  tokenUsage?: TokenUsage;
}
