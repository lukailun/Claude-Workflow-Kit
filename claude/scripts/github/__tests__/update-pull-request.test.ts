import { describe, test, expect, mock } from 'bun:test';

const mockGetOwner = mock(() =>
  Promise.resolve('myorg')
);
mock.module('../get-owner', () => ({
  default: mockGetOwner,
}));

const mockGetRepo = mock(() =>
  Promise.resolve('myrepo')
);
mock.module('../get-repo', () => ({
  default: mockGetRepo,
}));

const mockUpdate = mock(() => Promise.resolve({ data: { html_url: 'https://github.com/myorg/myrepo/pull/1' } }));
mock.module('../github-client', () => ({
  default: {
    pulls: { update: mockUpdate },
  },
}));

const { default: updatePullRequest } = await import('../update-pull-request');

describe('updatePullRequest', () => {
  test('调用 GitHub API 更新 PR', async () => {
    mockUpdate.mockResolvedValueOnce({
      data: { html_url: 'https://github.com/myorg/myrepo/pull/5' },
    });

    const result = await updatePullRequest({
      pullNumber: 5,
      content: { title: 'Updated PR', description: 'Updated description' },
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      owner: 'myorg',
      repo: 'myrepo',
      pull_number: 5,
      title: 'Updated PR',
      body: 'Updated description',
    });
    expect(result.html_url).toBe('https://github.com/myorg/myrepo/pull/5');
  });

  test('无法获取仓库信息时抛出错误', async () => {
    mockGetOwner.mockResolvedValueOnce(undefined as unknown as string);
    mockGetRepo.mockResolvedValueOnce(undefined as unknown as string);

    await expect(
      updatePullRequest({
        pullNumber: 1,
        content: { title: 'Test', description: '' },
      })
    ).rejects.toThrow('无法获取仓库信息');
  });
});
