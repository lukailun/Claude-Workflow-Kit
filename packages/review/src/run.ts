/**
 * Claude MR 代码审查脚本 — CI 入口
 */

import { GitLabReviewPlatform } from './platform/gitlab';
import { runReview } from './workflow';

const platform = new GitLabReviewPlatform();
runReview(platform).catch((error) => {
  console.error('❌ 审查脚本执行失败:', error);
  process.exit(1);
});
