/**
 * Claude MR 代码审查脚本 — CI 入口
 */

import { runReview } from './workflow';

runReview().catch((error) => {
  console.error('❌ 审查脚本执行失败:', error);
  process.exit(1);
});
