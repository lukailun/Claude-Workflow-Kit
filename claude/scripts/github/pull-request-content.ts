import type { TokenUsage } from '@/ai/types/token-usage';
import { LanguageModelUsage } from 'ai';

export type PullRequestType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'perf';

export interface PullRequestDescription {
  overview: string;
  changes: string[];
  impact: {
    files: string[];
    features: string[];
  };
  tests: string[];
}

export interface PullRequestContent {
  type: PullRequestType;
  title: string;
  description: PullRequestDescription;
  usage?: LanguageModelUsage;
}
