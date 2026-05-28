import { describe, test, expect, mock } from 'bun:test';

// Mock getRemoteBranches
const mockGetRemoteBranches = mock(() => Promise.resolve<string[]>([]));
mock.module('../get-remote-branches', () => ({
  default: mockGetRemoteBranches,
}));

const { default: getLatestReleaseBranch } = await import(
  '../get-latest-release-branch'
);

describe('getLatestReleaseBranch', () => {
  test('返回版本号最大的 release 分支', async () => {
    mockGetRemoteBranches.mockResolvedValueOnce([
      'main',
      'release/1.0.0',
      'release/2.3.0',
      'release/2.1.0',
      'feature/test',
    ]);

    const result = await getLatestReleaseBranch();
    expect(result).not.toBeNull();
    expect(result!.fullName).toBe('release/2.3.0');
    expect(result!.segment).toBe('2.3.0');
    expect(result!.major).toBe(2);
    expect(result!.minor).toBe(3);
    expect(result!.patch).toBe(0);
  });

  test('没有 release 分支时返回 null', async () => {
    mockGetRemoteBranches.mockResolvedValueOnce(['main', 'feature/test']);

    const result = await getLatestReleaseBranch();
    expect(result).toBeNull();
  });

  test('忽略不符合格式的分支', async () => {
    mockGetRemoteBranches.mockResolvedValueOnce([
      'release/invalid',
      'release/1.0',
      'release-2.0.0',
    ]);

    const result = await getLatestReleaseBranch();
    expect(result).toBeNull();
  });

  test('正确比较主版本号', async () => {
    mockGetRemoteBranches.mockResolvedValueOnce([
      'release/9.0.0',
      'release/10.0.0',
    ]);

    const result = await getLatestReleaseBranch();
    expect(result!.fullName).toBe('release/10.0.0');
  });
});
