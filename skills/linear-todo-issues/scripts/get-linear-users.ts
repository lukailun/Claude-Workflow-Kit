#!/usr/bin/env bun

/**
 * 获取 Linear 所有用户
 *
 * 功能：
 * 1. 从 Linear 获取所有用户
 * 2. 如果存在则输出该值
 * 3. 如果不存在则以非零状态码退出
 *
 * 使用方法：
 * bun run get-linear-users.ts
 */

import { LinearClient } from '@linear/sdk';

try {
  const apiKey = process.argv[2];

  if (!apiKey) {
    console.error('[错误]: 未配置 LINEAR_API_KEY 环境变量');
    console.error('请在 .claude/.env 文件中配置 LINEAR_API_KEY');
    process.exit(1);
  }

  const client = new LinearClient({ apiKey });
  const usersConnection = await client.users();
  const users = usersConnection.nodes;

  console.log(JSON.stringify(users));
} catch (error) {
  console.error('[错误]: ', error);
  process.exit(1);
}
