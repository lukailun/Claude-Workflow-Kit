/**
 * 生成分支 Claude Code token 用量和费用的收据
 *
 * 用法：
 *   bun run branch-receipt.ts                # 当前分支
 *   bun run branch-receipt.ts release/2.57.0 # 指定分支
 */

import { dirname, join } from 'path';
import getCurrentBranch from '../git/get-current-branch';
import getUserName from '../git/get-user-name';
import getVersion from '../claude-code/get-version';
import getBranchUsage from '../claude-code/get-branch-usage';
import {
  getModelPricing,
  getPricingPlan,
  calculateModelCost,
  getAllTierThresholds,
  getCurrency,
} from '../claude-code/model-pricing';
import type Currency from '../ai/types/currency';
import { currencySymbol } from '../ai/types/currency';

const projectRoot = join(dirname(dirname(dirname(import.meta.dir))));

const W = 32;

function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

function center(text: string): string {
  const pad = Math.max(0, Math.floor((W - text.length) / 2));
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
  const gap = Math.max(2, W - lbl.length - valStr.length);
  return lbl + ' '.repeat(gap) + valStr;
}

export async function buildBranchReceiptWorkflow(
  branch?: string
): Promise<string | undefined> {
  branch = branch || (await getCurrentBranch());
  const tierThresholds = getAllTierThresholds();
  const { stats, timestamps, sessionId } = await getBranchUsage(
    branch,
    tierThresholds.length > 0 ? tierThresholds : undefined,
    projectRoot
  );

  const receiptNo = sessionId ? sessionId.slice(0, 8) : '';

  if (stats.size === 0) {
    console.log(`⚠️  分支 ${branch} 没有找到 Claude Code 使用记录`);
    return undefined;
  }

  const models: {
    name: string;
    displayName: string;
    count: number;
    input: number;
    output: number;
    cacheRead: number;
    cost: number;
    symbol: string;
  }[] = [];
  const costByCurrency = new Map<Currency, number>();

  for (const [model, s] of [...stats.entries()].sort(
    (a, b) => b[1].usage.input - a[1].usage.input
  )) {
    const { usage } = s;
    const price = getPricingPlan(model);
    const cost = price ? calculateModelCost(s, price) : 0;
    const symbol = price ? currencySymbol[getCurrency(price)] : '';

    if (price) {
      const currency = getCurrency(price);
      const prev = costByCurrency.get(currency) ?? 0;
      costByCurrency.set(currency, Math.round((prev + cost) * 100) / 100);
    }

    models.push({
      name: model,
      displayName: getModelPricing(model)?.name ?? model,
      count: s.count,
      input: usage.input,
      output: usage.output,
      cacheRead: usage.cacheRead,
      cost,
      symbol,
    });
  }

  const totalCost = [...costByCurrency.entries()]
    .map(([currency, cost]) => currencySymbol[currency] + cost.toFixed(2))
    .join(' + ');

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
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    started = fmt(first);
    ended = fmt(last);
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
    lines.push(center(kv('RECEIPT NO.', receiptNo)));
  }
  lines.push(center(kv('BRANCH', branch)));
  lines.push(center(kv('AGENT', claudeCodeVersion)));
  lines.push(center(kv('USER', userName)));
  if (started) {
    lines.push(center(kv('STARTED', started)));
    lines.push(center(kv('ENDED', ended)));
    lines.push(center(kv('DURATION', duration)));
  }
  lines.push(center(''));
  lines.push(center(sep()));

  for (const model of models) {
    lines.push(
      center(kv(model.displayName, model.symbol + model.cost.toFixed(2)))
    );
    lines.push(center(dashedSep()));
    lines.push(center(kv('INPUT', formatNum(model.input), 2)));
    lines.push(center(kv('OUTPUT', formatNum(model.output), 2)));
    lines.push(center(kv('CACHE READ', formatNum(model.cacheRead), 2)));
    lines.push(center(kv('CALLS', formatNum(model.count), 2)));
    lines.push(center(sep()));
  }

  lines.push(center(kv('TOTAL', totalCost)));
  lines.push(center(sep()));
  lines.push(center(''));
  lines.push(center('THANK YOU'));
  lines.push(center('CUSTOMER COPY'));
  lines.push(center(''));

  return lines.join('\n');
}

if (import.meta.main) {
  const branch = process.argv[2];
  try {
    const receipt = await buildBranchReceiptWorkflow(branch);
    console.log(receipt);
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
