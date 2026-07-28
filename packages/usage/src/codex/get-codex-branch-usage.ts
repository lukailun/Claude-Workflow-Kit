/**
 * 从 Codex SQLite 数据库中获取某个分支的 token 用量数据
 *
 * 数据来源：~/.codex/state_N.sqlite (threads 表，自动选最新 schema 版本)
 *   - git_branch: 精确匹配分支（与 Claude Code 同等精度）
 *   - model: 实际模型名（如 gpt-5.5）
 *   - rollout_path: 指向对应的 .jsonl 文件
 *
 * token 明细从 .jsonl 文件的 event_msg/token_count 中的
 * last_token_usage 累加获得（每轮实际消耗，非累计上下文）
 */

import { readFile, readdir } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import type { ModelTokenUsageStats } from '@cwkit/ai/types/token-usage';
import Database from 'better-sqlite3';
import type { BranchUsageResult } from '../claudecode/get-claude-code-branch-usage';

const CODEX_DIR = join(homedir(), '.codex');

/** 自动选取最新版本的 state_N.sqlite */
async function resolveDbPath(): Promise<string | null> {
  try {
    const files = await readdir(CODEX_DIR);
    const versions = files
      .map((f) => f.match(/^state_(\d+)\.sqlite$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => ({ file: m[0], version: parseInt(m[1], 10) }));
    if (versions.length === 0) return null;
    versions.sort((a, b) => b.version - a.version);
    return join(CODEX_DIR, versions[0].file);
  } catch {
    return null;
  }
}

interface ThreadRow {
  id: string;
  rollout_path: string;
  model: string | null;
}

interface TokenUsagePerTurn {
  input_tokens: number;
  cached_input_tokens?: number;
  output_tokens: number;
  reasoning_output_tokens?: number;
}

interface SessionDetail {
  model: string;
  turns: TokenUsagePerTurn[];
  timestamps: Date[];
}

/** 从 .jsonl 文件中读取每轮 last_token_usage 明细和模型名 */
async function parseSessionDetail(
  rolloutPath: string
): Promise<SessionDetail | null> {
  try {
    const content = await readFile(rolloutPath, 'utf-8');
    const lines = content.split('\n');

    let model = '';
    const turns: TokenUsagePerTurn[] = [];
    const timestamps: Date[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const entry = JSON.parse(trimmed);

        if (entry.timestamp) {
          const ts = new Date(entry.timestamp);
          if (!isNaN(ts.getTime())) timestamps.push(ts);
        }

        // 从 turn_context 中提取模型名（比 session_meta 更可靠）
        if (!model && entry.type === 'turn_context' && entry.payload?.model) {
          model = entry.payload.model;
        }

        // 每轮的实际消耗（last_token_usage）
        if (
          entry.type === 'event_msg' &&
          entry.payload?.type === 'token_count' &&
          entry.payload?.info?.last_token_usage
        ) {
          const last = entry.payload.info.last_token_usage;
          // 跳过重复的末尾条目（所有字段完全相同才视为重复）
          const prev = turns[turns.length - 1];
          if (
            !prev ||
            prev.input_tokens !== last.input_tokens ||
            prev.cached_input_tokens !== last.cached_input_tokens ||
            prev.output_tokens !== last.output_tokens ||
            (prev.reasoning_output_tokens ?? 0) !==
              (last.reasoning_output_tokens ?? 0)
          ) {
            turns.push({
              input_tokens: last.input_tokens ?? 0,
              cached_input_tokens: last.cached_input_tokens ?? 0,
              output_tokens: last.output_tokens ?? 0,
              reasoning_output_tokens: last.reasoning_output_tokens ?? 0,
            });
          }
        }
      } catch {}
    }

    return { model, turns, timestamps };
  } catch {
    return null;
  }
}

export async function getCodexBranchUsage(
  branch: string,
  projectRoot?: string
): Promise<BranchUsageResult | null> {
  const root = projectRoot ?? process.cwd();

  // WAL 模式下 bun:sqlite 的 readonly:true 无法写 -shm 文件，不传 readonly
  // 我们只执行 SELECT，不会修改数据
  // 未找到 Codex 数据库（~/.codex/state_*.sqlite），跳过 Codex 用量统计
  const dbPath = await resolveDbPath();
  if (!dbPath) return null;

  let threads: ThreadRow[];
  try {
    const db = new Database(dbPath);
    try {
      threads = db
        .prepare<[string, string]>('SELECT id, rollout_path, model FROM threads WHERE git_branch = ? AND cwd = ?')
        .all(branch, root) as ThreadRow[];
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn(
      `⚠️  Codex 数据库读取失败（${dbPath}）: ${err instanceof Error ? err.message : err}`
    );
    return null;
  }

  if (threads.length === 0) return null;

  const statsMap = new Map<string, ModelTokenUsageStats>();
  const allTimestamps: Date[] = [];
  let firstSessionId: string | undefined;

  for (const thread of threads) {
    const detail = await parseSessionDetail(thread.rollout_path);
    if (!detail || detail.turns.length === 0) continue;

    const modelKey = thread.model ?? (detail.model || 'codex');
    if (!firstSessionId) firstSessionId = thread.id;
    allTimestamps.push(...detail.timestamps);

    if (!statsMap.has(modelKey)) {
      statsMap.set(modelKey, {
        usage: {
          inputTokens: 0,
          inputTokenDetails: {
            noCacheTokens: 0,
            cacheReadTokens: 0,
            cacheWriteTokens: 0,
          },
          outputTokens: 0,
          outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
          totalTokens: 0,
        },
        count: 0,
      });
    }

    const stats = statsMap.get(modelKey)!;
    for (const turn of detail.turns) {
      // Codex: input_tokens = total prompt tokens (cached + non-cached)
      // cached_input_tokens = subset of input_tokens served from cache
      // Normalize to Claude Code convention: inputTokens = non-cached only
      const totalInput = turn.input_tokens;
      const cacheRead = turn.cached_input_tokens ?? 0;
      const noCacheInput = totalInput - cacheRead;
      const out = turn.output_tokens;
      const reasoning = turn.reasoning_output_tokens ?? 0;
      stats.usage.inputTokens = (stats.usage.inputTokens ?? 0) + noCacheInput;
      stats.usage.outputTokens = (stats.usage.outputTokens ?? 0) + out;
      stats.usage.inputTokenDetails.noCacheTokens =
        (stats.usage.inputTokenDetails.noCacheTokens ?? 0) + noCacheInput;
      stats.usage.inputTokenDetails.cacheReadTokens =
        (stats.usage.inputTokenDetails.cacheReadTokens ?? 0) + cacheRead;
      stats.usage.outputTokenDetails.reasoningTokens =
        (stats.usage.outputTokenDetails.reasoningTokens ?? 0) + reasoning;
    }
    stats.count += detail.turns.length;
  }

  if (!firstSessionId) return null;
  return {
    stats: statsMap,
    timestamps: allTimestamps,
    sessionId: firstSessionId,
  };
}
