import { describe, test, expect, mock } from 'bun:test';

const mockGetOwner = mock(() =>
  Promise.resolve('myorg')
);
mock.module('../get-owner', () => ({
  getOwner: mockGetOwner,
}));

const mockGetRepo = mock(() =>
  Promise.resolve('myrepo')
);
mock.module('../get-repo', () => ({
  getRepo: mockGetRepo,
}));

const mockCreate = mock(() => Promise.resolve({ data: { html_url: 'https://github.com/myorg/myrepo/pull/1', number: 1 } }));
mock.module('../github-client', () => ({
  githubClient: {
    pulls: { create: mockCreate },
  },
}));

const { createPullRequest } = await import('../create-pull-request');

describe('createPullRequest', () => {
  test('调用 GitHub API 创建 PR', async () => {
    mockCreate.mockResolvedValueOnce({
      data: { html_url: 'https://github.com/myorg/myrepo/pull/42', number: 42 },
    });

    const result = await createPullRequest({
      sourceBranch: 'feature/test',
      targetBranch: 'main',
      content: { title: 'Test PR', description: 'PR description' },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      owner: 'myorg',
      repo: 'myrepo',
      head: 'feature/test',
      base: 'main',
      title: 'Test PR',
      body: 'PR description',
    });
    expect(result.html_url).toBe('https://github.com/myorg/myrepo/pull/42');
  });

  test('无法获取仓库信息时抛出错误', async () => {
    mockGetOwner.mockResolvedValueOnce(undefined as unknown as string);
    mockGetRepo.mockResolvedValueOnce(undefined as unknown as string);

    await expect(
      createPullRequest({
        sourceBranch: 'feature/test',
        targetBranch: 'main',
        content: { title: 'Test', description: '' },
      })
    ).rejects.toThrow('无法获取仓库信息');
  });
});
