/**
 * 生成分支 Claude Code token 用量和费用的收据
 *
 * 用法：
 *   bun run branch-receipt.ts                # 当前分支
 *   bun run branch-receipt.ts release/2.57.0 # 指定分支
 */

import { dirname, join } from 'path';
import { getClaudeCodeBranchUsage } from '@cwkit/usage/claudecode/get-claude-code-branch-usage';
import { getClaudeCodeVersion } from '@cwkit/usage/claudecode/get-claude-code-version';
import { getCodexBranchUsage } from '@cwkit/usage/codex/get-codex-branch-usage';
import { getCodexVersion } from '@cwkit/usage/codex/get-codex-version';
import { getRate } from '@cwkit/shared/exchange-rate/get-exchange-rate';
import { getCurrentBranch } from '@cwkit/shared/git/get-current-branch';
import { getUserName } from '@cwkit/shared/git/get-user-name';
import { getLatestModels } from '@cwkit/openrouter/get-latest-models';
import {
  getModelPricing,
  calculateModelCost,
  type ModelPricing,
} from '@cwkit/openrouter/get-model-pricing';
import { getPopularModels } from '@cwkit/openrouter/get-popular-models';
import { BANNERS } from './build-branch-receipt-banners';

const projectRoot = join(dirname(dirname(dirname(import.meta.dirname))));

const W = 70;

/** 计算字符串的终端显示宽度（CJK 字符占 2 列） */
function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    // CJK 统一汉字 + 全角符号 + 韩文 + 日文假名等
    w +=
      code >= 0x1100 &&
      (code <= 0x115f ||
        code === 0x2329 ||
        code === 0x232a ||
        (code >= 0x2e80 && code <= 0x3247 && code !== 0x303f) ||
        (code >= 0x3250 && code <= 0x4dbf) ||
        (code >= 0x4e00 && code <= 0xa4cf) ||
        (code >= 0xa960 && code <= 0xa97c) ||
        (code >= 0xac00 && code <= 0xd7a3) ||
        (code >= 0xf900 && code <= 0xfaff) ||
        (code >= 0xfe10 && code <= 0xfe6b) ||
        (code >= 0xff01 && code <= 0xff60) ||
        (code >= 0xffe0 && code <= 0xffe6) ||
        (code >= 0x1b000 && code <= 0x1b001) ||
        (code >= 0x1f200 && code <= 0x1f251) ||
        (code >= 0x20000 && code <= 0x3fffd))
        ? 2
        : 1;
  }
  return w;
}

function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

function center(text: string): string {
  const pad = Math.max(0, Math.floor((W - displayWidth(text)) / 2));
  return ' '.repeat(pad) + text;
}

function sep(): string {
  return '─'.repeat(W);
}

function dashedSep(): string {
  return '┄'.repeat(W);
}

function kv(label: string, value: string, indent = 0): string {
  const pad = ' '.repeat(indent);
  const lbl = pad + label;
  const valStr = String(value);
  const gap = Math.max(2, W - displayWidth(lbl) - displayWidth(valStr));
  return lbl + ' '.repeat(gap) + valStr;
}

export async function buildBranchReceiptWorkflow(
  branch?: string,
  bannerIndex?: number
): Promise<string | undefined> {
  branch = branch ?? (await getCurrentBranch());
  const [branchUsage, codexUsage] = await Promise.all([
    getClaudeCodeBranchUsage(branch, projectRoot),
    getCodexBranchUsage(branch, projectRoot),
  ]);

  if (
    (!branchUsage || branchUsage.stats.size === 0) &&
    (!codexUsage || codexUsage.stats.size === 0)
  ) {
    console.log(`⚠️  分支 ${branch} 没有找到 Claude Code 或 Codex 使用记录`);
    return undefined;
  }

  // Merge Codex stats into Claude Code stats (additive for same model keys)
  const mergedStats = new Map(branchUsage?.stats ?? []);
  if (codexUsage) {
    for (const [key, val] of codexUsage.stats) {
      const existing = mergedStats.get(key);
      if (!existing) {
        mergedStats.set(key, val);
      } else {
        existing.count += val.count;
        existing.usage.inputTokens =
          (existing.usage.inputTokens ?? 0) + (val.usage.inputTokens ?? 0);
        existing.usage.outputTokens =
          (existing.usage.outputTokens ?? 0) + (val.usage.outputTokens ?? 0);
        existing.usage.totalTokens =
          (existing.usage.totalTokens ?? 0) + (val.usage.totalTokens ?? 0);
        existing.usage.inputTokenDetails.noCacheTokens =
          (existing.usage.inputTokenDetails.noCacheTokens ?? 0) +
          (val.usage.inputTokenDetails.noCacheTokens ?? 0);
        existing.usage.inputTokenDetails.cacheReadTokens =
          (existing.usage.inputTokenDetails.cacheReadTokens ?? 0) +
          (val.usage.inputTokenDetails.cacheReadTokens ?? 0);
        existing.usage.inputTokenDetails.cacheWriteTokens =
          (existing.usage.inputTokenDetails.cacheWriteTokens ?? 0) +
          (val.usage.inputTokenDetails.cacheWriteTokens ?? 0);
        existing.usage.outputTokenDetails.reasoningTokens =
          (existing.usage.outputTokenDetails.reasoningTokens ?? 0) +
          (val.usage.outputTokenDetails.reasoningTokens ?? 0);
      }
    }
  }

  const mergedTimestamps = [
    ...(branchUsage?.timestamps ?? []),
    ...(codexUsage?.timestamps ?? []),
  ];

  const { stats, timestamps, sessionId } = {
    stats: mergedStats,
    timestamps: mergedTimestamps,
    sessionId: branchUsage?.sessionId ?? codexUsage?.sessionId ?? '',
  };
  const receiptNo = sessionId ? sessionId.slice(0, 8) : '';

  const [rate, popularModels, latestModels] = await Promise.all([
    getRate(),
    getPopularModels(5),
    getLatestModels(5),
  ]);

  const sortedStats = [...stats.entries()].sort(
    (a, b) => (b[1].usage.inputTokens ?? 0) - (a[1].usage.inputTokens ?? 0)
  );
  const pricingResults = await Promise.all(
    sortedStats.map(([model]) => getModelPricing(model))
  );

  const models: {
    name: string;
    count: number;
    input: number;
    output: number;
    cacheRead: number;
    cost: number;
    pricing?: ModelPricing;
  }[] = [];
  let totalCost = 0;

  for (let i = 0; i < sortedStats.length; i++) {
    const [model, usageStats] = sortedStats[i];
    const pricing = pricingResults[i];
    const { usage } = usageStats;
    const cost = calculateModelCost(usageStats, pricing);
    totalCost += cost;

    models.push({
      name: model,
      count: usageStats.count,
      input: usage.inputTokens ?? 0,
      output: usage.outputTokens ?? 0,
      cacheRead: usage.inputTokenDetails.cacheReadTokens ?? 0,
      cost,
      pricing,
    });
  }

  let started = '';
  let ended = '';
  let duration = '';
  if (timestamps.length > 0) {
    timestamps.sort((a, b) => a.getTime() - b.getTime());
    const first = timestamps[0];
    const last = timestamps[timestamps.length - 1];
    const durationMs = last.getTime() - first.getTime();
    const durationH = Math.floor(durationMs / 3600000);
    const durationM = Math.floor((durationMs % 3600000) / 60000);
    const durationS = Math.floor((durationMs % 60000) / 1000);
    if (durationH > 0) {
      duration = `${durationH}h ${durationM}m ${durationS}s`;
    } else if (durationM > 0) {
      duration = `${durationM}m ${durationS}s`;
    } else {
      duration = `${durationS}s`;
    }
    const format = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    started = format(first);
    ended = format(last);
  }

  const userName = getUserName(projectRoot);
  const claudeCodeVersion = getClaudeCodeVersion();
  const hasCodex = !!codexUsage && codexUsage.stats.size > 0;
  const codexVersion = hasCodex ? getCodexVersion() : null;
  const lines: string[] = [];

  // banner
  const idx =
    bannerIndex !== undefined &&
    bannerIndex >= 0 &&
    bannerIndex < BANNERS.length
      ? bannerIndex
      : Math.floor(Math.random() * BANNERS.length);
  const banner = BANNERS[idx];
  for (const line of banner) {
    lines.push(center(line));
  }
  if (receiptNo) {
    lines.push(center(kv('收据编号', receiptNo)));
  }
  lines.push(center(kv('分支', branch)));
  lines.push(center(kv('智能体', claudeCodeVersion)));
  if (codexVersion) {
    lines.push(center(kv('', codexVersion)));
  }
  lines.push(center(kv('用户', userName)));
  if (started) {
    lines.push(center(kv('开始时间', started)));
    lines.push(center(kv('结束时间', ended)));
    lines.push(center(kv('耗时', duration)));
  }
  lines.push(center(''));
  lines.push(center(sep()));

  const formatCost = (usd: number) => {
    const cost = '$' + usd.toFixed(2);
    if (rate) return cost + '/¥' + (usd * rate).toFixed(2);
    return cost;
  };

  for (const model of models) {
    lines.push(
      center(kv(model.pricing?.name ?? model.name, formatCost(model.cost)))
    );
    lines.push(center(dashedSep()));
    const pricing = model.pricing;
    lines.push(
      center(
        kv(
          pricing
            ? `输入($${pricing.inputCacheMiss.toFixed(2)} / MTok)`
            : '输入',
          formatNum(model.input),
          2
        )
      )
    );
    lines.push(
      center(
        kv(
          pricing ? `输出($${pricing.output.toFixed(2)} / MTok)` : '输出',
          formatNum(model.output),
          2
        )
      )
    );
    lines.push(
      center(
        kv(
          pricing
            ? `缓存读取($${pricing.inputCacheHit.toFixed(2)} / MTok)`
            : '缓存读取',
          formatNum(model.cacheRead),
          2
        )
      )
    );
    lines.push(center(kv('调用次数', formatNum(model.count), 2)));
    const totalInput = model.input + model.cacheRead;
    const cacheHit = totalInput > 0 ? (model.cacheRead / totalInput) * 100 : 0;
    lines.push(center(kv('缓存命中率', cacheHit.toFixed(2) + '%', 2)));
    lines.push(center(sep()));
  }

  lines.push(center(kv('合计', formatCost(totalCost))));
  lines.push(center(sep()));
  lines.push(center(''));

  if (popularModels.length > 0 || latestModels.length > 0) {
    lines.push(center('模型速览'));
    lines.push(center(sep()));
  }

  if (popularModels.length > 0) {
    lines.push(center(`昨日热门 TOP ${popularModels.length}`));
    lines.push(center(dashedSep()));
    for (const model of popularModels) {
      lines.push(center(kv(formatNum(model.totalTokens), model.name)));
    }
    lines.push(center(''));
  }

  if (latestModels.length > 0) {
    lines.push(center(`最新上线 TOP ${latestModels.length}`));
    lines.push(center(dashedSep()));
    for (const model of latestModels) {
      const date = new Date(model.created * 1000).toISOString().split('T')[0];
      lines.push(center(kv(date, model.name)));
    }
    lines.push(center(''));
  }

  return lines.join('\n');
}

if (import.meta.main) {
  // yarn receipt [branch|bannerIndex] [bannerIndex]
  // 纯数字参数识别为 banner index，字符串识别为分支名
  let branch: string | undefined;
  let bannerIndex: number | undefined;

  for (const arg of process.argv.slice(2)) {
    if (/^\d+$/.test(arg)) {
      bannerIndex = parseInt(arg, 10);
    } else {
      branch = arg;
    }
  }

  try {
    const receipt = await buildBranchReceiptWorkflow(branch, bannerIndex);
    if (receipt) {
      console.log(receipt);
    }
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
