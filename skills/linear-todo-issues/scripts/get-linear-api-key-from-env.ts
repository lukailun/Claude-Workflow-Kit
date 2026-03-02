#!/usr/bin/env bun

/**
 * 从环境变量获取 Linear Api Key
 *
 * 功能：
 * 1. 从 .claude/.env 读取 LINEAR_API_KEY 环境变量
 * 2. 如果存在则输出该值
 * 3. 如果不存在则以非零状态码退出
 *
 * 使用方法：
 * bun run get-linear-api-key-from-env.ts
 */

import { config } from 'dotenv';

config({ path: '.claude/.env' });

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error('[错误]: 未配置 LINEAR_API_KEY 环境变量');
  console.error('请在 .claude/.env 文件中配置 LINEAR_API_KEY');
  process.exit(1);
}
console.log(apiKey);
