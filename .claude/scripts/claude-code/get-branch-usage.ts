/**
 * 从 Claude Code 转录文件中获取某个分支的 token 用量数据
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type {
  TokenUsageStats,
  ModelTokenUsageStats,
} from '../ai/types/token-usage';

export interface BranchUsageResult {
  stats: Map<string, ModelTokenUsageStats>;
  timestamps: Date[];
  sessionId?: string;
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

function emptyUsage(): TokenUsageStats {
  return {
    usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    count: 0,
  };
}

/**
 * 获取指定分支上各模型的 token 用量统计
 * @param tierThresholds 阶梯阈值（如 [256_000, 1_000_000]），不传则不分阶梯
 */
export default async function getBranchUsage(
  branch: string,
  tierThresholds?: number[],
  projectRoot?: string
): Promise<BranchUsageResult> {
  const projectDir = getProjectDir(projectRoot);
  const files = (await readdir(projectDir)).filter((file) =>
    file.endsWith('.jsonl')
  );
  const thresholds = tierThresholds?.sort((a, b) => a - b) ?? [];

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
        const model = entry.message.model || 'unknown';
        const inp = usage.input_tokens ?? 0;
        const out = usage.output_tokens ?? 0;
        if (inp === 0 && out === 0) continue;

        if (!sessionId && entry.sessionId) {
          sessionId = entry.sessionId;
        }

        if (entry.timestamp) {
          timestamps.push(new Date(entry.timestamp));
        }

        if (!statsMap.has(model)) {
          statsMap.set(model, {
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            count: 0,
            tiers: new Map(),
          });
        }
        const stats = statsMap.get(model)!;
        const cacheRead = usage.cache_read_input_tokens ?? 0;
        const cacheWrite = usage.cache_creation_input_tokens ?? 0;
        stats.usage.input += inp;
        stats.usage.output += out;
        stats.usage.cacheRead += cacheRead;
        stats.usage.cacheWrite += cacheWrite;
        stats.count += 1;

        // 按阶梯分桶
        if (thresholds.length > 0) {
          const tierKey = thresholds.find((t) => inp <= t) ?? Infinity;
          if (!stats.tiers.has(tierKey)) stats.tiers.set(tierKey, emptyUsage());
          const tier = stats.tiers.get(tierKey)!;
          tier.usage.input += inp;
          tier.usage.output += out;
          tier.usage.cacheRead += cacheRead;
          tier.usage.cacheWrite += cacheWrite;
          tier.count += 1;
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  return { stats: statsMap, timestamps, sessionId };
}
