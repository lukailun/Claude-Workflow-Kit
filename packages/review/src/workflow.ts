/**
 * Claude MR 代码审查脚本 — 完整 CI 工作流
 *
 * 包含环境检查、代码审核、发布评论、退出码处理。
 * 通过 ReviewPlatform 接口与平台交互，支持 GitLab/GitHub 等。
 */

import { DEFAULT_AI, type AI } from '@cwkit/ai/get-language-model';
import { codingRules } from './coding-standards/rules';
import { getReviewViolations } from './review';
import type { Violation, ViolationSeverity } from './types';
import type { ReviewPlatform } from './platform/types';

// ─── CI 环境变量 ───
const PROJECT_ID = parseInt(process.env.CI_MERGE_REQUEST_PROJECT_ID || '0', 10);
const MR_IID = parseInt(process.env.CI_MERGE_REQUEST_IID || '0', 10);
const MR_TITLE = process.env.CI_MERGE_REQUEST_TITLE || '';
const BASE_SHA = process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA || '';
const HEAD_SHA = process.env.CI_COMMIT_SHA || '';

const BLOCKING_SEVERITIES: readonly ViolationSeverity[] = ['error'];

/**
 * 前置环境变量检查
 */
function checkEnv(): void {
  const missing: string[] = [];
  if (!process.env.GITLAB_TOKEN) missing.push('GITLAB_TOKEN');
  if (!PROJECT_ID) missing.push('CI_MERGE_REQUEST_PROJECT_ID');
  if (!MR_IID) missing.push('CI_MERGE_REQUEST_IID');
  if (!BASE_SHA) missing.push('CI_MERGE_REQUEST_DIFF_BASE_SHA');

  if (missing.length > 0) {
    console.error(`❌ 缺少必需的环境变量：${missing.join(', ')}`);
    process.exit(1);
  }
}

/** 从命令行参数解析 --ai */
function parseAIFromArgs(): AI {
  const args = process.argv.slice(2);
  const aiIndex = args.indexOf('--ai');
  if (aiIndex !== -1 && args[aiIndex + 1]) {
    return args[aiIndex + 1] as AI;
  }
  return DEFAULT_AI;
}

/** 构建审查总结评论 */
function buildSummaryBody(violations: Violation[]): string {
  const errorCount = violations.filter((v) => v.severity === 'error').length;
  const warningCount = violations.filter(
    (v) => v.severity === 'warning'
  ).length;

  const lines = ['## 🔍 AI 代码审查结果', ''];

  if (errorCount > 0) {
    lines.push(`❌ **${errorCount} 个 error** — 需要修复后方可合并`);
  }
  if (warningCount > 0) {
    lines.push(`⚠️ **${warningCount} 个 warning** — 建议修复`);
  }
  if (violations.length === 0) {
    lines.push('✅ 未发现违规');
  }

  lines.push('');
  lines.push('---');
  lines.push('*由 AI 代码审查工具自动生成*');

  return lines.join('\n');
}

/**
 * 完整的 MR 代码审查工作流
 *
 * @param platform - 平台适配器（GitLab、GitHub 等）
 */
export async function runReview(platform: ReviewPlatform) {
  const ai = parseAIFromArgs();
  const errorRules = codingRules.error;
  const warningRules = codingRules.warning;

  console.log('=========================================');
  console.log(' 🔍 MR 代码审查');
  console.log('=========================================');
  console.log(`📦 项目：${PROJECT_ID}`);
  console.log(`📋 MR：!${MR_IID}`);
  console.log(`📝 标题：${MR_TITLE}`);
  console.log(
    `🔧 规则：${errorRules.length + warningRules.length} 条（${errorRules.length} error / ${warningRules.length} warning）`
  );
  console.log('-----------------------------------------');

  // 1. 环境检查
  checkEnv();

  const params = { projectId: PROJECT_ID, mrIid: MR_IID };

  // 2. 标记 review 开始：移除 👍/👎，添加 👀
  await platform.removeReaction(params, 'thumbsup');
  await platform.removeReaction(params, 'thumbsdown');
  await platform.addReaction(params, 'eyes');

  // 3. 获取 diff
  const diffText = await platform.getDiffText({
    ...params,
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: [
      'src/Assets/**',
      'src/Network/GeneratedApi.ts',
      'src/Network/GeneratedApiTypes.ts',
    ],
  });

  // 4. 执行审核
  console.log('\n🤖 开始 AI 审核...');
  const reviewReulst = await getReviewViolations({ diffText, ai });

  const violations = [...reviewReulst.errors, ...reviewReulst.warnings];

  // 5. 发布评论
  if (violations.length > 0) {
    console.log(
      `\n💬 发布 ${violations.length} 条（${reviewReulst.errors.length} error / ${reviewReulst.warnings.length} warning）审查评论...`
    );
    await platform.postReviewComments({
      ...params,
      baseSha: BASE_SHA,
      headSha: HEAD_SHA,
      summaryBody: buildSummaryBody(violations),
      comments: violations.map((violation) => ({
        filePath: violation.path,
        lineNumber: violation.line,
        body: `[${violation.rule}] ${violation.body}`,
      })),
    });
    console.log('  ✅ 评论发布完成');
  } else {
    console.log('\n✅ 未发现违规');
  }

  // 6. 标记 review 结束：移除 👀，根据结果添加 👍 或 👎
  await platform.removeReaction(params, 'eyes');
  if (violations.length === 0) {
    await platform.addReaction(params, 'thumbsup');
  } else if (violations.some((violation) => violation.severity === 'error')) {
    await platform.addReaction(params, 'thumbsdown');
  }

  // 7. 退出
  const hasBlocking = violations.some((violation) =>
    BLOCKING_SEVERITIES.includes(violation.severity)
  );

  console.log('\n=========================================');
  if (hasBlocking) {
    console.log(' ❌ 审查未通过');
    console.log('=========================================');
    process.exit(1);
  } else {
    console.log(' ✅ 审查通过');
    console.log('=========================================');
  }
}
