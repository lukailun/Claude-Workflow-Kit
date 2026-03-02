#!/usr/bin/env bun

/**
 * 获取特定合并请求的详细信息
 *
 * 功能：
 * 1. 接收 mergeRequestId 作为参数
 * 2. 使用 glab CLI 获取该合并请求的详细信息
 * 3. 输出详细信息到标准输出
 *
 * 使用方法：
 * bun run get-merge-request-details.ts <merge-request-id>
 *
 * 参数说明：
 * - merge-request-id: 合并请求的 ID（例如：123）
 */

async function getMergeRequestDetails() {
  try {
    const mergeRequestId = process.argv[2];

    if (!mergeRequestId) {
      console.error('[错误]: 未提供 merge-request-id 参数');
      console.error(
        '使用方法: bun run get-merge-request-details.ts <merge-request-id>'
      );
      process.exit(1);
    }

    const { stdout, stderr, exitCode } =
      await Bun.$`glab mr view ${mergeRequestId}`.quiet();

    if (exitCode !== 0) {
      console.error('[错误]: 运行 glab 命令失败');
      console.error(stderr.toString());
      process.exit(1);
    }

    console.log(stdout.toString());
  } catch (error) {
    console.error('[错误]: ', error);
    process.exit(1);
  }
}

getMergeRequestDetails();
