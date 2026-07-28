/**
 * Shell command utility — drop-in replacement for Bun's $ template literal.
 *
 * Usage:
 *   import { sh } from '@cwkit/shared/utils/sh';
 *   const output = sh`git diff --name-only`.text();
 *   sh`git add -A`.quiet();
 *   const result = sh`git merge ${branch} --no-edit`.nothrow();
 *   if (result.exitCode !== 0) { ... }
 */
import { execSync, execFileSync, type SpawnSyncOptions } from 'node:child_process';

class ShellResult {
  stdout: string;
  exitCode: number;

  constructor(stdout: string, exitCode: number) {
    this.stdout = stdout;
    this.exitCode = exitCode;
  }

  text(): string {
    return this.stdout;
  }

  trim(): string {
    return this.stdout.trim();
  }

  quiet(): void {
    // output already captured, just discard
  }

  nothrow(): ShellResult {
    return this;
  }
}

/**
 * Tagged template literal for shell commands.
 * Mirrors Bun's $ API for minimal migration effort.
 */
export function sh(
  strings: TemplateStringsArray,
  ...values: unknown[]
): ShellResult {
  const encoding = 'utf-8' as const;

  if (values.length === 0) {
    // No interpolation — safe to use execSync directly
    const command = strings[0].trim();
    try {
      const stdout = execSync(command, { encoding, stdio: ['pipe', 'pipe', 'pipe'] });
      return new ShellResult(stdout, 0);
    } catch (e: any) {
      return new ShellResult(e.stdout ?? '', e.status ?? 1);
    }
  }

  // With interpolation — split into command + args for safe execution
  const firstPart = strings[0].trim();
  const tokens = firstPart.split(/\s+/).filter(Boolean);
  const cmd = tokens[0];
  const args: string[] = tokens.slice(1);

  for (let i = 0; i < values.length; i++) {
    args.push(String(values[i]));
    const nextPart = strings[i + 1].trim();
    if (nextPart) {
      args.push(...nextPart.split(/\s+/).filter(Boolean));
    }
  }

  try {
    const stdout = execFileSync(cmd, args, { encoding, stdio: ['pipe', 'pipe', 'pipe'] });
    return new ShellResult(stdout, 0);
  } catch (e: any) {
    return new ShellResult(e.stdout ?? '', e.status ?? 1);
  }
}
