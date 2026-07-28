import { execSync } from 'node:child_process';

export function getCodexVersion(): string {
  return execSync('codex --version', { encoding: 'utf-8' }).trim();
}
