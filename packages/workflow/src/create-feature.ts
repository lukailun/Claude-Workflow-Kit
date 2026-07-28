/**
 * 创建 feature 分支的完整流程
 *
 * 用法：
 *   tsx create-feature.ts                  # 从 Linear issues 中选择
 *   tsx create-feature.ts <branch-name>    # 直接指定分支名称
 *
 * 示例：
 *   tsx create-feature.ts 4t-9192
 */

import { createFeatureBranch } from '@lukailun/dev-kit-gitlab/create-feature-branch';
import { createBranchFromLinearWorkflow } from '@/create-branch-from-linear';

createBranchFromLinearWorkflow({
  emoji: '🚀',
  branchType: 'feature',
  createBranch: createFeatureBranch,
});
