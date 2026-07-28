import { sh } from '../utils/sh';

export function getUserName(cwd?: string): string {
  return sh`git config user.name`.text().trim();
}
