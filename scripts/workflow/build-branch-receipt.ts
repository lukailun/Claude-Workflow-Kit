/**
 * 生成分支 Claude Code token 用量和费用的收据
 *
 * 用法：
 *   bun run branch-receipt.ts                # 当前分支
 *   bun run branch-receipt.ts release/2.57.0 # 指定分支
 */

import { dirname, join } from 'path';
import getCurrentBranch from '../gitlab/get-current-branch';
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
  const stats = await getBranchUsage(
    branch,
    tierThresholds.length > 0 ? tierThresholds : undefined,
    projectRoot
  );

  if (stats.size === 0) {
    console.log(`⚠️  分支 ${branch} 没有找到 Claude Code 使用记录`);
    return undefined;
  }

  // 收集数据
  const models: {
    name: string;
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
      costByCurrency.set(currency, (costByCurrency.get(currency) ?? 0) + cost);
    }

    models.push({
      name: getModelPricing(model)?.name ?? model,
      count: s.count,
      input: usage.input,
      output: usage.output,
      cacheRead: usage.cacheRead,
      cost,
      symbol,
    });
  }

  const totalCostStr = [...costByCurrency.entries()]
    .map(([currency, cost]) => currencySymbol[currency] + cost.toFixed(2))
    .join(' + ');

  const userName = getUserName(projectRoot);
  const claudeCodeVersion = getVersion();
  const now = new Date();
  const time = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const lines: string[] = [];

  // banner
  lines.push(center(''));
  lines.push(center('▐▛███▜▌'));
  lines.push(center('▝▜█████▛▘'));
  lines.push(center('▘▘ ▝▝'));
  lines.push(center('CLAUDE CODE'));
  lines.push(center(''));
  lines.push(center(''));
  lines.push(center(kv('DESK', branch)));
  lines.push(center(kv('CASHIER', claudeCodeVersion)));
  lines.push(center(kv('MEMBER', userName)));
  lines.push(center(kv('DATE', time)));
  lines.push(center(''));
  lines.push(center(sep()));

  for (const model of models) {
    lines.push(center(kv(model.name, model.symbol + model.cost.toFixed(2))));
    lines.push(center(dashedSep()));
    lines.push(center(kv('INPUT', formatNum(model.input))));
    lines.push(center(kv('OUTPUT', formatNum(model.output))));
    lines.push(center(kv('CACHE READ', formatNum(model.cacheRead))));
    lines.push(center(kv('CALLS', formatNum(model.count))));
    lines.push(center(sep()));
  }

  lines.push(center(kv('TOTAL', totalCostStr)));
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
