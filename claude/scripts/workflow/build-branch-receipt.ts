/**
 * 生成分支 Claude Code token 用量和费用的收据
 *
 * 用法：
 *   bun run branch-receipt.ts                # 当前分支
 *   bun run branch-receipt.ts release/2.57.0 # 指定分支
 */

import { dirname, join } from 'path';
import { getBranchUsage } from '@/claudecode/get-branch-usage';
import { getVersion } from '@/claudecode/get-version';
import { getRate } from '@/exchange-rate/get-exchange-rate';
import { getCurrentBranch } from '@/git/get-current-branch';
import { getUserName } from '@/git/get-user-name';
import { getLatestModels } from '@/openrouter/get-latest-models';
import { getModelPricing, calculateModelCost } from '@/openrouter/get-model-pricing';
import { getPopularModels } from '@/openrouter/get-popular-models';

const projectRoot = join(dirname(dirname(import.meta.dir)));

const W = 45;

/** 计算字符串的终端显示宽度（CJK 字符占 2 列） */
function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    // CJK 统一汉字 + 全角符号 + 韩文 + 日文假名等
    w += (code >= 0x1100 &&
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
        (code >= 0x20000 && code <= 0x3fffd)))
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
  branch?: string
): Promise<string | undefined> {
  branch = branch ?? (await getCurrentBranch());
  const branchUsage = await getBranchUsage(
    branch,
    projectRoot
  )
  if (!branchUsage || branchUsage.stats.size === 0) {
    console.log(`⚠️  分支 ${branch} 没有找到 Claude Code 使用记录`);
    return undefined;
  }
  const { stats, timestamps, sessionId } = branchUsage;
  const receiptNo = sessionId ? sessionId.slice(0, 8) : '';

  const [rate, popularModels, latestModels] = await Promise.all([
    getRate(),
    getPopularModels(5),
    getLatestModels(5),
  ]);

  const sortedStats = [...stats.entries()].sort(
    (a, b) => b[1].usage.input - a[1].usage.input
  );
  const pricingResults = await Promise.all(
    sortedStats.map(([model]) => getModelPricing(model))
  );

  const models: {
    name: string;
    displayName: string;
    count: number;
    input: number;
    output: number;
    cacheRead: number;
    cost: number;
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
      displayName: pricing.name,
      count: usageStats.count,
      input: usage.input,
      output: usage.output,
      cacheRead: usage.cacheRead,
      cost,
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
  const claudeCodeVersion = getVersion();
  const lines: string[] = [];

  // banner
  lines.push(center(''));
  lines.push(center('▐▛███▜▌'));
  lines.push(center('▝▜█████▛▘'));
  lines.push(center('▘▘ ▝▝'));
  lines.push(center('CLAUDE CODE'));
  lines.push(center(''));
  lines.push(center(''));
  if (receiptNo) {
    lines.push(center(kv('收据编号', receiptNo)));
  }
  lines.push(center(kv('分支', branch)));
  lines.push(center(kv('智能体', claudeCodeVersion)));
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
    lines.push(center(kv(model.displayName, formatCost(model.cost))));
    lines.push(center(dashedSep()));
    lines.push(center(kv('输入', formatNum(model.input), 2)));
    lines.push(center(kv('输出', formatNum(model.output), 2)));
    lines.push(center(kv('缓存读取', formatNum(model.cacheRead), 2)));
    lines.push(center(kv('调用次数', formatNum(model.count), 2)));
    const totalInput = model.input + model.cacheRead;
    const cacheHit = totalInput > 0 ? (model.cacheRead / totalInput * 100) : 0;
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
    lines.push(center(''));
    for (const model of popularModels) {
      lines.push(center(kv(formatNum(model.totalTokens), model.name)));
    }
    lines.push(center(''));
  }

  if (latestModels.length > 0) {
    lines.push(center(`最新上线 TOP ${latestModels.length}`));
    lines.push(center(''));
    for (const model of latestModels) {
      const date = new Date(model.created * 1000).toISOString().split('T')[0];
      lines.push(center(kv(date, model.name)));
    }
    lines.push(center(''));
  }

  return lines.join('\n');
}

if (import.meta.main) {
  const branch = process.argv[2];
  try {
    const receipt = await buildBranchReceiptWorkflow(branch);
    if(receipt) {
      console.log(receipt);
    }
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
