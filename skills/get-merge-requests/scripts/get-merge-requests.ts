#!/usr/bin/env bun

/**
 * 获取所有打开的合并请求
 *
 * 功能：
 * 1. 使用 glab CLI 获取所有打开的合并请求
 * 2. 输出合并请求列表到标准输出
 *
 * 使用方法：
 * bun run get-merge-requests.ts
 */

async function getMergeRequests() {
  try {
    const { stdout, stderr, exitCode } =
      await Bun.$`glab mr list --opened`.quiet();

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

getMergeRequests();
