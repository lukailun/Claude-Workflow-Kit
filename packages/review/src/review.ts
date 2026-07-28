/**
 * Claude MR 代码审查脚本 — 审核逻辑
 *
 * 负责调用 AI 对代码 diff 进行审核，返回违规项。
 * 不包含环境检查、评论发布等 CI 工作流逻辑。
 *
 * 每条规则单独发起一次 AI 请求，确保 AI 专注于单条规则的审查。
 */

import { readFileSync } from 'fs';
import { Output } from 'ai';
import z from 'zod';
import { generateObject } from '@lukailun/dev-kit/ai/generate-object';
import { getLanguageModel } from '@lukailun/dev-kit-workflow/get-language-model';
import type { AI } from '@lukailun/dev-kit/ai/language-model-types';
import { codingRules } from '@/coding-standards/rules';
import type { CodingRule } from '@/coding-standards/rules';
import { getReviewPrompt } from '@/prompt';
import type { Violation, ReviewResult } from '@/types';
import { retry } from '@lukailun/dev-kit/utils/retry';

const MAX_DIFF_LINES = 1000;

// ── Dynamic table display ─────────────────────────────────────────────────────

type RuleStatus = 'pending' | 'in_progress' | 'passed' | 'failed';

let allRules: CodingRule[] = [];
let ruleStatuses: RuleStatus[] = [];
let ruleViolations: number[] = [];
let ruleCategories: string[] = [];
let _tableMutex: Promise<void> = Promise.resolve();
function withTableLock(fn: () => void): Promise<void> {
  const next = _tableMutex.then(fn);
  _tableMutex = next.catch(() => {});
  return next;
}

// ── CJK-aware string width ──────────────────────────────────────────────────────

/** 计算字符串在终端的显示宽度（CJK 字符占 2 列） */
function strWidth(str: string): number {
  let w = 0;
  for (const ch of str) {
    const code = ch.codePointAt(0)!;
    // CJK Unified Ideographs + 扩展区 + 常见标点
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3000 && code <= 0x30ff) ||
      (code >= 0xff00 && code <= 0xffef) ||
      (code >= 0x3400 && code <= 0x4dbf)
    ) {
      w += 2;
    } else {
      w += 1;
    }
  }
  return w;
}

/** 将字符串填充到目标显示宽度 */
function padToWidth(str: string, target: number): string {
  const diff = target - strWidth(str);
  return diff > 0 ? str + ' '.repeat(diff) : str;
}

// ── Table rendering ─────────────────────────────────────────────────────────────

function showReviewTable(): void {
  const COL_RULE = 50;
  const COL_STATUS = 14;

  const statusTexts = allRules.map((_, i) => {
    const status = ruleStatuses[i];
    switch (status) {
      case 'pending':
        return '⬜ 待审核';
      case 'in_progress':
        return '🔄 审核中';
      case 'passed':
        return '✅ 已通过';
      case 'failed':
        return '❌ 未通过';
    }
  });

  const labels = allRules.map((rule, i) => {
    const cat = ruleCategories[i] ?? '';
    return cat ? `${cat}: ${rule.title}` : rule.title;
  });

  const border = `  ┌${'─'.repeat(COL_RULE)}┬${'─'.repeat(COL_STATUS)}┐`;
  const sep = `  ├${'─'.repeat(COL_RULE)}┼${'─'.repeat(COL_STATUS)}┤`;
  const bottom = `  └${'─'.repeat(COL_RULE)}┴${'─'.repeat(COL_STATUS)}┘`;

  const row = (col1: string, col2: string) =>
    `  │ ${padToWidth(col1, COL_RULE - 2)} │ ${padToWidth(col2, COL_STATUS - 2)} │`;

  const lines: string[] = ['', border, row('规则', '状态'), sep];

  for (let i = 0; i < allRules.length; i++) {
    lines.push(row(labels[i], statusTexts[i]));
  }

  lines.push(bottom);

  // 进度摘要
  const passed = ruleStatuses.filter((status) => status === 'passed').length;
  const failed = ruleStatuses.filter((status) => status === 'failed').length;
  const total = allRules.length;
  const remaining = total - passed - failed;
  if (remaining > 0) {
    lines.push(`  📋 进度：${passed + failed}/${total} 已完成`);
  }

  console.log(lines.join('\n'));
}

export interface ReviewOptions {
  diffText: string;
  ai: AI;
}

export async function getReviewViolations(
  options: ReviewOptions
): Promise<ReviewResult> {
  const { diffText, ai } = options;
  if (diffText.trim().length === 0) {
    return {
      errors: [],
      warnings: [],
    };
  }

  const diffLines = diffText.split('\n');
  const truncatedDiff = diffLines.slice(0, MAX_DIFF_LINES).join('\n');

  // 初始化表格状态
  const errorRules = codingRules.error;
  const warningRules = codingRules.warning;
  allRules = [...errorRules, ...warningRules];
  ruleStatuses = allRules.map(() => 'pending');
  ruleViolations = allRules.map(() => 0);
  ruleCategories = [
    ...errorRules.map(() => 'error'),
    ...warningRules.map(() => 'warning'),
  ];

  // 显示初始表格
  showReviewTable();

  const [errorViolations, warningViolations] = await Promise.all([
    reviewRuleGroup(truncatedDiff, codingRules.error, ai),
    reviewRuleGroup(truncatedDiff, codingRules.warning, ai),
  ]);

  return {
    errors: errorViolations,
    warnings: warningViolations,
  };
}

async function reviewRuleGroup(
  diffText: string,
  rules: CodingRule[],
  ai: AI
): Promise<Violation[]> {
  if (rules.length === 0) return [];
  const violations: Violation[] = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const globalIdx = allRules.indexOf(rule);
    if (globalIdx !== -1) {
      await withTableLock(() => {
        ruleStatuses[globalIdx] = 'in_progress';
        showReviewTable();
      });
    }
    const ruleViol = await reviewRule(diffText, rule, ai);
    violations.push(...ruleViol);
    if (globalIdx !== -1) {
      await withTableLock(() => {
        ruleViolations[globalIdx] = ruleViol.length;
        ruleStatuses[globalIdx] = ruleViol.length > 0 ? 'failed' : 'passed';
        showReviewTable();
      });
    }
  }
  return violations;
}

async function reviewRule(
  diffText: string,
  rule: CodingRule,
  ai: AI
): Promise<Violation[]> {
  const ruleContent = stripFrontmatter(readFileSync(rule.path, 'utf-8'));
  const prompt = getReviewPrompt(diffText, ruleContent);

  const model = await getLanguageModel(ai);
  const output = await retry(
    async () => {
      const { output } = await generateObject({
        model,
        thinking: true,
        instructions: prompt.instruction,
        prompt: prompt.prompt,
        maxOutputTokens: 16384,
        output: Output.object({
          schema: z.object({
            violations: z.array(
              z.object({
                path: z
                  .string()
                  .meta({ description: '文件路径（与 diff 中的路径一致）' }),
                line: z
                  .number()
                  .meta({ description: '行号（新文件中的行号，整数）' }),
                rule: z.enum([rule.ruleId]).meta({ description: '规则编号' }),
                severity: z.enum([rule.severity]),
                body: z
                  .string()
                  .meta({ description: '问题描述和修复建议（Markdown 格式）' }),
              })
            ),
          }),
        }),
      });
      return output;
    },
    { defaultValue: { violations: [] }, behavior: { type: 'exponentialDelayed', maxCount: 3, initial: 1, multiplier: 1 } }
  );

  return output.violations;
}

/** 去掉 Markdown 文件的 YAML frontmatter，返回正文部分 */
function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
}
