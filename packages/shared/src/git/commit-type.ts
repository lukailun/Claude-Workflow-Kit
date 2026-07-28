export const commitTypes = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'perf',
] as const;

export type CommitType = (typeof commitTypes)[number];
