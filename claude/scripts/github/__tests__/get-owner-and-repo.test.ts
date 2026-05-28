import { describe, test, expect } from 'bun:test';

// 直接测试 URL 解析逻辑，不依赖 bun shell
function parseRemoteUrl(url: string): { owner: string; repo: string } | undefined {
  const match = url
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(.+?)\/(.+?)(?:\.git)?$/);
  if (!match) {
    return undefined;
  }
  return { owner: match[1], repo: match[2] };
}

describe('parseRemoteUrl', () => {
  test('解析 SSH 格式', () => {
    expect(parseRemoteUrl('git@github.com:myorg/myrepo.git')).toEqual({
      owner: 'myorg',
      repo: 'myrepo',
    });
  });

  test('解析 HTTPS 格式', () => {
    expect(parseRemoteUrl('https://github.com/myorg/myrepo.git')).toEqual({
      owner: 'myorg',
      repo: 'myrepo',
    });
  });

  test('解析不带 .git 后缀的 URL', () => {
    expect(parseRemoteUrl('git@github.com:myorg/myrepo')).toEqual({
      owner: 'myorg',
      repo: 'myrepo',
    });
  });

  test('解析 GitHub SSH URL', () => {
    expect(parseRemoteUrl('git@github.com:anthropics/claude-code.git')).toEqual({
      owner: 'anthropics',
      repo: 'claude-code',
    });
  });

  test('无法解析时返回 undefined', () => {
    expect(parseRemoteUrl('invalid-url')).toBeUndefined();
  });

  test('处理尾部空格', () => {
    expect(parseRemoteUrl('git@github.com:org/repo.git  \n')).toEqual({
      owner: 'org',
      repo: 'repo',
    });
  });
});
