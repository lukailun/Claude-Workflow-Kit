/**
 * 集成测试：使用真实 AI 生成 PR 标题和描述
 *
 * 运行方式：
 * bun test scripts/ai/__tests__/generate-merge-request-content.integration.test.ts
 */

import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { getAIProvider } from '@/ai/get-ai-provider';
import type { AIProvider } from '@/ai/types/ai-provider';

// Mock GitHub API
const mockGetRepositoryCompare = mock(() => Promise.resolve({ commits: [], files: [] }));
mock.module('@/github', () => ({
  getRepositoryCompare: mockGetRepositoryCompare,
}));

const { generateMergeRequestContent } = await import('../generate-merge-request-content');

describe('generateMergeRequestContent - AI 生成结果观察', () => {
  let aiProvider: AIProvider;

  beforeEach(async () => {
    mockGetRepositoryCompare.mockClear();
    aiProvider = await getAIProvider();
  });

  test('观察 AI 生成的 PR 内容', async () => {
    mockGetRepositoryCompare.mockResolvedValueOnce({
      commits: [
        { sha: 'a1b2c3d4e5f6', commit: { message: 'feat: 添加用户认证功能' } },
        { sha: 'b2c3d4e5f6g7', commit: { message: 'fix: 修复登录页面样式问题' } },
        { sha: 'c3d4e5f6g7h8', commit: { message: 'refactor: 重构数据库连接模块' } },
      ],
      files: [
        { filename: 'src/auth/login.ts', status: 'added' },
        { filename: 'src/auth/register.ts', status: 'added' },
        { filename: 'src/styles/login.css', status: 'modified' },
        { filename: 'src/db/connection.js', status: 'modified' },
        { filename: 'src/utils/old-helpers.ts', status: 'removed' },
      ],
    } as any);

    const result = await generateMergeRequestContent({
      aiProvider,
      sourceBranch: 'feature/user-auth',
      targetBranch: 'main',
    });

    console.log('\n========== AI 生成结果 ==========');
    console.log('标题:', result?.title);
    console.log('\n描述:\n', result?.description);
    console.log('==================================\n');

    expect(result).toBeDefined();
    expect(result!.title).toBeTruthy();
    expect(result!.description).toBeTruthy();
  }, 60000);
});
