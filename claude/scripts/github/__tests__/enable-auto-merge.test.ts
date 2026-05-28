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

const mockMerge = mock(() => Promise.resolve({ data: {} }));
mock.module('../github-client', () => ({
  default: {
    pulls: { merge: mockMerge },
  },
}));

const { default: enableAutoMerge } = await import('../enable-auto-merge');

describe('enableAutoMerge', () => {
  test('调用 GitHub API 合并 PR', async () => {
    await enableAutoMerge({ pullNumber: 10 });

    expect(mockMerge).toHaveBeenCalledWith({
      owner: 'myorg',
      repo: 'myrepo',
      pull_number: 10,
      merge_method: 'squash',
      commit_title: 'Merge pull request #10',
    });
  });

  test('无法获取仓库信息时抛出错误', async () => {
    mockGetOwner.mockResolvedValueOnce(undefined as unknown as string);
    mockGetRepo.mockResolvedValueOnce(undefined as unknown as string);

    await expect(enableAutoMerge({ pullNumber: 1 })).rejects.toThrow(
      '无法获取仓库信息'
    );
  });
});
