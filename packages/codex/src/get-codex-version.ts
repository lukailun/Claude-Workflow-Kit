export function getCodexVersion(): string {
  return Bun.spawnSync(['codex', '--version']).stdout.toString().trim();
}
