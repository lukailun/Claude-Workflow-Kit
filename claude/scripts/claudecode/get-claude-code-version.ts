export function getClaudeCodeVersion(): string {
  return Bun.spawnSync(['claude', '--version']).stdout.toString().trim();
}
