import { describe, test, expect, mock } from 'bun:test';

const mockGetCurrentBranch = mock(() => Promise.resolve(''));
mock.module('../../git/get-current-branch', () => ({
  getCurrentBranch: mockGetCurrentBranch,
}));

const mockGetRemoteBranches = mock(() => Promise.resolve<string[]>([]));
mock.module('../get-remote-branches', () => ({
  getRemoteBranches: mockGetRemoteBranches,
}));

const { getPullRequestTargetBranch } = await import(
  '../get-pull-request-target-branch'
);

describe('getPullRequestTargetBranch', () => {
  test('release 分支的目标是 main', async () => {
    mockGetCurrentBranch.mockResolvedValueOnce('release/2.0.0');

    const result = await getPullRequestTargetBranch();
    expect(result.fullName).toBe('main');
    expect(result.type).toBe('main');
  });

  test('hotfix 分支的目标是 main', async () => {
    mockGetCurrentBranch.mockResolvedValueOnce('hotfix/2.0.1');

    const result = await getPullRequestTargetBranch();
    expect(result.fullName).toBe('main');
    expect(result.type).toBe('main');
  });

  test('feature 分支的目标是最新的 release 分支', async () => {
    mockGetCurrentBranch.mockResolvedValueOnce('feature/new-ui');
    mockGetRemoteBranches.mockResolvedValueOnce([
      'main',
      'release/1.0.0',
      'release/2.3.0',
      'release/2.1.0',
    ]);

    const result = await getPullRequestTargetBranch();
    expect(result.fullName).toBe('release/2.3.0');
    expect(result.type).toBe('release');
  });

  test('没有 release 分支时回退到 main', async () => {
    mockGetCurrentBranch.mockResolvedValueOnce('feature/new-ui');
    mockGetRemoteBranches.mockResolvedValueOnce(['main']);

    const result = await getPullRequestTargetBranch();
    expect(result.fullName).toBe('main');
  });

  test('空分支名时返回 main', async () => {
    mockGetCurrentBranch.mockResolvedValueOnce('');

    const result = await getPullRequestTargetBranch();
    expect(result.fullName).toBe('main');
  });
});
