/**
 * 从 Claude Code 转录文件中获取某个分支的 token 用量数据
 */

import { readdir, readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import type { ModelTokenUsageStats } from '@/ai/types/token-usage';

export interface BranchUsageResult {
  stats: Map<string, ModelTokenUsageStats>;
  timestamps: Date[];
  sessionId: string;
}

interface TranscriptEntry {
  type?: string;
  gitBranch?: string;
  timestamp?: string;
  sessionId?: string;
  message?: {
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };
}

function getProjectDir(projectRoot?: string): string {
  const root = projectRoot ?? process.cwd();
  const dirName = root.replace(/\//g, '-');
  return join(homedir(), '.claude', 'projects', dirName);
}

/**
 * 获取指定分支上各模型的 token 用量统计
 */
export async function getClaudeCodeBranchUsage(
  branch: string,
  projectRoot?: string
): Promise<BranchUsageResult | null> {
  const projectDir = getProjectDir(projectRoot);
  const files = (await readdir(projectDir)).filter((file) =>
    file.endsWith('.jsonl')
  );
  const statsMap = new Map<string, ModelTokenUsageStats>();
  const timestamps: Date[] = [];
  let sessionId: string | undefined;

  for (const file of files) {
    const content = await readFile(join(projectDir, file), 'utf-8');
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const entry: TranscriptEntry = JSON.parse(line);
        if (entry.gitBranch !== branch || entry.type !== 'assistant') continue;
        if (!entry.message?.usage) continue;

        const usage = entry.message.usage;
        const model = entry.message.model;
        const inp = usage.input_tokens ?? 0;
        const out = usage.output_tokens ?? 0;
        if (!model) continue;
        if (inp === 0 && out === 0) continue;
        if (!sessionId && entry.sessionId) {
          sessionId = entry.sessionId;
        }
        if (entry.timestamp) {
          timestamps.push(new Date(entry.timestamp));
        }
        if (!statsMap.has(model)) {
          statsMap.set(model, {
            usage: {
              inputTokens: 0,
              inputTokenDetails: {
                noCacheTokens: 0,
                cacheReadTokens: 0,
                cacheWriteTokens: 0,
              },
              outputTokens: 0,
              outputTokenDetails: {
                textTokens: 0,
                reasoningTokens: 0,
              },
              totalTokens: 0,
            },
            count: 0,
          });
        }
        const stats = statsMap.get(model);
        if (!stats) continue;
        const cacheRead = usage.cache_read_input_tokens ?? 0;
        const cacheWrite = usage.cache_creation_input_tokens ?? 0;
        stats.usage.inputTokens = (stats.usage.inputTokens ?? 0) + inp;
        stats.usage.outputTokens = (stats.usage.outputTokens ?? 0) + out;
        stats.usage.inputTokenDetails.cacheReadTokens =
          (stats.usage.inputTokenDetails.cacheReadTokens ?? 0) + cacheRead;
        stats.usage.inputTokenDetails.cacheWriteTokens =
          (stats.usage.inputTokenDetails.cacheWriteTokens ?? 0) + cacheWrite;
        stats.usage.inputTokenDetails.noCacheTokens =
          (stats.usage.inputTokenDetails.noCacheTokens ?? 0) + inp;
        stats.usage.outputTokenDetails.textTokens =
          (stats.usage.outputTokenDetails.textTokens ?? 0) + out;
        stats.usage.outputTokenDetails.reasoningTokens =
          stats.usage.outputTokenDetails.reasoningTokens;
        stats.count += 1;
      } catch {}
    }
  }

  if (!sessionId) return null;
  return { stats: statsMap, timestamps, sessionId };
}
