/**
 * review.ts 手动测试脚本
 *
 * 使用 bun 运行：bun run .claude/scripts/review/review.test.ts
 */

import type { AI } from '@/ai/get-language-model';
import { getReviewViolations } from '@/review/review';
import { diffs1 } from '@/review/test/diff';

// ── 硬编码参数 ─────────────────────────────────────────────────────────────────

const AI_PROVIDER: AI = 'openrouter';

// ── 运行 ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 开始代码审查 (AI: ${AI_PROVIDER})\n`);
  const result = await getReviewViolations({
    diffText: diffs1,
    ai: AI_PROVIDER,
  });

  console.log('\n\n── 审查结果 ──────────────────────────────────────────');
  console.log(`\n🔴 Errors (${result.errors.length}):`);
  for (const v of result.errors) {
    console.log(`  - [${v.rule}] ${v.path}:${v.line}`);
    console.log(`    ${v.body}\n`);
  }

  console.log(`🟡 Warnings (${result.warnings.length}):`);
  for (const v of result.warnings) {
    console.log(`  - [${v.rule}] ${v.path}:${v.line}`);
    console.log(`    ${v.body}\n`);
  }
}

main().catch(console.error);
