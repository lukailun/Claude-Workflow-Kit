import { execSync } from 'node:child_process';

export function getClaudeCodeVersion(): string {
  return execSync('claude --version', { encoding: 'utf-8' }).trim();
}
