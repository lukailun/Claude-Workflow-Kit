import { describe, test, expect, mock } from 'bun:test';

// Mock modules
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

const mockPaginate = mock(() => Promise.resolve<unknown[]>([]));
const mockListTags = mock(() => ({}));
mock.module('../github-client', () => ({
  default: {
    paginate: mockPaginate,
    repos: { listTags: mockListTags },
  },
}));

const { default: getLatestTag } = await import('../get-latest-tag');

describe('getLatestTag', () => {
  test('返回版本号最大的 tag', async () => {
    mockPaginate.mockResolvedValueOnce([
      { name: 'v1.0.0' },
      { name: 'v2.3.0' },
      { name: 'v2.1.0' },
    ]);

    const result = await getLatestTag();
    expect(result).not.toBeNull();
    expect(result!.name).toBe('v2.3.0');
    expect(result!.major).toBe(2);
    expect(result!.minor).toBe(3);
    expect(result!.patch).toBe(0);
  });

  test('没有 tag 时返回 null', async () => {
    mockPaginate.mockResolvedValueOnce([]);

    const result = await getLatestTag();
    expect(result).toBeNull();
  });

  test('忽略不符合 vx.x.x 格式的 tag', async () => {
    mockPaginate.mockResolvedValueOnce([
      { name: 'latest' },
      { name: 'v1.0' },
      { name: 'release-1.0.0' },
    ]);

    const result = await getLatestTag();
    expect(result).toBeNull();
  });

  test('无法获取仓库信息时返回 null', async () => {
    mockGetOwner.mockResolvedValueOnce(undefined as unknown as string);
    mockGetRepo.mockResolvedValueOnce(undefined as unknown as string);

    const result = await getLatestTag();
    expect(result).toBeNull();
  });
});
