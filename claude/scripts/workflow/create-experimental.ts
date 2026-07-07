/**
 * 创建 experimental 分支的完整流程
 *
 * 用法：
 *   tsx create-experimental.ts                  # 从 Linear issues 中选择
 *   tsx create-experimental.ts <branch-name>   # 直接指定分支名称
 *
 * 示例：
 *   tsx create-experimental.ts 4t-9192
 */

import { createExperimentalBranch } from '@/gitlab/create-experimental-branch';
import { createBranchFromLinearWorkflow } from '@/workflow/create-branch-from-linear';

createBranchFromLinearWorkflow({
  emoji: '🧪',
  branchType: 'experimental',
  createBranch: createExperimentalBranch,
});
