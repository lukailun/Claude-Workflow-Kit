#!/usr/bin/env bun

/**
 * 从环境变量获取 Linear 用户邮箱
 *
 * 功能：
 * 1. 从 .claude/.env 读取 LINEAR_USER_EMAIL 环境变量
 * 2. 如果存在则输出该值
 * 3. 如果不存在则提示用户可以在配置文件中进行配置
 *
 * 使用方法：
 * bun run get-linear-user-email-from-env.ts
 */

import { config } from 'dotenv';

config({ path: '.claude/.env' });

const userEmail = process.env.LINEAR_USER_EMAIL;
if (userEmail) {
  console.log(userEmail);
} else {
  console.error('[提示]: 可配置 LINEAR_USER_EMAIL 环境变量作为默认用户');
  console.error('可在 .claude/.env 文件中配置 LINEAR_USER_EMAIL');
}
