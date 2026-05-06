#!/usr/bin/env bun

/**
 * 生成当前分支的 Claude Code 用量收据，并评论到 Linear Issue
 *
 * 用法: bun .claude/scripts/test.ts [branch] [issueId]
 * 默认使用当前分支，issueId 默认为 4T-9567
 */

import { buildBranchReceiptWorkflow } from './workflow/build-branch-receipt';
import createLinearComment from './linear/create-linear-comment';
import getCurrentBranch from './gitlab/get-current-branch';

async function test() {
  try {
    const branch = process.argv[2] || (await getCurrentBranch());
    const issueId = process.argv[3] || '4T-9567';

    console.log(`分支: ${branch}`);
    console.log(`Issue: ${issueId}`);
    console.log('正在生成收据...\n');

    const receipt = await buildBranchReceiptWorkflow(branch);

    if (!receipt) {
      console.log('未生成收据（可能没有 Claude Code 使用记录）');
      return;
    }

    console.log(receipt);
    console.log('\n正在评论到 Linear...');

    const comment = await createLinearComment(
      issueId,
      '```\n' + receipt + '\n```'
    );

    if (comment) {
      console.log(`✅ 已评论到 ${issueId}`);
    } else {
      console.log('⚠️  评论创建失败');
    }
  } catch (error) {
    console.error('[错误]: ', error);
    process.exit(1);
  }
}

test().catch(console.error);
