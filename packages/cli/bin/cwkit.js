#!/usr/bin/env node

/**
 * cwkit CLI 入口（JavaScript 包装器）
 *
 * 使用 --import tsx 启动子进程来运行 TypeScript 入口文件，
 * 无需构建步骤即可直接运行 .ts 文件。
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// 从本包的 node_modules 解析 tsx 的绝对路径
let tsxSpecifier;
try {
  tsxSpecifier = require.resolve('tsx');
} catch {
  // 回退：直接使用 'tsx'，依赖 Node.js 的模块解析
  tsxSpecifier = 'tsx';
}

const entry = join(__dirname, '..', 'src', 'index.ts');

const child = spawn(
  process.execPath,
  ['--import', tsxSpecifier, entry, ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: process.env,
  },
);

child.on('exit', (code) => process.exit(code ?? 1));
