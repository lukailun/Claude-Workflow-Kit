import { describe, test, expect } from 'bun:test';

// 直接测试 URL 解析逻辑
function parseRemoteUrl(url: string): string | undefined {
  const match = url
    .trim()
    .match(/(?:git@[^:]+:|https?:\/\/[^/]+\/)(?:.+?\/)(.+?)(?:\.git)?$/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

describe('parseRemoteUrl (repo)', () => {
  test('解析 SSH 格式', () => {
    expect(parseRemoteUrl('git@github.com:myorg/myrepo.git')).toBe('myrepo');
  });

  test('解析 HTTPS 格式', () => {
    expect(parseRemoteUrl('https://github.com/myorg/myrepo.git')).toBe('myrepo');
  });

  test('解析不带 .git 后缀的 URL', () => {
    expect(parseRemoteUrl('git@github.com:myorg/myrepo')).toBe('myrepo');
  });

  test('无法解析时返回 undefined', () => {
    expect(parseRemoteUrl('invalid-url')).toBeUndefined();
  });

  test('处理尾部空格', () => {
    expect(parseRemoteUrl('git@github.com:org/repo.git  \n')).toBe('repo');
  });
});
